import 'dotenv/config';

import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { convertToModelMessages, jsonSchema, stepCountIs, streamText, tool } from 'ai';
import express from 'express';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();

const port = Number(process.env.PLAYGROUND_API_PORT ?? 8787);
const host = process.env.PLAYGROUND_API_HOST ?? '127.0.0.1';
const baseURL = process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434/v1';
const modelId = process.env.OLLAMA_MODEL ?? 'qwen3:4b';
const chatStorePath =
  process.env.PLAYGROUND_CHAT_STORE ?? fileURLToPath(new URL('./chat-store.json', import.meta.url));

const ollama = createOpenAICompatible({
  name: 'ollama',
  baseURL,
  apiKey: process.env.OLLAMA_API_KEY,
});

const tools = {
  getWeather: tool({
    description:
      'Get deterministic test weather for a city. Use this when the user asks about weather or asks to test a tool call.',
    needsApproval: true,
    inputSchema: jsonSchema({
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'The city to get test weather for.',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The temperature unit to return.',
        },
      },
      required: ['city'],
      additionalProperties: false,
    }),
    execute: async ({ city, unit = 'celsius' }) => {
      const normalizedCity = String(city).trim() || 'Unknown';
      const celsius = 18 + (normalizedCity.length % 8);
      const temperature = unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : celsius;

      return {
        city: normalizedCity,
        unit,
        temperature,
        condition: 'partly cloudy',
        source: 'playground-test-tool',
        generatedAt: new Date().toISOString(),
      };
    },
  }),
};

app.use(express.json({ limit: '1mb' }));

async function readPersistedMessages() {
  try {
    const data = await readFile(chatStorePath, 'utf8');
    const parsed = JSON.parse(data);

    return Array.isArray(parsed.messages) ? parsed.messages : [];
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writePersistedMessages(messages) {
  await mkdir(dirname(chatStorePath), { recursive: true });
  await writeFile(chatStorePath, JSON.stringify({ messages }, null, 2), 'utf8');
}

function getLatestUserText(messages) {
  const latestMessage = messages.at(-1);

  if (latestMessage?.role !== 'user' || !Array.isArray(latestMessage.parts)) {
    return '';
  }

  return latestMessage.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n');
}

function isToolPart(part) {
  return (
    typeof part.type === 'string' && (part.type === 'dynamic-tool' || part.type.startsWith('tool-'))
  );
}

function isResumingAfterToolApproval(messages) {
  const latestMessage = messages.at(-1);

  if (latestMessage?.role !== 'assistant' || !Array.isArray(latestMessage.parts)) {
    return false;
  }

  return latestMessage.parts.some(
    (part) =>
      isToolPart(part) &&
      part.state === 'approval-responded' &&
      part.approval?.approved !== undefined,
  );
}

app.get('/api/health', (_req, res) => {
  res.json({
    provider: 'ollama',
    baseURL,
    model: modelId,
  });
});

app.get('/api/chat', async (_req, res) => {
  try {
    res.json({
      messages: await readPersistedMessages(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to load persisted chat.',
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      res.status(400).json({ error: 'Expected request body to include messages.' });
      return;
    }

    await writePersistedMessages(messages);

    const latestUserText = getLatestUserText(messages);
    const shouldForceTool = /\b(force|test|use)\b[\s\S]*\btool\b/i.test(latestUserText);
    const isApprovalResume = isResumingAfterToolApproval(messages);
    const result = streamText({
      model: ollama(modelId),
      system:
        'You are helping test an Angular AI component library. Keep responses concise. If the user asks to test tools or asks about weather, call the getWeather tool. After a tool result is available, answer from that result instead of calling the same tool again.',
      messages: await convertToModelMessages(messages),
      tools,
      toolChoice: isApprovalResume
        ? 'none'
        : shouldForceTool
          ? { type: 'tool', toolName: 'getWeather' }
          : 'auto',
      prepareStep({ stepNumber }) {
        if (isApprovalResume || stepNumber > 0) {
          return {
            activeTools: [],
            toolChoice: 'none',
          };
        }

        return undefined;
      },
      stopWhen: stepCountIs(3),
    });

    const response = result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onFinish(event) {
        return writePersistedMessages(event.messages);
      },
      onError(error) {
        console.error(error);
        return 'The local model failed to generate a response.';
      },
    });

    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body == null) {
      res.end();
      return;
    }

    for await (const chunk of response.body) {
      res.write(Buffer.from(chunk));
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to stream from Ollama.',
    });
  }
});

app.listen(port, host, () => {
  console.log(`Playground API listening on http://${host}:${port} using ${modelId}`);
});

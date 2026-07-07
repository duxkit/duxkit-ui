# duxkit-ai

Angular AI UI primitives for AI SDK interfaces.

Use it to compose chat, generated output, tool calls, reasoning, approvals, sources, attachments, and prompt input in Angular applications.

## Install

```bash
pnpm add duxkit-ai
```

## Peer Dependencies

This package currently targets:

| Package | Supported range |
| --- | --- |
| Angular | `^22.0.4` |
| Angular CDK | `>=22.0.2 <23.0.0` |
| `@ai-sdk/angular` | `^2.0.208` |
| `ai` | `^6.0.207` |
| Tailwind CSS | `>=4.0.0` |
| Spartan Brain | `^1.0.2` |
| `@ng-icons/core` / `@ng-icons/lucide` | `>=33.3.0 <34.0.0` |

## Configure Styles

Angular applications using Tailwind CSS v4 need `@tailwindcss/postcss` in PostCSS config:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Add Tailwind layers and the Spartan preset to the app stylesheet:

```scss
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css';
@import '@spartan-ng/brain/hlm-tailwind-preset.css';

@source '../node_modules/duxkit-ai';
```

The `@source` path should be relative to your stylesheet. It lets Tailwind CSS v4 scan the
published Duxkit AI package for utility classes.

## Minimal Usage

```ts
import { Component } from '@angular/core';
import { Conversation, ConversationContent } from 'duxkit-ai/conversation';
import { Message, MessageContent } from 'duxkit-ai/message';

@Component({
  selector: 'app-chat',
  imports: [Conversation, ConversationContent, Message, MessageContent],
  template: `
    <ai-conversation>
      <ai-conversation-content>
        <ai-message from="assistant">
          <ai-message-content>Hello from DuxKit AI.</ai-message-content>
        </ai-message>
      </ai-conversation-content>
    </ai-conversation>
  `,
})
export class ChatComponent {}
```

## Entrypoints

```ts
import { ChainOfThought } from 'duxkit-ai/chain-of-thought';
import { Conversation } from 'duxkit-ai/conversation';
import { Message, MessageContent } from 'duxkit-ai/message';
import { ModelSelector } from 'duxkit-ai/model-selector';
import { PromptInput } from 'duxkit-ai/prompt-input';
import { ReasoningContent } from 'duxkit-ai/reasoning';
import { Tool } from 'duxkit-ai/tool';
```

The root `duxkit-ai` entrypoint also exports all primitives for compatibility and quick starts, but family entrypoints are preferred in applications.

## Optional Context Cost Estimation

The context primitive renders token usage by default. Cost estimation is opt-in so apps only install
pricing libraries when they need them.

```bash
npm install tokenlens
```

```ts
import { AI_CONTEXT_COST_CALCULATOR } from 'duxkit-ai/context';
import { getUsage } from 'tokenlens';

export const appConfig = {
  providers: [
    {
      provide: AI_CONTEXT_COST_CALCULATOR,
      useValue: ({ modelId, kind, tokens }) => {
        if (kind === 'input') {
          return getUsage({ modelId, usage: { input: tokens.inputTokens, output: 0 } }).costUSD
            ?.totalUSD;
        }

        if (kind === 'output') {
          return getUsage({ modelId, usage: { input: 0, output: tokens.outputTokens } }).costUSD
            ?.totalUSD;
        }

        return getUsage({
          modelId,
          usage: {
            input: tokens.inputTokens,
            output: tokens.outputTokens,
            reasoningTokens: tokens.reasoningTokens,
            cacheReads: tokens.cacheReadTokens,
          },
        }).costUSD?.totalUSD;
      },
    },
  ],
};
```

## Use With AI SDK Streams

Use `@ai-sdk/angular` for chat state and streaming, then render messages with DuxKit AI primitives. Provider credentials should stay on your server or API route, not in browser code.

```ts
import { Chat } from '@ai-sdk/angular';

export class ChatState {
  readonly chat = new Chat({});
}
```

## Docs

Full docs and examples: <https://duxkit.com>

## Stability

`duxkit-ai` is pre-1.0. Breaking changes may happen before a stable release and will be documented in the changelog where practical.

## Workspace Development

Build from the workspace root:

```bash
pnpm build:lib
```

The package exposes the primary `duxkit-ai` entrypoint.

Generated Spartan HLM primitives are private workspace UI code and are not published by `duxkit-ai`.

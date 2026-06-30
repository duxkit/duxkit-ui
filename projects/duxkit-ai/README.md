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
```

## Minimal Usage

```ts
import { Component } from '@angular/core';
import { Conversation, ConversationContent, Message, MessageContent } from 'duxkit-ai';

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

## Core Imports

```ts
import {
  ChainOfThought,
  Conversation,
  Message,
  MessageContent,
  ModelSelector,
  PromptInput,
  ReasoningContent,
  Tool,
} from 'duxkit-ai';
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

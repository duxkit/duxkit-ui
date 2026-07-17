# DuxKit

Angular primitives and a source installer for building chat, agent, tool-call, reasoning, and
generated-output interfaces with the AI SDK.

DuxKit is composable UI infrastructure rather than a chat application, backend framework, or
provider SDK. It currently targets Angular 22+, `@ai-sdk/angular` 2+, and AI SDK 6+.

Documentation and examples are available at [duxkit.com](https://duxkit.com).

## Packages

- [`duxkit-ai`](projects/duxkit-ai/README.md) — packaged Angular AI UI primitives
- [`@duxkit/ui`](projects/cli/README.md) — CLI for installing primitive source into an application

Both packages are published to npm.

## Install the library

```bash
pnpm add duxkit-ai
```

Import primitives from their family entrypoints:

```ts
import { Conversation, ConversationContent } from 'duxkit-ai/conversation';
import { Message, MessageContent } from 'duxkit-ai/message';
```

```html
<ai-conversation>
  <ai-conversation-content>
    <ai-message from="assistant">
      <ai-message-content>Hello from DuxKit AI.</ai-message-content>
    </ai-message>
  </ai-conversation-content>
</ai-conversation>
```

The root entrypoint only contains shared AI SDK types. Using family entrypoints keeps application
bundles focused and ensures each Angular primitive has one dependency-injection identity.

## Install source with the CLI

```bash
pnpm dlx @duxkit/ui@latest init
pnpm dlx @duxkit/ui@latest add
pnpm dlx @duxkit/ui@latest add conversation message prompt-input
```

Running `add` without names opens an interactive component picker.

See the [CLI README](projects/cli/README.md) for configuration and command options.

## Consumer styling

DuxKit uses Tailwind CSS v4 and the Spartan Tailwind preset. Add the Tailwind PostCSS plugin:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Then include the layers, preset, and published package in the application stylesheet:

```scss
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css';
@import '@spartan-ng/brain/hlm-tailwind-preset.css';

@source '../node_modules/duxkit-ai';
```

The `@source` path is relative to the consumer stylesheet.

## Repository

```text
projects/
  cli/         @duxkit/ui source installer
  duxkit-ai/   publishable Angular library
  ui/          private Helm primitives used by workspace applications
  www/         documentation site
```

Use the pinned Node version and pnpm:

```bash
nvm use
pnpm install
```

Common commands:

```bash
pnpm start
pnpm test:ci
pnpm build
pnpm build:storybook
pnpm docs:generate-metadata
```

Library output is written to `dist/duxkit-ai`, CLI output to `dist/cli`, and the documentation site
to `dist/www`.

## Published library entrypoints

```text
duxkit-ai/attachment
duxkit-ai/chain-of-thought
duxkit-ai/checkpoint
duxkit-ai/code-block
duxkit-ai/confirmation
duxkit-ai/context
duxkit-ai/conversation
duxkit-ai/markdown
duxkit-ai/message
duxkit-ai/model-selector
duxkit-ai/prompt-input
duxkit-ai/queue
duxkit-ai/reasoning
duxkit-ai/reasoning-effort
duxkit-ai/shimmer
duxkit-ai/sources
duxkit-ai/task
duxkit-ai/tool
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. When component APIs change,
regenerate the checked-in docs metadata:

```bash
pnpm docs:generate-metadata
```

Run the release-level checks before submitting:

```bash
pnpm check:conventions
pnpm test:ci
pnpm build
pnpm build:storybook
```

## License

MIT

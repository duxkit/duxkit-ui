# DuxKit AI

Angular AI UI primitives built on the Vercel AI SDK, Angular signals, Spartan UI, Tailwind CSS, and Nx.

This repository is an Nx workspace containing the publishable component library, a local playground, and a starter marketing/docs site.

## Workspace

```text
projects/
  duxkit-ai/   # publishable Angular library
  playground/       # local app for testing chat, tools, reasoning, and streaming UI
  www/              # marketing/docs site
```

Nx project names:

```bash
pnpm nx show projects
```

Expected projects:

```text
duxkit-ai
playground
www
```

## Stack

- Angular 22
- Nx 23
- `@ai-sdk/angular` and `ai`
- Spartan `@spartan-ng/brain`
- Spartan Helm generated secondary entrypoints
- Tailwind CSS v4
- `@tailwindcss/postcss`
- Storybook 10
- Vitest through the Angular test builder

## Node And Install

Use the pinned Node version before running workspace commands:

```bash
nvm use
pnpm install
```

The repo currently expects Node `24.15.0`, from `.nvmrc`.

If a host shell overrides `node`, use:

```bash
unset npm_config_prefix
source ~/.nvm/nvm.sh
export PATH="$(dirname "$(nvm which 24.15.0)"):$PATH"
```

## Common Commands

Run the playground:

```bash
pnpm start:playground
```

This starts both the local Express API and the Angular playground. Use `pnpm start` only when you want the Angular playground dev server without the API process.

Run the marketing/docs site:

```bash
pnpm start:www
```

Run Storybook:

```bash
pnpm storybook
```

Default local ports:

```text
playground Angular app: http://localhost:4200
playground API:         http://localhost:8787
www Angular app:        http://localhost:4200
storybook:              http://localhost:6006
```

Build everything:

```bash
pnpm build
```

Build individual projects:

```bash
pnpm build:lib
pnpm build:playground
pnpm build:www
pnpm build:storybook
```

Run tests:

```bash
pnpm test:ci
```

Inspect the Nx graph:

```bash
pnpm nx graph
pnpm nx graph --file=tmp/nx-graph.json
```

Run a direct Nx target:

```bash
pnpm nx build duxkit-ai
pnpm nx serve playground
pnpm nx serve www
pnpm nx run duxkit-ai:storybook
```

## Build Notes

`playground` imports from the package name:

```ts
import { Conversation, Message, MessageContent } from 'duxkit-ai';
```

That is intentional. The playground should exercise the library like a consumer would. The `playground` Nx project has an implicit dependency on `duxkit-ai`, so workspace builds build the library before the playground.

Library output is written to:

```text
dist/duxkit-ai
```

App outputs are written to:

```text
dist/playground
dist/www
```

Storybook output is written to:

```text
dist/storybook/duxkit-ai
```

Current non-blocking warnings you may see:

- The playground production bundle is over its warning budget.
- Storybook emits CommonJS and asset-size warnings.
- Some Nx, Storybook, or Spartan peer ranges may lag Angular 22 even when builds pass.

## Library Entrypoints

Primary package:

```ts
import {
  ChainOfThought,
  Conversation,
  Message,
  MessageContent,
  ReasoningContent,
  Tool,
} from 'duxkit-ai';
```

Private app UI primitives:

```ts
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmTabs } from '@duxkit/ui/helm/tabs';
import { HlmNavigationMenu } from '@duxkit/ui/helm/navigation-menu';
```

These imports are for workspace apps only. They are not part of the published `duxkit-ai` package.

The public API surface lives in:

```text
projects/duxkit-ai/src/public-api.ts
```

## Spartan And Tailwind Setup

The playground is initialized with the Spartan Tailwind preset and theme in:

```text
projects/playground/src/styles.scss
```

Consumers of the package need Tailwind CSS v4, the Tailwind PostCSS plugin, and the Spartan preset. Angular's Tailwind setup expects a PostCSS config for Tailwind v4:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

The app stylesheet should include Tailwind layers and the Spartan preset:

```scss
@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css';
@import '@spartan-ng/brain/hlm-tailwind-preset.css';
```

The Spartan preset already imports `tw-animate-css` and the Angular CDK overlay stylesheet.

## Generate More Helm Components

The Spartan CLI is configured by `components.json` to generate Helm entrypoints under:

```text
projects/ui/helm
```

Generate only the primitives the workspace apps actually need:

```bash
pnpm exec nx g @spartan-ng/cli:ui navigation-menu --interactive=false
pnpm exec nx g @spartan-ng/cli:ui button --interactive=false
pnpm exec nx g @spartan-ng/cli:ui tabs --interactive=false
```

## Playground With Ollama

The playground uses a local Express API so provider calls stay out of the Angular browser bundle. By default it targets Ollama's OpenAI-compatible endpoint:

```text
http://127.0.0.1:11434/v1
```

Install and start Ollama, then pull a model:

```bash
ollama pull qwen3:4b
```

Run the Angular app and playground API together:

```bash
pnpm start:playground
```

Override the local model with environment variables:

```bash
OLLAMA_MODEL=llama3.2 pnpm start:playground
```

The Angular app calls `/api/chat`; `projects/playground/proxy.conf.json` forwards that to the Express server on port `8787`.

## Website

The `www` app is the starter marketing/docs site.

```bash
pnpm start:www
pnpm build:www
```

Source files:

```text
projects/www/src/app
```

## Docs And Metadata

When adding a new component to the docs, follow:

```text
docs/adding-component-docs.md
```

The docs registry, examples, previews, and generated API metadata are checked in under:

```text
projects/www/src/app/docs
projects/www/src/app/docs/component-api-metadata.generated.ts
```

When changing component APIs, regenerate `component-api-metadata.generated.ts` and verify the docs search index:

```bash
pnpm docs:generate-metadata
pnpm exec vitest run projects/www/src/app/docs/docs-search.spec.ts --environment jsdom
```

Input and output descriptions in the API tables are generated from JSDoc comments on the source `input()` and `output()` properties.

Run the docs site locally or build it with:

```bash
pnpm start:www
pnpm build:www
```

Storybook examples are separate from the `www` docs pages:

```bash
pnpm storybook
pnpm build:storybook
```

## Before Committing

Run:

```bash
pnpm build
pnpm test:ci
pnpm build:storybook
```

For a faster library-only check:

```bash
pnpm build:lib
pnpm nx test duxkit-ai -- --watch=false
```

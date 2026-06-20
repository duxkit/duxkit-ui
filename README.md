# Angular AI SDK Kit

Angular AI UI primitives built on the Vercel AI SDK and Spartan UI.

This package is set up as a normal Angular library with Spartan Helm generated as package secondary entrypoints. The first component work should build on these generated Helm exports instead of copying ad-hoc button/input/avatar code into each AI component.

## Stack

- Angular 22
- `@ai-sdk/angular` and `ai`
- Spartan `@spartan-ng/brain`
- Spartan Helm generated entrypoints
- Tailwind CSS v4
- `@tailwindcss/postcss`
- Vitest through the Angular test builder

## Node

Use the pinned Node version before running Angular or Spartan commands:

```bash
nvm use
```

If the host shell overrides `node`, use:

```bash
unset npm_config_prefix
source ~/.nvm/nvm.sh
export PATH="$(dirname $(nvm which 24.15.0)):$PATH"
```

## Library Entrypoints

Primary package:

```ts
import { AiChatStatus, AiMessage, AiMessagePart } from 'ai-sdk-angular';
```

Generated Spartan Helm entrypoints:

```ts
import { HlmButton } from 'ai-sdk-angular/helm/button';
import { HlmInput } from 'ai-sdk-angular/helm/input';
import { HlmTextarea } from 'ai-sdk-angular/helm/textarea';
import { HlmAvatar } from 'ai-sdk-angular/helm/avatar';
import { HlmTooltip } from 'ai-sdk-angular/helm/tooltip';
import { provideSpartanHlm } from 'ai-sdk-angular/helm/utils';
```

## Spartan Setup

The playground is initialized with the Spartan Tailwind preset and zinc theme in:

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
projects/ai-sdk-angular/helm
```

Generate only the primitives the AI components actually need:

```bash
pnpm exec ng g @spartan-ng/cli:ui button --interactive=false
pnpm exec ng g @spartan-ng/cli:ui input --interactive=false
pnpm exec ng g @spartan-ng/cli:ui textarea --interactive=false
pnpm exec ng g @spartan-ng/cli:ui avatar --interactive=false
pnpm exec ng g @spartan-ng/cli:ui tooltip --interactive=false
```

If the generated primitive should be published, add an `ng-package.json` beside it with:

```json
{
  "lib": {
    "entryFile": "src/index.ts"
  }
}
```

## Commands

```bash
pnpm build:lib
pnpm build:playground
pnpm test:ci
```

`pnpm build:lib` should emit the primary package plus the Helm secondary entrypoints under `dist/ai-sdk-angular`.

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

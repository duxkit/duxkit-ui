# DuxKit primitive source

This workspace project is the canonical source for DuxKit's Angular AI UI primitives.

It is not published to npm and is not intended for direct consumer installation. The published
[`@duxkit/ui`](https://www.npmjs.com/package/@duxkit/ui) CLI derives its packaged templates from
this source, then writes editable Angular files into consumer applications.

## Responsibilities

This project owns:

- primitive components, directives, helpers, types, and styles
- focused family entrypoints used by workspace builds and validation
- unit tests and Storybook stories
- the source inventory synchronized into the CLI package

Consumer installation, workspace detection, dependency planning, and generated-file safety belong
to [`projects/cli`](../cli/README.md).

## Primitive families

```text
attachment
chain-of-thought
checkpoint
code-block
confirmation
context
conversation
markdown
message
model-selector
prompt-input
queue
reasoning
reasoning-effort
shimmer
sources
task
tool
```

The root workspace entrypoint exports shared AI SDK types only. Primitive code is exposed to other
workspace projects through focused entrypoints such as `duxkit-ai/conversation` and
`duxkit-ai/prompt-input`.

## Compatibility

| Dependency                            | Supported range    |
| ------------------------------------- | ------------------ |
| Angular                               | `^22.0.4`          |
| Angular CDK                           | `>=22.0.2 <23.0.0` |
| `@ai-sdk/angular`                     | `^2.0.208`         |
| AI SDK (`ai`)                         | `^6.0.207`         |
| Tailwind CSS                          | `>=4.0.0`          |
| Spartan Brain                         | `^1.0.2`           |
| `@ng-icons/core` / `@ng-icons/lucide` | `>=33.3.0 <34.0.0` |

## Workspace development

Run commands from the workspace root:

```bash
pnpm build:lib
pnpm exec nx test duxkit-ai -- --watch=false
pnpm build:storybook
pnpm check:package-entrypoints
```

After changing primitive source or file inventories, synchronize and validate the CLI templates:

```bash
pnpm cli:sync-templates
pnpm cli:check-templates
pnpm build:cli
pnpm smoke:cli
```

When a public API changes, regenerate the checked-in documentation metadata:

```bash
pnpm docs:generate-metadata
```

## Consumer workflow

Consumers install primitives through the CLI:

```bash
pnpm dlx @duxkit/ui@latest init
pnpm dlx @duxkit/ui@latest add conversation message prompt-input
```

Generated files are application-owned and should be imported from the local library path configured
in `duxkit-ai.json`.

## Stability

The primitive APIs and generated source are pre-1.0. Breaking changes may happen before a stable
release and will be documented in the changelog where practical.

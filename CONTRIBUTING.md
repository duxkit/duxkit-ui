# Contributing

Thanks for taking the time to improve DuxKit AI. This project is early, pre-1.0, and maintained on a best-effort basis.

## Project Layout

```text
projects/duxkit-ai/   publishable Angular library
projects/cli/         Duxkit UI CLI package published as @duxkit/ui
projects/www/         docs and marketing site
projects/playground/  local AI SDK playground
projects/ui/          private Spartan Helm workspace primitives
```

The public library API is exported from `projects/duxkit-ai/src/public-api.ts`. Private workspace UI imports under `@duxkit-private/ui/*` are not part of the published package.

## Setup

Use the pinned Node version and install with pnpm:

```bash
nvm use
pnpm install
```

## Common Commands

```bash
pnpm build:lib
pnpm build:cli
pnpm test:cli
pnpm test:ci
pnpm build:www
pnpm build:storybook
pnpm docs:generate-metadata
```

## Pull Requests

Small, focused PRs are preferred. Include tests or docs when the change affects public behavior.

Good first contributions are usually documentation, examples, or small accessibility fixes. Primitive internals are more sensitive because they define the public API and should include regression tests.

When creating or changing a `duxkit-ai` primitive, follow the repo-local agent instructions in `AGENTS.md`, including the relevant files under `docs/agent-skills` when present in your local checkout. If the primitive should be available through the CLI, update the bundled registry in `projects/cli/src/lib/primitive-registry.ts` and run the CLI checks.

## Scope

Welcome:

- bug fixes with a reproduction
- documentation improvements
- accessibility improvements
- examples that clarify AI SDK usage with Angular
- small primitive enhancements that fit the current API style

Out of scope:

- broad rewrites without prior discussion
- support requests without enough reproduction details
- provider-specific backend integrations that belong in an application server
- changes that make the library depend on private workspace UI entrypoints

## Support Expectations

Issues and PRs are handled on a best-effort basis. Issues without a reproduction may be closed if they are not actionable. Feature requests should describe the user problem before proposing an API.

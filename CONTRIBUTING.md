# Contributing

Thanks for taking the time to improve DuxKit AI. This project is early, pre-1.0, and maintained on a best-effort basis.

## Project Layout

```text
projects/duxkit-ai/   canonical primitive source and workspace library
projects/cli/         published @duxkit/ui source installer
projects/www/         docs and marketing site
projects/ui/          private Spartan Helm workspace primitives
```

`projects/duxkit-ai` is not published to npm. The consumer-facing primitive source is derived from
that project, packaged by `@duxkit/ui`, and written into consumer applications. Private workspace
UI imports under `@duxkit-private/ui/*` must not appear in generated source.

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
pnpm cli:sync-templates
pnpm test:cli
pnpm test:ci
pnpm build:www
pnpm build:storybook
pnpm docs:generate-metadata
```

## Pull Requests

Small, focused PRs are preferred. Include tests or docs when the change affects public behavior.

Good first contributions are usually documentation, examples, or small accessibility fixes. Primitive internals are more sensitive because they define the public API and should include regression tests.

If a primitive should be available through the CLI, add its descriptive and dependency metadata
to `projects/cli/src/lib/primitive-registry.ts`, then run `pnpm cli:sync-templates`. The command
derives the file inventory and consumer-safe templates from `projects/duxkit-ai/src/lib`; do not
hand-edit `primitive-files.generated.ts` or files under `projects/cli/src/lib/templates`.

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
- changes that make generated primitives depend on private workspace UI entrypoints

## Support Expectations

Issues and PRs are handled on a best-effort basis. Issues without a reproduction may be closed if they are not actionable. Feature requests should describe the user problem before proposing an API.

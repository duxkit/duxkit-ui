# @duxkit/ui

Command-line tooling for adding editable Duxkit AI primitives to Angular workspaces.

The CLI detects Angular CLI and Nx workspaces, writes generated primitive source into your app, installs only the dependencies needed by the selected primitives, and records the result in `duxkit-ai.json`.

## Install

Run the CLI with your package manager:

```bash
pnpm dlx @duxkit/ui init
pnpm dlx @duxkit/ui add conversation message prompt-input
```

```bash
npx @duxkit/ui init
npx @duxkit/ui add conversation message prompt-input
```

The package exposes the `duxkit-ui` binary. It requires Node versions supported by the package `engines` field.

## Quick Start

Initialize Duxkit AI in an Angular workspace:

```bash
pnpm dlx @duxkit/ui init
```

Add primitives:

```bash
pnpm dlx @duxkit/ui add message conversation
```

Check what the CLI detected:

```bash
pnpm dlx @duxkit/ui inspect
```

List available and installed primitives:

```bash
pnpm dlx @duxkit/ui list
```

## Commands

### `duxkit-ui init`

Initializes Duxkit AI primitive generation for one Angular app.

It can:

- create or update `duxkit-ai.json`
- install baseline dependencies
- create or update JSON PostCSS config for Tailwind CSS v4
- add Tailwind CSS v4 imports and Spartan Brain preset imports to the selected global stylesheet
- add missing Duxkit theme tokens without overwriting existing token values
- create the configured generated-components directory

Common usage:

```bash
duxkit-ui init
duxkit-ui init --dry-run
duxkit-ui init --yes
duxkit-ui init --project app --stylesheet src/styles.css
duxkit-ui init --no-install
```

Useful options:

- `--cwd <path>`: inspect a workspace directory other than the current directory
- `--project <name>`: choose the Angular application project
- `--stylesheet <path>`: choose the global stylesheet to configure
- `--components-path <path>`: choose where generated primitive files are written
- `--style <language>`: set generated style language
- `--tokens <add|skip|require-existing>`: control theme-token handling
- `--tailwind <add|skip|require-existing>`: control Tailwind stylesheet handling
- `--postcss <add|skip|require-existing>`: control PostCSS handling
- `--package-manager <npm|pnpm|yarn|bun>`: set the install command package manager
- `--dry-run`: print the plan without writing files or installing packages
- `--json`: print machine-readable JSON to stdout
- `--yes`: accept safe defaults and skip the final apply confirmation
- `--force`: let explicit init flags replace conflicting values in `duxkit-ai.json`
- `--no-install`: skip package installation and print the exact install command

### `duxkit-ui add`

Adds one or more Duxkit AI primitives to the configured component destination.

It can:

- resolve requested primitives and transitive primitive dependencies
- install only the package dependencies required by the selected primitives
- copy generated component, helper, type, and style files into your app
- update `duxkit-ai.json` after successful source writes
- print import examples after generation

Common usage:

```bash
duxkit-ui add message
duxkit-ui add conversation message prompt-input
duxkit-ui add --all
duxkit-ui add message --dry-run
duxkit-ui add message --yes
duxkit-ui add message --force
duxkit-ui add message --no-install
```

Useful options:

- `--all`: add every available primitive
- `--cwd <path>`: inspect a workspace directory other than the current directory
- `--project <name>`: choose the Angular application project
- `--components-path <path>`: choose where generated primitive files are written
- `--package-manager <npm|pnpm|yarn|bun>`: set the install command package manager
- `--dry-run`: print the plan without writing files or installing packages
- `--json`: print machine-readable JSON to stdout
- `--yes`: accept safe defaults and skip the final apply confirmation
- `--no-install`: skip package installation and print the exact install command
- `--force`: overwrite only safe Duxkit-owned generated files under the configured component destination

`--force` is intentionally narrow. It does not overwrite foreign files, directories, unsafe paths, token values, JavaScript or TypeScript PostCSS files, Angular bootstrap or routing files, or unrelated app files.

### `duxkit-ui list`

Lists available primitives, installed primitives, and dependency groups.

```bash
duxkit-ui list
duxkit-ui list --json
```

Options:

- `--cwd <path>`: inspect a workspace directory other than the current directory
- `--json`: print machine-readable JSON to stdout

### `duxkit-ui inspect`

Prints detected workspace state.

```bash
duxkit-ui inspect
duxkit-ui inspect --json
```

It reports:

- workspace type and package manager
- selected project and project candidates
- source root, stylesheet, style language, and component destination
- `duxkit-ai.json` path and validity
- Tailwind source coverage
- present and missing theme tokens
- installed primitives
- missing dependencies

Options:

- `--cwd <path>`: inspect a workspace directory other than the current directory
- `--json`: print machine-readable JSON to stdout

## Mutation Safety

`init` and `add` are plan-first mutating commands. They detect workspace state, build a plan, print it, and then apply it only when the operation is safe.

Interactive terminals get one final apply confirmation unless `--yes` is passed. Non-interactive writes require `--yes`. The `--yes` flag accepts safe defaults, but it does not resolve ambiguity such as multiple app projects or conflicting config values.

Use `--dry-run` to inspect the plan without changing files:

```bash
duxkit-ui init --dry-run
duxkit-ui add message --dry-run
```

Use `--json` for machine-readable output. JSON mode preserves JSON-only stdout, including blocked and failed plans.

Use `--no-install` when you want to install dependencies yourself. The CLI will not invoke the package manager and will print the exact install command in the plan.

Package installation runs before source, config, and stylesheet writes. If installation fails, those files are left unchanged. If a later write fails after earlier steps succeeded, the CLI reports `Partial changes were made` with completed and pending steps.

## Configuration

The CLI stores workspace configuration in `duxkit-ai.json`:

```json
{
  "$schema": "https://duxkit.com/schemas/duxkit-ai.json",
  "project": "app",
  "style": "css",
  "componentsPath": "src/app/components/ai",
  "stylesheet": "src/styles.css",
  "tailwind": {
    "version": 4,
    "sourcePath": "./src/app/components/ai"
  },
  "aliases": {
    "components": "@/app/components"
  },
  "primitives": {
    "message": "0.0.1",
    "conversation": "0.0.1"
  }
}
```

`project` is optional for single-app workspaces. `aliases.components` is optional. `primitives` records the primitive versions last written by the CLI.

## Generated Files

Generated primitive files are copied into the configured component destination, which defaults to:

```text
src/app/components/ai
```

For Nx app projects, the default is resolved from the selected app source root, for example:

```text
apps/chat/src/app/components/ai
```

Generated files are intended to be edited by the consuming app. Re-run with `--dry-run` before using `--force` so you can see exactly which files would be overwritten.

## Available Primitives

The current registry includes:

- `attachment` alias: `attachments`
- `chain-of-thought` aliases: `chain`, `cot`
- `checkpoint`
- `code-block` alias: `code`
- `confirmation`
- `context`
- `conversation`
- `markdown`
- `message`
- `model-selector` aliases: `model`, `models`
- `prompt-input` alias: `prompt`
- `queue`
- `reasoning`
- `reasoning-effort` alias: `effort`
- `shimmer`
- `sources` alias: `source`
- `task`
- `tool`

Run `duxkit-ui list` for current primitive descriptions, dependencies, and installed status.

## Local Development

From this repository:

```bash
node_modules/.bin/nx test cli
node_modules/.bin/nx build cli
```

The build output is written to `dist/cli`.

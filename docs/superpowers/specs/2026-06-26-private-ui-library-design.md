# Private UI Library Design

## Context

The workspace currently has a publishable `duxkit-ai` Angular library and two applications, `www` and `playground`. Generated Spartan HLM components live under `projects/duxkit-ai/helm` and are imported through `duxkit-ai/helm/*`.

That makes the generated HLM code look like part of the package API, but these components are only intended to support the workspace apps. They should not be published as part of `duxkit-ai`.

## Decision

Create a private Nx library at `projects/ui`.

The library owns app-facing UI primitives shared by `www` and `playground`. Spartan-generated HLM components live under `projects/ui/helm` and are imported with the alias `@duxkit/ui/helm/*`.

Initial generated Spartan components:

- Navigation Menu
- Button
- Tabs

`duxkit-ai` remains the publishable AI component package and must not depend on `projects/ui`.

## Target Structure

```text
projects/
  duxkit-ai/
  ui/
    helm/
      button/
      navigation-menu/
      tabs/
      icon/
      utils/
  www/
  playground/
```

`icon` and `utils` are listed because Spartan CLI dependency resolution may generate them for the requested primitives.

## Spartan CLI Configuration

Update `components.json` so future Spartan CLI generation writes to the private UI library:

```json
{
  "componentsPath": "projects/ui/helm",
  "buildable": false,
  "generateAs": "library",
  "importAlias": "@duxkit/ui/helm"
}
```

Generate the initial components with the Spartan CLI:

```bash
pnpm exec ng g @spartan-ng/cli:ui navigation-menu --interactive=false
pnpm exec ng g @spartan-ng/cli:ui button --interactive=false
pnpm exec ng g @spartan-ng/cli:ui tabs --interactive=false
```

The installed Spartan CLI supports `navigation-menu`, `button`, and `tabs` as generator names.

## Imports

Update app and story imports from the publishable package namespace:

```ts
import { HlmButton } from 'duxkit-ai/helm/button';
```

to the private UI namespace:

```ts
import { HlmButton } from '@duxkit/ui/helm/button';
```

Only workspace code should import `@duxkit/ui/*`. Public package code under `projects/duxkit-ai/src` must not import it.

## Nx Dependencies

`www` and `playground` should declare an implicit dependency on `ui` if Nx does not infer it from TypeScript imports.

`duxkit-ai` should not declare an implicit dependency on `ui`.

## Publishing Boundary

Generated HLM code should be removed from `projects/duxkit-ai/helm` after imports are migrated.

The `duxkit-ai` package should not expose `duxkit-ai/helm/*` secondary entrypoints. Documentation should stop presenting generated HLM components as package entrypoints.

`projects/ui` does not need package metadata for external publishing.

## Styling

`www` and `playground` should continue to include the Spartan Tailwind preset in their app stylesheets. The private UI library provides Angular components and directives; the applications remain responsible for app-level Tailwind setup.

## Testing And Verification

Implementation should verify:

- `pnpm nx build www` succeeds.
- `pnpm nx build playground` succeeds.
- `pnpm nx test duxkit-ai -- --watch=false` still succeeds.
- No source files import `duxkit-ai/helm/*`.
- No package output for `duxkit-ai` includes generated HLM secondary entrypoints.
- If `projects/ui` has a build or test target, that target succeeds.

## Out Of Scope

- Publishing `projects/ui` as a package.
- Reworking visual design for `www` or `playground`.
- Replacing Spartan-generated code with hand-written primitives.
- Changing the public `duxkit-ai` component API.

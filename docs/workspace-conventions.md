# Workspace conventions

## Project Roots

The repository uses Nx project metadata for buildable or importable modules.

- Applications live under `projects/<name>`.
- The public AI primitive package lives under `projects/duxkit-ai`.
- The private UI package lives under `projects/ui`.
- Helm UI entries live under `projects/ui/helm/<name>` and must each have:
  - `project.json`
  - `tsconfig.json`
  - `tsconfig.lib.json`
  - `README.md`
  - `src/index.ts`
  - `src/lib/*`

## Package Manager Workspace

`pnpm-workspace.yaml` includes package roots with `package.json` files. Nested Helm entries are Nx libraries, not pnpm packages, so they are intentionally exposed through `tsconfig.json` path aliases instead of pnpm workspace package entries.

## TypeScript Path Aliases

Every Helm module that has a `projects/ui/helm/<name>` folder must have a matching path alias:

```json
"@duxkit/ui/helm/<name>": ["./projects/ui/helm/<name>/src/index.ts"]
```

Do not add a path alias without adding the matching Nx project metadata.

## Duxkit AI Primitive Folders

Every public primitive folder under `projects/duxkit-ai/src/lib/<primitive>` must have:

- `index.ts`
- `<primitive>.ts`
- `<primitive>.spec.ts`
- `<primitive>.stories.ts`

Every public primitive folder must be exported from `projects/duxkit-ai/src/public-api.ts`.

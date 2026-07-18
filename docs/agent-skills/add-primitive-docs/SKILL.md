---
name: add-primitive-docs
description: Use when adding a new duxkit-ai primitive/component/directive to the www docs, or when updating docs after a primitive API changes. Ensures exports, Storybook, docs registry, snippets, previews, generated API metadata, search, and verification are handled together.
---

# Add Primitive Docs

Use this skill when a new `duxkit-ai` primitive needs docs, or when an existing primitive API changes and the docs must stay in sync.

## Workflow

1. Read `docs/adding-component-docs.md` before editing docs.
2. Inspect the primitive source under `projects/duxkit-ai/src/lib/<slug>/`.
3. Ensure public exports are present in:
   - `projects/duxkit-ai/src/lib/<slug>/index.ts`
   - `projects/duxkit-ai/src/public-api.ts`
4. Add or update the first Storybook example in:
   - `projects/duxkit-ai/src/lib/<slug>/<slug>.stories.ts`
5. Register the docs page in:
   - `projects/www/src/app/routes/docs/data/component-docs.registry.ts`
6. Add docs snippets in:
   - `projects/www/src/app/routes/components/component-doc.page.ts`
   - update `componentImports`
   - update `anatomySnippets`
7. Add the preview in:
   - `projects/www/src/app/routes/docs/components/component-doc-preview.component.ts`
   - copy the first Storybook example where practical
   - keep preview styling minimal and render the component as-is
8. Add concise JSDoc comments to every public `input()` and `output()` that should appear in the API table.
9. Run:

```bash
pnpm docs:generate-metadata
```

Do not hand-edit `projects/www/src/app/routes/docs/data/component-api-metadata.generated.ts`.

10. Add a concise release-facing title under the current bundle's `WWW` group in
    `projects/www/src/app/routes/docs/data/changelog.ts`. Keep any related primitive or installer
    titles under `UI` or `CLI`. Do not backfill work from before v0.4.

## Verification

For docs-only primitive additions, run:

```bash
pnpm exec vitest run projects/www/src/app/routes/docs/search/docs-search.spec.ts --environment jsdom
pnpm build:www
pnpm build:storybook
```

For primitive implementation changes, run:

```bash
pnpm test:ci
pnpm build
pnpm build:storybook
```

## Checks Before Finishing

- Sidebar includes the primitive.
- `/docs/components/<slug>` loads.
- Preview and Code tabs render the same intended example.
- API tables include selectors, inputs, outputs, defaults, required state, descriptions, exports, and source paths.
- Search finds the primitive by title, selector, exported symbol, input/output name, and relevant API description.
- No generated file was edited manually after `pnpm docs:generate-metadata`.
- The current changelog bundle includes the main WWW, CLI, and UI changes.

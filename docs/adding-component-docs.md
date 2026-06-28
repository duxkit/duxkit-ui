# Adding Component Docs

Use this checklist when adding a new `duxkit-ai` component to the `www` docs.

## 1. Export The Component

Make sure the public component, directive, types, and helpers are exported from:

```text
projects/duxkit-ai/src/public-api.ts
```

If the component has a feature folder, keep its local `index.ts` export in sync too.

## 2. Add Or Update Storybook

Create or update the first Storybook example for the component:

```text
projects/duxkit-ai/src/lib/<component>/<component>.stories.ts
```

The docs preview should usually copy the first Storybook example so the docs and Storybook stay aligned.

Verify Storybook still builds:

```bash
pnpm build:storybook
```

## 3. Register The Docs Page

Add the component to the docs registry:

```text
projects/www/src/app/docs/component-docs.registry.ts
```

Each entry needs:

- `slug`
- `title`
- `description`

The slug becomes the route:

```text
/docs/components/<slug>
```

## 4. Add Docs Page Snippets

Update the code snippets in:

```text
projects/www/src/app/docs/component-doc.page.ts
```

Add entries for:

- `componentImports`
- `anatomySnippets`

These drive the install/manual import and anatomy code tabs.

## 5. Add The Preview

Update:

```text
projects/www/src/app/docs/component-doc-preview.component.ts
```

Add:

- a `componentPreviewSnippets` entry for the Code tab
- a matching `@case ('<slug>')` preview template
- any local fixture data needed by the preview
- the component/directive imports needed by the preview component

Keep preview styling minimal. Prefer rendering the component as-is, with only the container classes required to make the example visible and stable.

## 6. Generate API Metadata

Add concise JSDoc comments to every public `input()` and `output()` that should appear in the API table:

```ts
/** Whether the action is currently selected. */
public readonly active = input(false);

/** Emits when the action is pressed. */
public readonly pressed = output<void>();
```

Run:

```bash
pnpm docs:generate-metadata
```

This updates:

```text
projects/www/src/app/docs/component-api-metadata.generated.ts
```

The generator scans the component folder listed by the docs slug and extracts Angular `@Component` / `@Directive` selectors plus `input()` and `output()` metadata. Input and output descriptions come from JSDoc comments. Do not edit `component-api-metadata.generated.ts` by hand.

## 7. Verify Search

The search index is built from the registry plus API metadata. Run:

```bash
pnpm exec vitest run projects/www/src/app/docs/docs-search.spec.ts --environment jsdom
```

This checks that every docs entry has generated API metadata and that search can match title, selector, export, input, and output data.

## 8. Verify The Docs App

Run the docs site locally:

```bash
pnpm start:www
```

Build it before handing off:

```bash
pnpm build:www
```

Check:

- the sidebar includes the component
- `/docs/components/<slug>` loads
- Preview and Code tabs render correctly
- the API section contains the expected selectors, inputs, outputs, exports, and source metadata
- the search command finds the component by name and API metadata

## 9. Final Checks

For a docs-only change, run:

```bash
pnpm exec vitest run projects/www/src/app/docs/docs-search.spec.ts --environment jsdom
pnpm build:www
pnpm build:storybook
```

For broader component changes, run:

```bash
pnpm test:ci
pnpm build
pnpm build:storybook
```

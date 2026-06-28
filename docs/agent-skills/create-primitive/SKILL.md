---
name: create-primitive
description: Use when creating a new duxkit-ai primitive, adding component/directive pieces to an existing primitive, or making an API-level primitive change. Covers repo standards for Angular signals, composable directive architecture, styling, accessibility, tests, Storybook, exports, docs, and verification.
---

# Create Primitive

Use this before implementing a new `duxkit-ai` primitive or changing a primitive API. If the work touches `www` docs, also read `docs/agent-skills/add-primitive-docs/SKILL.md`.

## Discovery

1. Read `AGENTS.md`.
2. Inspect similar primitives under `projects/duxkit-ai/src/lib/`.
3. Identify whether the primitive is:
   - a root container with child directives/components,
   - a single leaf component,
   - a wrapper around Spartan Brain behavior,
   - a rendering utility with markdown/code/media.
4. Prefer existing local patterns over new abstractions.

## Files

Create or update:

```text
projects/duxkit-ai/src/lib/<slug>/
  <slug>.ts
  <piece>.ts
  <slug>.spec.ts
  <slug>.stories.ts
  index.ts
```

Also update:

```text
projects/duxkit-ai/src/public-api.ts
```

If the primitive appears in docs, follow `docs/agent-skills/add-primitive-docs/SKILL.md`.

## Angular Standards

- Use standalone components/directives, but do not set `standalone: true`.
- Do not set `ChangeDetectionStrategy.OnPush`.
- Use `input()`, `output()`, `computed()`, `signal()`, and `inject()`.
- Put host bindings/listeners in the decorator `host` object.
- Do not use `@HostBinding`, `@HostListener`, `ngClass`, or `ngStyle`.
- Use native control flow: `@if`, `@for`, `@switch`.
- Keep templates simple. Move derived state into `computed()`.
- Use strict types. Avoid `any`; use `unknown` when needed.

## Primitive Architecture

- Prefer composable pieces over monolithic components.
- Root pieces should provide shared state through injection or existing Spartan Brain providers.
- Child pieces should inject the root context and fail clearly if used outside the root when appropriate.
- Support both element and attribute selectors when this improves composition:

```ts
selector: '[aiExample],ai-example'
```

- Use semantic public names and keep aliases stable.
- Public `input()` and `output()` members need concise JSDoc for generated docs metadata.
- Preserve consumer classes with a `class` input:

```ts
/** Additional classes merged onto the example element. */
public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
```

## Styling

- Use Tailwind classes.
- Use `cva` for variant/state class maps, and export the variant helper/type when useful.
- Merge variant classes and consumer classes with `twMerge`.
- Use app theme tokens (`text-foreground`, `text-muted-foreground`, `bg-background`, `border-border`, etc.) so light and dark mode work.
- Do not hard-code light-only or dark-only colors unless there is a matching dark/light branch.
- Keep class output compatible with other directives on the same element, especially `hlmBtn`.
- If a primitive is expected to compose with HLM directives, add a test that confirms HLM classes survive.

Example:

```ts
export const exampleVariants = cva('min-w-0 text-foreground', {
  variants: {
    variant: {
      default: 'rounded-md border border-border bg-background',
      subtle: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
```

## Spartan Brain And HLM

- Use Spartan Brain directives for established interaction behavior: collapsible, hover-card, tabs, dialog, menu, button semantics, etc.
- Prefer Brain for state, ARIA, keyboard, and focus behavior instead of reimplementing it.
- Use HLM directives in docs/examples where consumers are likely to compose them, but keep `duxkit-ai` primitives independent unless an existing dependency already exists.
- For host directives, expose relevant Brain inputs/outputs through `hostDirectives`.
- When a primitive has auto state and consumer-controlled state, do not overwrite consumer inputs on initialization. Only update Brain model signals for actual state transitions.

## Accessibility

- Use semantic roles and labels.
- Ensure icon-only controls have `aria-label` or equivalent visible text.
- Use `aria-expanded`, `aria-controls`, `data-state`, and keyboard behavior from Brain directives where possible.
- Ensure disabled state prevents interaction and is exposed to assistive tech.
- Preserve focus-visible styles.
- Do not hide interactive controls from keyboard users if hover reveals them; focus should reveal or keep them reachable.

## Tests

Add focused unit tests for behavior and contracts:

- default render and projected content,
- public inputs/outputs,
- derived labels/state,
- root/child composition errors if applicable,
- Brain state wiring (`data-state`, `aria-expanded`, etc.),
- class merging and variant classes,
- HLM composition if supported,
- accessibility-relevant attributes.

Do not write screenshot tests for purely visual details unless explicitly requested.

## Storybook

- Add a concise first story that matches the docs preview where practical.
- Cover primary variants and composable API shape.
- Use realistic data and event handlers.
- Keep stories minimal and focused on the primitive, not a marketing layout.

## Docs

When docs are required:

1. Read `docs/agent-skills/add-primitive-docs/SKILL.md`.
2. Add/update docs registry, snippets, preview, generated API metadata, and search tests.
3. Make preview and code tabs render the same intended API.
4. Do not hand-edit generated metadata after running `pnpm docs:generate-metadata`.

## Verification

For primitive implementation changes, run the narrowest relevant checks first, then broader checks:

```bash
pnpm exec nx test duxkit-ai -- --watch=false
pnpm build:lib
```

If docs changed:

```bash
pnpm docs:generate-metadata
pnpm exec vitest run projects/www/src/app/docs/docs-search.spec.ts --environment jsdom
pnpm build:www
```

If Storybook changed or the user asks for full verification:

```bash
pnpm build:storybook
```

Before finishing, confirm:

- public exports are present,
- tests cover the API behavior,
- docs metadata is regenerated when API changed,
- light/dark theme classes use theme tokens,
- consumer `class` overrides still work,
- no unrelated user changes were reverted.

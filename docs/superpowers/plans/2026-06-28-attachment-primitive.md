# Attachment Primitive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and document a composable Angular `Attachment` primitive for AI SDK file and source-document parts.

**Architecture:** Add a focused `attachment` primitive folder containing collection, root, preview, remove, and type/helper files. The root directive derives attachment state from `FileUIPart | SourceDocumentUIPart` and projected child primitives consume that state by injection. Docs, Storybook, and generated metadata follow the existing `duxkit-ai` primitive workflow.

**Tech Stack:** Angular 22 standalone directives/components, signals, AI SDK `ai` package types, SpartanNG Brain hover-card directives, `@ng-icons/lucide`, Tailwind CSS, `tailwind-merge`, Vitest/jsdom, Nx.

---

## File Structure

- Create `projects/duxkit-ai/src/lib/attachment/attachment.types.ts` for public attachment types and pure helper functions.
- Create `projects/duxkit-ai/src/lib/attachment/attachments.ts` for the layout collection.
- Create `projects/duxkit-ai/src/lib/attachment/attachment.ts` for the stateful root.
- Create `projects/duxkit-ai/src/lib/attachment/attachment-preview.ts` for default visual rendering and inline hover cards via `@spartan-ng/brain/hover-card`.
- Create `projects/duxkit-ai/src/lib/attachment/attachment-remove.ts` for remove behavior.
- Create `projects/duxkit-ai/src/lib/attachment/index.ts` for local exports.
- Create `projects/duxkit-ai/src/lib/attachment/attachment.spec.ts` for behavior and accessibility tests.
- Create `projects/duxkit-ai/src/lib/attachment/attachment.stories.ts` for Storybook examples.
- Modify `projects/duxkit-ai/src/public-api.ts` to export the primitive.
- Modify `projects/www/src/app/docs/component-docs.registry.ts` to register the docs page.
- Modify `projects/www/src/app/docs/component-doc.page.ts` to add imports and anatomy.
- Modify `projects/www/src/app/docs/component-doc-preview.component.ts` to add preview fixtures.
- Regenerate `projects/www/src/app/docs/component-api-metadata.generated.ts` with `pnpm docs:generate-metadata`.

### Task 1: Failing Primitive Tests

**Files:**

- Create: `projects/duxkit-ai/src/lib/attachment/attachment.spec.ts`

- [ ] **Step 1: Write failing tests**

Add tests that import the not-yet-created attachment primitives and verify variant layout, derived file/source state, preview rendering, inline hover-card markup, remove output, accessibility labels, and class merging.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pnpm exec nx test duxkit-ai -- --watch=false
```

Expected: FAIL because the `attachment` primitive files do not exist yet.

### Task 2: Minimal Primitive Implementation

**Files:**

- Create: `projects/duxkit-ai/src/lib/attachment/attachment.types.ts`
- Create: `projects/duxkit-ai/src/lib/attachment/attachments.ts`
- Create: `projects/duxkit-ai/src/lib/attachment/attachment.ts`
- Create: `projects/duxkit-ai/src/lib/attachment/attachment-preview.ts`
- Create: `projects/duxkit-ai/src/lib/attachment/attachment-remove.ts`
- Create: `projects/duxkit-ai/src/lib/attachment/index.ts`
- Modify: `projects/duxkit-ai/src/public-api.ts`

- [ ] **Step 1: Implement helper types and derivation**

Create pure helpers for `AiAttachmentPart`, `AiAttachmentKind`, name extraction, media type fallback, URL extraction, and kind detection.

- [ ] **Step 2: Implement collection and root primitives**

Add `Attachments` with a `variant` input and `Attachment` with `data`, `removed`, derived signals, and provider state for child primitives.

- [ ] **Step 3: Implement preview and remove primitives**

Add default preview rendering for image, video, audio, document, and source attachments. Use `BrnHoverCard`, `BrnHoverCardTrigger`, and `BrnHoverCardContent` for inline hover/focus previews. Add a remove button directive/component that emits through the root and provides a default accessible label.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
pnpm exec nx test duxkit-ai -- --watch=false
```

Expected: PASS.

### Task 3: Storybook And Docs

**Files:**

- Create: `projects/duxkit-ai/src/lib/attachment/attachment.stories.ts`
- Modify: `projects/www/src/app/docs/component-docs.registry.ts`
- Modify: `projects/www/src/app/docs/component-doc.page.ts`
- Modify: `projects/www/src/app/docs/component-doc-preview.component.ts`
- Regenerate: `projects/www/src/app/docs/component-api-metadata.generated.ts`

- [ ] **Step 1: Add Storybook examples**

Add examples for grid, inline, and list variants using the same fixture attachment set.

- [ ] **Step 2: Register docs and snippets**

Register the `attachment` docs page, add the public import snippet, and add an anatomy snippet showing `ai-attachments`, `ai-attachment`, `ai-attachment-preview`, and `aiAttachmentRemove`.

- [ ] **Step 3: Add docs preview**

Add component preview fixtures and a matching `@case ('attachment')` template that renders the same intended example as Storybook.

- [ ] **Step 4: Generate metadata**

Run:

```bash
pnpm docs:generate-metadata
```

Expected: generated API metadata includes the new attachment symbols.

### Task 4: Verification

**Files:**

- Check all changed files.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
pnpm exec nx test duxkit-ai -- --watch=false
pnpm exec vitest run projects/www/src/app/docs/docs-search.spec.ts --environment jsdom
```

Expected: PASS.

- [ ] **Step 2: Run full verification**

Run:

```bash
pnpm test:ci
pnpm build
pnpm build:storybook
```

Expected: PASS.

- [ ] **Step 3: Review git diff**

Run:

```bash
git diff -- projects/duxkit-ai/src/lib/attachment projects/duxkit-ai/src/public-api.ts projects/www/src/app/docs docs/superpowers
```

Expected: only attachment primitive, docs, and generated metadata changes are present.

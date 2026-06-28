# Docs Table Of Contents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sticky "On this page" table of contents to component docs pages, including section links, nested API symbol links, and an active scroll state.

**Architecture:** Keep TOC data shaping in a small pure helper, keep scroll behavior isolated in a reusable Angular component, and keep docs page content responsible only for stable heading IDs. The component docs page will render a two-column inner layout: main article content plus a right rail TOC that hides on narrow screens.

**Tech Stack:** Angular 22 standalone components, TypeScript 6, signals, Vitest, Nx `www` build.

---

## File Structure

- Create `projects/www/src/app/docs/docs-table-of-contents.ts`: pure TOC item types, section constants, API symbol heading ID generation, and TOC builder.
- Create `projects/www/src/app/docs/docs-table-of-contents.spec.ts`: Vitest coverage for section IDs, API symbol nesting, and symbol-name slugging.
- Create `projects/www/src/app/docs/docs-table-of-contents.component.ts`: reusable right rail component with anchor links and active scroll state.
- Modify `projects/www/src/app/docs/component-doc.page.ts`: import the TOC component, wrap page content in an inner layout, add stable IDs to section and API headings, and compute TOC items from `componentApiMetadata`.
- Modify `projects/www/src/app/docs/docs-shell.page.ts`: widen the docs content column enough for the main article plus right rail.

---

### Task 1: Add Pure TOC Data Builder

**Files:**
- Create: `projects/www/src/app/docs/docs-table-of-contents.ts`
- Create: `projects/www/src/app/docs/docs-table-of-contents.spec.ts`

- [ ] **Step 1: Write the failing helper tests**

Create `projects/www/src/app/docs/docs-table-of-contents.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { componentApiMetadata } from './component-api-metadata.generated';
import {
  apiSymbolHeadingId,
  buildComponentDocsTableOfContents,
  docsPageSections,
} from './docs-table-of-contents';

describe('docs table of contents', () => {
  it('keeps stable top-level docs section anchors', () => {
    expect(docsPageSections).toEqual([
      { id: 'install', label: 'Install' },
      { id: 'anatomy', label: 'Anatomy' },
      { id: 'preview', label: 'Preview' },
      { id: 'api', label: 'API' },
      { id: 'related-primitives', label: 'Related Primitives' },
    ]);
  });

  it('nests API symbol names under the API section only', () => {
    const toc = buildComponentDocsTableOfContents(componentApiMetadata['chain-of-thought'].symbols);
    const apiSection = toc.find((item) => item.id === 'api');

    expect(apiSection?.items?.map((item) => item.label)).toEqual([
      'ChainOfThought',
      'ChainOfThoughtContent',
      'ChainOfThoughtTrigger',
      'ChainOfThoughtImage',
      'ChainOfThoughtSearchResult',
      'ChainOfThoughtSearchResults',
      'ChainOfThoughtStep',
    ]);
    expect(toc.filter((item) => item.items !== undefined).map((item) => item.id)).toEqual(['api']);
  });

  it('creates readable and stable API symbol heading ids', () => {
    expect(apiSymbolHeadingId('ChainOfThoughtSearchResult')).toBe(
      'api-chain-of-thought-search-result',
    );
    expect(apiSymbolHeadingId('PromptInputSelectTrigger')).toBe(
      'api-prompt-input-select-trigger',
    );
  });
});
```

- [ ] **Step 2: Run the helper tests and verify they fail**

Run:

```bash
pnpm exec vitest run projects/www/src/app/docs/docs-table-of-contents.spec.ts
```

Expected: FAIL because `./docs-table-of-contents` does not exist.

- [ ] **Step 3: Implement the pure helper**

Create `projects/www/src/app/docs/docs-table-of-contents.ts`:

```ts
import { type ComponentApiSymbolMetadata } from './component-api-metadata.generated';

export interface DocsTableOfContentsItem {
  readonly id: string;
  readonly label: string;
  readonly items?: readonly DocsTableOfContentsItem[];
}

export const docsPageSections = [
  { id: 'install', label: 'Install' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'preview', label: 'Preview' },
  { id: 'api', label: 'API' },
  { id: 'related-primitives', label: 'Related Primitives' },
] as const satisfies readonly DocsTableOfContentsItem[];

export function buildComponentDocsTableOfContents(
  symbols: readonly ComponentApiSymbolMetadata[],
): readonly DocsTableOfContentsItem[] {
  const apiSymbolItems = symbols.map((symbol) => ({
    id: apiSymbolHeadingId(symbol.name),
    label: symbol.name,
  }));

  return docsPageSections.map((section) =>
    section.id === 'api' ? { ...section, items: apiSymbolItems } : section,
  );
}

export function apiSymbolHeadingId(symbolName: string): string {
  return `api-${symbolName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()}`;
}
```

- [ ] **Step 4: Run the helper tests and verify they pass**

Run:

```bash
pnpm exec vitest run projects/www/src/app/docs/docs-table-of-contents.spec.ts
```

Expected: PASS for all three tests.

- [ ] **Step 5: Commit the helper**

Run:

```bash
git add projects/www/src/app/docs/docs-table-of-contents.ts projects/www/src/app/docs/docs-table-of-contents.spec.ts
git commit -m "test: add docs table of contents model"
```

Expected: commit succeeds.

---

### Task 2: Build The Reusable TOC Component

**Files:**
- Create: `projects/www/src/app/docs/docs-table-of-contents.component.ts`

- [ ] **Step 1: Create the component**

Create `projects/www/src/app/docs/docs-table-of-contents.component.ts`:

```ts
import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { type DocsTableOfContentsItem } from './docs-table-of-contents';

@Component({
  selector: 'app-docs-table-of-contents',
  host: {
    '(window:resize)': 'scheduleActiveUpdate()',
    '(window:scroll)': 'scheduleActiveUpdate()',
  },
  template: `
    <nav class="docs-toc" aria-label="On this page">
      <h2>On this page</h2>
      <ol>
        @for (item of items(); track item.id) {
          <li>
            <a
              [href]="anchorHref(item.id)"
              [class.is-active]="activeId() === item.id"
              [attr.aria-current]="activeId() === item.id ? 'location' : null"
            >
              {{ item.label }}
            </a>

            @if (item.items?.length) {
              <ol>
                @for (child of item.items; track child.id) {
                  <li>
                    <a
                      [href]="anchorHref(child.id)"
                      [class.is-active]="activeId() === child.id"
                      [attr.aria-current]="activeId() === child.id ? 'location' : null"
                    >
                      <code>{{ child.label }}</code>
                    </a>
                  </li>
                }
              </ol>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    :host {
      min-width: 0;
      display: block;
    }

    .docs-toc {
      position: sticky;
      top: 89px;
      max-height: calc(100dvh - 113px);
      overflow: auto;
      padding-left: 18px;
      border-left: 1px solid #e4e4e7;
      scrollbar-width: thin;
    }

    .docs-toc h2 {
      margin: 0 0 12px;
      color: #71717a;
      font-size: 13px;
      line-height: 1.4;
      font-weight: 600;
      letter-spacing: 0;
    }

    .docs-toc ol {
      display: grid;
      gap: 7px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .docs-toc ol ol {
      gap: 6px;
      margin-top: 7px;
      padding-left: 12px;
    }

    .docs-toc a {
      display: inline-flex;
      max-width: 100%;
      color: #71717a;
      font-size: 14px;
      line-height: 1.35;
      font-weight: 450;
      text-decoration: none;
    }

    .docs-toc a:hover,
    .docs-toc a:focus-visible,
    .docs-toc a.is-active {
      color: #0069ff;
    }

    .docs-toc a.is-active {
      font-weight: 650;
    }

    .docs-toc code {
      overflow-wrap: anywhere;
      border-radius: 4px;
      padding: 1px 3px;
      background: #f4f4f5;
      color: currentColor;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.45;
    }

    @media (prefers-color-scheme: dark) {
      .docs-toc {
        border-color: #27272a;
      }

      .docs-toc h2,
      .docs-toc a {
        color: #a1a1aa;
      }

      .docs-toc a:hover,
      .docs-toc a:focus-visible,
      .docs-toc a.is-active {
        color: #79c0ff;
      }

      .docs-toc code {
        background: #09090b;
      }
    }

    @media (max-width: 1180px) {
      :host {
        display: none;
      }
    }
  `,
})
export class DocsTableOfContents {
  private readonly document = inject(DOCUMENT);
  private frame: number | undefined;

  readonly items = input.required<readonly DocsTableOfContentsItem[]>();

  protected readonly activeId = signal('');
  private readonly flatItems = computed(() => flattenItems(this.items()));

  constructor() {
    effect(() => {
      this.flatItems();
      this.scheduleActiveUpdate();
    });
  }

  protected anchorHref(id: string): string {
    return `#${id}`;
  }

  protected scheduleActiveUpdate(): void {
    if (this.frame !== undefined) {
      return;
    }

    this.frame = globalThis.requestAnimationFrame(() => {
      this.frame = undefined;
      this.updateActiveItem();
    });
  }

  private updateActiveItem(): void {
    const headings = this.flatItems()
      .map((item) => this.document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (headings.length === 0) {
      this.activeId.set('');
      return;
    }

    const activationLine = 104;
    const activeHeading =
      headings.findLast((heading) => heading.getBoundingClientRect().top <= activationLine) ??
      headings[0];

    this.activeId.set(activeHeading.id);
  }
}

function flattenItems(
  items: readonly DocsTableOfContentsItem[],
): readonly DocsTableOfContentsItem[] {
  return items.flatMap((item) => (item.items ? [item, ...item.items] : [item]));
}
```

- [ ] **Step 2: Build the docs app and capture compile errors**

Run:

```bash
pnpm run build:www
```

Expected: PASS. If the TypeScript target rejects `Array.prototype.findLast`, replace the `findLast` line with this equivalent loop:

```ts
let activeHeading = headings[0];

for (const heading of headings) {
  if (heading.getBoundingClientRect().top <= activationLine) {
    activeHeading = heading;
  }
}
```

- [ ] **Step 3: Commit the component**

Run:

```bash
git add projects/www/src/app/docs/docs-table-of-contents.component.ts
git commit -m "feat: add docs table of contents component"
```

Expected: commit succeeds.

---

### Task 3: Wire The TOC Into Component Docs Pages

**Files:**
- Modify: `projects/www/src/app/docs/component-doc.page.ts`

- [ ] **Step 1: Import the TOC component and helper functions**

In `projects/www/src/app/docs/component-doc.page.ts`, replace the local imports near the top with these additions:

```ts
import { DocsTableOfContents } from './docs-table-of-contents.component';
import {
  apiSymbolHeadingId,
  buildComponentDocsTableOfContents,
} from './docs-table-of-contents';
```

Update the component imports array from:

```ts
imports: [ComponentDocPreview, DocsCodeTabs, RouterLink],
```

to:

```ts
imports: [ComponentDocPreview, DocsCodeTabs, DocsTableOfContents, RouterLink],
```

- [ ] **Step 2: Wrap the existing rendered docs content**

Inside the `@if (doc(); as doc) { ... }` branch, wrap all existing page sections in this structure:

```html
<div class="docs-page-layout">
  <div class="docs-page-main">
    <!-- existing header and sections stay here -->
  </div>

  <app-docs-table-of-contents [items]="tableOfContents()" />
</div>
```

The `@else` missing-state branch stays outside this new `docs-page-layout`.

- [ ] **Step 3: Replace section heading IDs with stable anchor IDs**

Update the section opening tags and heading IDs:

```html
<section class="docs-section" aria-labelledby="install">
  <div class="docs-section-copy">
    <h2 id="install">Install</h2>
```

```html
<section class="docs-section" aria-labelledby="anatomy">
  <div class="docs-section-copy">
    <h2 id="anatomy">Anatomy</h2>
```

```html
<section class="docs-section" aria-labelledby="preview">
  <div class="docs-section-copy">
    <h2 id="preview">Preview</h2>
```

```html
<section class="docs-section" aria-labelledby="api">
  <div class="docs-section-copy">
    <h2 id="api">API</h2>
```

```html
<section class="docs-section" aria-labelledby="related-primitives">
  <div class="docs-section-copy">
    <h2 id="related-primitives">Related Primitives</h2>
```

- [ ] **Step 4: Add stable IDs to API symbol headings**

Change the API symbol heading from:

```html
<h3>{{ symbol.name }}</h3>
```

to:

```html
<h3 [id]="apiSymbolId(symbol.name)">{{ symbol.name }}</h3>
```

- [ ] **Step 5: Add computed TOC data and symbol ID method**

In the `ComponentDocPage` class, after `apiMetadata`, add:

```ts
protected readonly tableOfContents = computed(() =>
  buildComponentDocsTableOfContents(this.apiMetadata()?.symbols ?? []),
);
```

Before `symbolExportAs`, add:

```ts
protected apiSymbolId(symbolName: string): string {
  return apiSymbolHeadingId(symbolName);
}
```

- [ ] **Step 6: Add inner page layout styles**

In the component styles, after `:host`, add:

```css
.docs-page-layout {
  display: grid;
  grid-template-columns: minmax(0, 820px) 220px;
  align-items: start;
  gap: clamp(36px, 5vw, 64px);
}

.docs-page-main {
  min-width: 0;
}
```

Before the existing `@media (max-width: 720px)` block, add:

```css
@media (max-width: 1180px) {
  .docs-page-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 7: Run targeted tests**

Run:

```bash
pnpm exec vitest run projects/www/src/app/docs/docs-table-of-contents.spec.ts projects/www/src/app/docs/docs-search.spec.ts
```

Expected: PASS for both docs specs.

- [ ] **Step 8: Commit the page integration**

Run:

```bash
git add projects/www/src/app/docs/component-doc.page.ts
git commit -m "feat: show docs table of contents"
```

Expected: commit succeeds.

---

### Task 4: Adjust Docs Shell Width And Verify The App

**Files:**
- Modify: `projects/www/src/app/docs/docs-shell.page.ts`

- [ ] **Step 1: Widen the docs content column**

In `projects/www/src/app/docs/docs-shell.page.ts`, change:

```css
grid-template-columns: 260px minmax(0, 880px);
```

to:

```css
grid-template-columns: 240px minmax(0, 1120px);
```

Change:

```css
gap: clamp(48px, 6vw, 84px);
```

to:

```css
gap: clamp(36px, 5vw, 72px);
```

- [ ] **Step 2: Keep the mobile layout single-column**

Leave the existing `@media (max-width: 860px)` grid rule as:

```css
grid-template-columns: 1fr;
```

Expected: the primitive sidebar stacks above docs content on small screens, and the right rail TOC is hidden by the TOC component at `max-width: 1180px`.

- [ ] **Step 3: Run the production build**

Run:

```bash
pnpm run build:www
```

Expected: PASS with no Angular template, TypeScript, or component style budget errors.

- [ ] **Step 4: Run the docs specs**

Run:

```bash
pnpm exec vitest run projects/www/src/app/docs/docs-table-of-contents.spec.ts projects/www/src/app/docs/docs-search.spec.ts
```

Expected: PASS for both docs specs.

- [ ] **Step 5: Manual browser check**

Run:

```bash
pnpm run start:www
```

Open the local server URL printed by Nx, then check `/docs/components/chain-of-thought`.

Expected:
- The right rail shows "On this page".
- Top-level links include Install, Anatomy, Preview, API, and Related Primitives.
- API symbol links appear nested under API and display only symbol names.
- Clicking `ChainOfThoughtStep` scrolls to the matching API symbol heading.
- The active link changes as the page scrolls past each section or API symbol.
- The TOC is hidden on narrow viewports.

- [ ] **Step 6: Commit the layout adjustment**

Run:

```bash
git add projects/www/src/app/docs/docs-shell.page.ts
git commit -m "style: make room for docs right rail"
```

Expected: commit succeeds.

---

## Final Verification

- [ ] Run all targeted docs specs:

```bash
pnpm exec vitest run projects/www/src/app/docs/docs-table-of-contents.spec.ts projects/www/src/app/docs/docs-search.spec.ts
```

Expected: PASS.

- [ ] Run the docs app build:

```bash
pnpm run build:www
```

Expected: PASS.

- [ ] Inspect changed files:

```bash
git diff --stat HEAD
```

Expected: only TOC, docs page, docs shell, and docs test files are changed after the last commit checkpoint.

## Self-Review

- Spec coverage: The plan covers section-level links, nested API symbol-name links, stable heading IDs, active scroll state, responsive hiding, and build/test verification.
- Placeholder scan: The plan contains no placeholder implementation steps.
- Type consistency: `DocsTableOfContentsItem`, `apiSymbolHeadingId`, `buildComponentDocsTableOfContents`, `DocsTableOfContents`, and `tableOfContents` names are consistent across tasks.

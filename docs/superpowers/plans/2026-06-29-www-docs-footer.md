# WWW Docs Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a restrained, global footer to the `www` docs site with a standalone CTA row and grouped component links.

**Architecture:** Footer link grouping lives in a pure helper so it can be tested without rendering Angular. `FooterComponent` renders the CTA and grouped docs links using the existing `componentDocs` registry as the source of truth. The app shell changes from a `main.site-shell` wrapper to `div.site-shell > header + main + footer` landmarks.

**Tech Stack:** Angular 22 standalone components, Angular Router `RouterLink`, SCSS/CSS variables, Vitest for pure helper coverage, Nx Angular build for integration verification.

---

## File Structure

- Create `projects/www/src/app/footer-link-groups.ts`: pure footer grouping helper derived from `componentDocs`.
- Create `projects/www/src/app/footer-link-groups.spec.ts`: Vitest coverage for footer grouping, route generation, and full component coverage.
- Create `projects/www/src/app/footer.component.ts`: global footer component with inline template and styles.
- Modify `projects/www/src/app/app.ts`: import `FooterComponent`.
- Modify `projects/www/src/app/app.html`: render header, routed main content, and footer as separate landmarks.
- Modify `projects/www/src/styles.scss`: keep `.site-shell` as the page wrapper and add `.site-main`.

The footer will omit an external Project column for this pass because no real GitHub or npm package URL is present in the current `www` app. The CTA and grouped component links cover the approved scope.

---

### Task 1: Add Tested Footer Link Groups

**Files:**
- Create: `projects/www/src/app/footer-link-groups.ts`
- Create: `projects/www/src/app/footer-link-groups.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `projects/www/src/app/footer-link-groups.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { componentDocs } from './docs/component-docs.registry';
import { footerAllComponentsLink, footerLinkGroups } from './footer-link-groups';

describe('footer link groups', () => {
  it('groups every component doc exactly once', () => {
    const groupedSlugs = footerLinkGroups.flatMap((group) =>
      group.links.flatMap((link) => (link.slug ? [link.slug] : [])),
    );

    expect(groupedSlugs).toEqual([
      'conversation',
      'message',
      'attachment',
      'sources',
      'task',
      'tool',
      'confirmation',
      'checkpoint',
      'reasoning',
      'chain-of-thought',
      'context',
      'code-block',
      'shimmer',
    ]);
    expect(new Set(groupedSlugs).size).toBe(groupedSlugs.length);
    expect(groupedSlugs.toSorted()).toEqual(componentDocs.map((doc) => doc.slug).toSorted());
  });

  it('uses docs routes for component links', () => {
    const conversation = footerLinkGroups
      .flatMap((group) => group.links)
      .find((link) => link.slug === 'conversation');

    expect(conversation).toEqual({
      slug: 'conversation',
      title: 'Conversation',
      route: ['/docs/components', 'conversation'],
    });
    expect(footerAllComponentsLink).toEqual({
      title: 'All components',
      route: ['/docs/components'],
    });
  });

  it('keeps approved group headings stable', () => {
    expect(footerLinkGroups.map((group) => group.title)).toEqual([
      'Chat',
      'Agent',
      'Thinking',
      'Output',
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm exec vitest run projects/www/src/app/footer-link-groups.spec.ts
```

Expected: FAIL because `./footer-link-groups` does not exist.

- [ ] **Step 3: Add the grouping helper**

Create `projects/www/src/app/footer-link-groups.ts`:

```ts
import {
  type ComponentDoc,
  type ComponentDocSlug,
  componentDocs,
} from './docs/component-docs.registry';

export interface FooterComponentLink {
  readonly slug?: ComponentDocSlug;
  readonly title: string;
  readonly route: readonly string[];
}

export interface FooterLinkGroup {
  readonly title: string;
  readonly links: readonly FooterComponentLink[];
}

const footerComponentGroups = [
  {
    title: 'Chat',
    slugs: ['conversation', 'message', 'attachment', 'sources'],
  },
  {
    title: 'Agent',
    slugs: ['task', 'tool', 'confirmation', 'checkpoint'],
  },
  {
    title: 'Thinking',
    slugs: ['reasoning', 'chain-of-thought', 'context'],
  },
  {
    title: 'Output',
    slugs: ['code-block', 'shimmer'],
  },
] as const satisfies readonly {
  readonly title: string;
  readonly slugs: readonly ComponentDocSlug[];
}[];

const componentDocsBySlug = new Map<ComponentDocSlug, ComponentDoc>(
  componentDocs.map((doc) => [doc.slug, doc]),
);

export const footerAllComponentsLink = {
  title: 'All components',
  route: ['/docs/components'],
} as const satisfies FooterComponentLink;

export const footerLinkGroups = footerComponentGroups.map((group) => ({
  title: group.title,
  links:
    group.title === 'Output'
      ? [...group.slugs.map(componentLinkForSlug), footerAllComponentsLink]
      : group.slugs.map(componentLinkForSlug),
})) satisfies readonly FooterLinkGroup[];

function componentLinkForSlug(slug: ComponentDocSlug): FooterComponentLink {
  const doc = componentDocsBySlug.get(slug);

  if (!doc) {
    throw new Error(`Footer component group references unknown component doc slug: ${slug}`);
  }

  return {
    slug: doc.slug,
    title: doc.title,
    route: ['/docs/components', doc.slug],
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
pnpm exec vitest run projects/www/src/app/footer-link-groups.spec.ts
```

Expected: PASS for all three footer grouping tests.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add projects/www/src/app/footer-link-groups.ts projects/www/src/app/footer-link-groups.spec.ts
git commit -m "Add docs footer link groups"
```

---

### Task 2: Add The Footer Component

**Files:**
- Create: `projects/www/src/app/footer.component.ts`

- [ ] **Step 1: Create the footer component**

Create `projects/www/src/app/footer.component.ts`:

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { footerLinkGroups } from './footer-link-groups';

@Component({
  imports: [RouterLink],
  selector: 'app-footer',
  template: `
    <footer class="site-footer">
      <div class="site-footer-container">
        <section class="site-footer-cta" aria-labelledby="site-footer-title">
          <h2 id="site-footer-title">Build your next Angular AI surface.</h2>

          <a class="site-footer-button" routerLink="/docs/components">Explore components</a>
        </section>

        <nav class="site-footer-nav" aria-label="Footer navigation">
          <div class="site-footer-brand">
            <h2>Duxkit UI</h2>
            <p>Angular primitives for AI SDK apps, agent workflows, and generated output.</p>
          </div>

          @for (group of footerLinkGroups; track group.title) {
            <section class="site-footer-group" [attr.aria-labelledby]="'footer-' + group.title">
              <h3 [id]="'footer-' + group.title">{{ group.title }}</h3>

              <ul>
                @for (link of group.links; track link.title) {
                  <li>
                    <a [routerLink]="link.route">{{ link.title }}</a>
                  </li>
                }
              </ul>
            </section>
          }
        </nav>
      </div>
    </footer>
  `,
  styles: `
    :host {
      display: block;
    }

    .site-footer {
      border-top: 1px solid var(--border);
      background: var(--background);
      color: var(--foreground);
    }

    .site-footer-container {
      width: min(100% - 48px, 1024px);
      margin: 0 auto;
    }

    .site-footer-cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      border-bottom: 1px solid var(--border);
      padding: clamp(48px, 7vw, 82px) 0;
    }

    .site-footer-cta h2 {
      max-width: 780px;
      margin: 0;
      font-size: clamp(2.5rem, 7vw, 5rem);
      line-height: 1.02;
      font-weight: 600;
      letter-spacing: 0;
    }

    .site-footer-button {
      min-height: 40px;
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      padding: 0 18px;
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: 14px;
      font-weight: 560;
      text-decoration: none;
      outline-offset: 3px;
    }

    .site-footer-button:focus-visible,
    .site-footer a:focus-visible {
      outline: 2px solid #0069ff;
    }

    .site-footer-nav {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) repeat(4, minmax(0, 1fr));
      gap: clamp(24px, 4vw, 44px);
      padding: 34px 0 44px;
    }

    .site-footer-brand,
    .site-footer-group {
      min-width: 0;
    }

    .site-footer-brand h2,
    .site-footer-group h3 {
      margin: 0;
      color: var(--foreground);
      font-size: 14px;
      line-height: 1.4;
      font-weight: 650;
      letter-spacing: 0;
    }

    .site-footer-brand p {
      max-width: 250px;
      margin: 10px 0 0;
      color: var(--muted-foreground);
      font-size: 14px;
      line-height: 1.55;
    }

    .site-footer-group ul {
      display: grid;
      gap: 8px;
      margin: 10px 0 0;
      padding: 0;
      list-style: none;
    }

    .site-footer-group a {
      color: var(--muted-foreground);
      font-size: 14px;
      line-height: 1.45;
      text-decoration: none;
      outline-offset: 3px;
      transition: color 150ms ease;
    }

    .site-footer-group a:hover,
    .site-footer-group a:focus-visible {
      color: var(--foreground);
    }

    @media (max-width: 860px) {
      .site-footer-nav {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .site-footer-brand {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 640px) {
      .site-footer-container {
        width: min(100% - 32px, 1024px);
      }

      .site-footer-cta {
        align-items: flex-start;
        flex-direction: column;
        gap: 22px;
      }

      .site-footer-nav {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class FooterComponent {
  protected readonly footerLinkGroups = footerLinkGroups;
}
```

- [ ] **Step 2: Run a build to verify the component compiles in isolation**

Run:

```bash
pnpm nx build www --configuration development
```

Expected: PASS with `www` build output under `dist/www`.

- [ ] **Step 3: Commit Task 2**

Run:

```bash
git add projects/www/src/app/footer.component.ts
git commit -m "Add www docs footer component"
```

---

### Task 3: Render The Footer In The App Shell

**Files:**
- Modify: `projects/www/src/app/app.ts`
- Modify: `projects/www/src/app/app.html`
- Modify: `projects/www/src/styles.scss`

- [ ] **Step 1: Import the footer component**

Update `projects/www/src/app/app.ts` to:

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

@Component({
  imports: [FooterComponent, HeaderComponent, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
```

- [ ] **Step 2: Update the shell markup**

Update `projects/www/src/app/app.html` to:

```html
<div class="site-shell">
  <app-header />

  <main class="site-main">
    <router-outlet />
  </main>

  <app-footer />
</div>
```

- [ ] **Step 3: Add the main wrapper style**

In `projects/www/src/styles.scss`, keep the existing `.site-shell` rule and add this directly after it:

```scss
.site-main {
  min-width: 0;
}
```

- [ ] **Step 4: Run the footer grouping test**

Run:

```bash
pnpm exec vitest run projects/www/src/app/footer-link-groups.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Run the docs build**

Run:

```bash
pnpm nx build www --configuration development
```

Expected: PASS.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add projects/www/src/app/app.ts projects/www/src/app/app.html projects/www/src/styles.scss
git commit -m "Render global docs footer"
```

---

### Task 4: Visual And Accessibility Verification

**Files:**
- No code changes expected.

- [ ] **Step 1: Start the docs server**

Run:

```bash
pnpm start:www
```

Expected: Nx serves the `www` app locally and prints a localhost URL.

- [ ] **Step 2: Verify desktop layout**

Open the served home page and `/docs/components`.

Expected:

- Footer appears below page content on both routes.
- Footer content is centered in a restrained container and does not stretch edge to edge.
- CTA row appears above the link grid.
- CTA title and button are on one row at desktop width.
- Link grid columns are readable and aligned.

- [ ] **Step 3: Verify mobile layout**

Use a viewport around 390px wide.

Expected:

- CTA title stacks above the button.
- Footer container has 16px side gutters from `width: min(100% - 32px, 1024px)`.
- Link groups stack into a single column.
- No text overlaps or horizontal scrolling occurs.

- [ ] **Step 4: Verify keyboard and theme behavior**

Use Tab navigation and the existing theme toggle.

Expected:

- Every footer link and the CTA receive visible focus outlines.
- Link text has readable contrast in light and dark themes.
- The footer background, border, and text colors follow theme variables.

- [ ] **Step 5: Stop the docs server**

Stop the running server with `Ctrl+C`.

- [ ] **Step 6: Commit verification fixes only if needed**

If verification requires CSS adjustments, commit only those changed files:

```bash
git add projects/www/src/app/footer.component.ts projects/www/src/styles.scss
git commit -m "Polish docs footer responsiveness"
```

Expected: No commit is needed if Task 4 finds no issues.

---

## Final Verification

Run:

```bash
pnpm exec vitest run projects/www/src/app/footer-link-groups.spec.ts
pnpm nx build www --configuration development
git status --short
```

Expected:

- Footer grouping test passes.
- `www` development build passes.
- `git status --short` shows only pre-existing unrelated worktree changes, if any.

# Private UI Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move generated Spartan HLM components out of the publishable `duxkit-ai` package and into a private `projects/ui` Nx library shared by `www` and `playground`.

**Architecture:** `projects/ui` is a private workspace library, not a package API. Spartan CLI writes HLM components under `projects/ui/helm` with imports rooted at `@duxkit/ui/helm/*`. `duxkit-ai` remains publishable and must not import or expose private UI code.

**Tech Stack:** Nx 23, Angular 22, TypeScript 6, Spartan CLI `@spartan-ng/cli`, Spartan HLM/Brain, pnpm.

---

## File Structure

- Create `projects/ui/project.json`: Nx project definition for the private UI library.
- Create `projects/ui/src/index.ts`: minimal root entrypoint for the private UI library.
- Create `projects/ui/tsconfig.json`: TypeScript project config for the UI library.
- Create `projects/ui/tsconfig.lib.json`: TypeScript library config.
- Create `projects/ui/helm/**`: Spartan-generated HLM entrypoints and implementation files.
- Modify `components.json`: point Spartan CLI generation at `projects/ui/helm`.
- Modify `tsconfig.json`: replace `duxkit-ai/helm/*` path aliases with `@duxkit/ui/*` aliases and add the UI tsconfig reference.
- Modify `projects/www/project.json`: add `ui` as an implicit dependency if Nx does not infer it.
- Modify `projects/playground/project.json`: add `ui` as an implicit dependency if Nx does not infer it.
- Modify `projects/www/tsconfig.app.json`: remove old `duxkit-ai/helm/*` app path override.
- Modify `projects/playground/tsconfig.app.json`: remove old `duxkit-ai/helm/*` app path override.
- Modify `projects/playground/tsconfig.spec.json`: remove old `duxkit-ai/helm/*` spec path override.
- Modify `projects/www/src/app/app.ts`: import HLM components from `@duxkit/ui/helm/*`.
- Modify `projects/playground/src/app/app.ts`: import HLM components from `@duxkit/ui/helm/*`.
- Modify `projects/duxkit-ai/src/lib/confirmation/confirmation.stories.ts`: remove `duxkit-ai/helm/*` import without introducing an import from `@duxkit/ui/*`.
- Modify `projects/duxkit-ai/src/lib/tool/tool.stories.ts`: remove `duxkit-ai/helm/*` import without introducing an import from `@duxkit/ui/*`.
- Modify `README.md`: document private app UI library instead of public Helm entrypoints.
- Modify `projects/duxkit-ai/README.md`: remove generated Helm secondary entrypoint documentation.
- Delete `projects/duxkit-ai/helm/**`: remove generated HLM code from the publishable package tree.

---

### Task 1: Scaffold Private UI Library

**Files:**
- Create: `projects/ui/project.json`
- Create: `projects/ui/src/index.ts`
- Create: `projects/ui/tsconfig.json`
- Create: `projects/ui/tsconfig.lib.json`
- Modify: `tsconfig.json`

- [ ] **Step 1: Generate the library shell**

Run:

```bash
pnpm exec nx g @nx/angular:library projects/ui --name=ui --importPath=@duxkit/ui --prefix=ui --style=scss --unitTestRunner=none --linter=none --skipFormat
```

Expected: Nx creates `projects/ui` and updates root workspace config files. The generated project must not be publishable.

- [ ] **Step 2: Normalize the UI project config**

Open `projects/ui/project.json` and ensure it has this shape:

```json
{
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "name": "ui",
  "projectType": "library",
  "sourceRoot": "projects/ui/src",
  "prefix": "ui",
  "targets": {},
  "tags": []
}
```

If the Nx generator creates extra component targets or generated sample component files, remove only generated sample component files that are not needed for `projects/ui/helm`. Keep TypeScript config files and the project definition.

- [ ] **Step 3: Normalize the root UI entrypoint**

Set `projects/ui/src/index.ts` to:

```ts
// Private workspace UI entrypoint.
// Import generated HLM primitives from @duxkit/ui/helm/*.
```

Expected: the root private UI import path exists but does not export generated HLM primitives from a barrel.

- [ ] **Step 4: Check root TypeScript references**

Open `tsconfig.json` and ensure `references` includes:

```json
{
  "path": "./projects/ui/tsconfig.lib.json"
}
```

Do not remove existing references for `duxkit-ai`, `playground`, or `www`.

- [ ] **Step 5: Verify scaffold status**

Run:

```bash
git status --short
```

Expected: created `projects/ui/**` files and root config changes only.

- [ ] **Step 6: Commit scaffold**

Run:

```bash
git add projects/ui tsconfig.json
git commit -m "chore: add private ui library"
```

Expected: commit succeeds.

---

### Task 2: Configure Spartan CLI And Generate HLM Components

**Files:**
- Modify: `components.json`
- Modify: `tsconfig.json`
- Create: `projects/ui/helm/button/**`
- Create: `projects/ui/helm/navigation-menu/**`
- Create: `projects/ui/helm/tabs/**`
- Create: `projects/ui/helm/utils/**`
- Create: `projects/ui/helm/icon/**` if generated as a dependency

- [ ] **Step 1: Point Spartan CLI at the private UI library**

Set `components.json` to:

```json
{
  "componentsPath": "projects/ui/helm",
  "buildable": false,
  "generateAs": "library",
  "importAlias": "@duxkit/ui/helm"
}
```

- [ ] **Step 2: Generate Navigation Menu**

Run:

```bash
pnpm exec ng g @spartan-ng/cli:ui navigation-menu --interactive=false
```

Expected: files are generated under `projects/ui/helm/navigation-menu` and any required dependencies under `projects/ui/helm`.

- [ ] **Step 3: Generate Button**

Run:

```bash
pnpm exec ng g @spartan-ng/cli:ui button --interactive=false
```

Expected: files are generated under `projects/ui/helm/button`.

- [ ] **Step 4: Generate Tabs**

Run:

```bash
pnpm exec ng g @spartan-ng/cli:ui tabs --interactive=false
```

Expected: files are generated under `projects/ui/helm/tabs`; if the CLI needs icon support it generates or uses `projects/ui/helm/icon`.

- [ ] **Step 5: Add path aliases for generated HLM entrypoints**

Update `compilerOptions.paths` in `tsconfig.json` so it contains these aliases:

```json
"@duxkit/ui": ["./projects/ui/src/index.ts"],
"@duxkit/ui/helm/button": ["./projects/ui/helm/button/src/index.ts"],
"@duxkit/ui/helm/navigation-menu": [
  "./projects/ui/helm/navigation-menu/src/index.ts"
],
"@duxkit/ui/helm/tabs": ["./projects/ui/helm/tabs/src/index.ts"],
"@duxkit/ui/helm/utils": ["./projects/ui/helm/utils/src/index.ts"]
```

If `projects/ui/helm/icon/src/index.ts` exists, also add:

```json
"@duxkit/ui/helm/icon": ["./projects/ui/helm/icon/src/index.ts"]
```

Remove every root path alias that starts with `duxkit-ai/helm/`.

- [ ] **Step 6: Verify generated internal imports**

Run:

```bash
rg -n "duxkit-ai/helm|@spartan-ng/helm" projects/ui/helm tsconfig.json components.json
```

Expected: no matches for `duxkit-ai/helm`. Matches for Spartan package imports are acceptable only when generated by Spartan and not pointing at the old local package namespace.

- [ ] **Step 7: Commit Spartan generation**

Run:

```bash
git add components.json tsconfig.json projects/ui/helm
git commit -m "chore: generate private spartan ui primitives"
```

Expected: commit succeeds.

---

### Task 3: Migrate App Imports To Private UI Library

**Files:**
- Modify: `projects/www/src/app/app.ts`
- Modify: `projects/playground/src/app/app.ts`
- Modify: `projects/www/tsconfig.app.json`
- Modify: `projects/playground/tsconfig.app.json`
- Modify: `projects/playground/tsconfig.spec.json`
- Modify: `projects/www/project.json`
- Modify: `projects/playground/project.json`

- [ ] **Step 1: Update `www` component imports**

In `projects/www/src/app/app.ts`, replace:

```ts
import { HlmButton } from 'duxkit-ai/helm/button';
import { HlmIcon } from 'duxkit-ai/helm/icon';
```

with:

```ts
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmIcon } from '@duxkit/ui/helm/icon';
```

If `HlmIcon` is not generated by the Spartan tabs dependency, run:

```bash
pnpm exec ng g @spartan-ng/cli:ui icon --interactive=false
```

Then add the `@duxkit/ui/helm/icon` path alias from Task 2.

- [ ] **Step 2: Update `playground` component imports**

In `projects/playground/src/app/app.ts`, replace:

```ts
import { HlmButton } from 'duxkit-ai/helm/button';
```

with:

```ts
import { HlmButton } from '@duxkit/ui/helm/button';
```

- [ ] **Step 3: Remove app-local old Helm path overrides**

In `projects/www/tsconfig.app.json`, remove this path entry:

```json
"duxkit-ai/helm/*": ["../../dist/duxkit-ai/helm/*", "./dist/duxkit-ai/helm/*"]
```

In `projects/playground/tsconfig.app.json`, remove this path entry:

```json
"duxkit-ai/helm/*": ["../../dist/duxkit-ai/helm/*", "./dist/duxkit-ai/helm/*"]
```

In `projects/playground/tsconfig.spec.json`, remove this path entry:

```json
"duxkit-ai/helm/*": ["../../dist/duxkit-ai/helm/*", "./dist/duxkit-ai/helm/*"]
```

Keep each remaining `duxkit-ai` path override unchanged.

- [ ] **Step 4: Add explicit Nx app dependencies**

In `projects/www/project.json`, set `implicitDependencies` to:

```json
"implicitDependencies": [
  "duxkit-ai",
  "ui"
]
```

In `projects/playground/project.json`, set `implicitDependencies` to:

```json
"implicitDependencies": [
  "duxkit-ai",
  "ui"
]
```

- [ ] **Step 5: Verify app import hygiene**

Run:

```bash
rg -n "duxkit-ai/helm" projects/www projects/playground
```

Expected: no matches.

- [ ] **Step 6: Build apps**

Run:

```bash
pnpm nx build www
pnpm nx build playground
```

Expected: both builds succeed.

- [ ] **Step 7: Commit app migration**

Run:

```bash
git add projects/www projects/playground tsconfig.json projects/ui/helm/icon
git commit -m "refactor: use private ui primitives in apps"
```

Expected: commit succeeds. If `projects/ui/helm/icon` was not created or changed, omit that path from `git add`.

---

### Task 4: Remove HLM From The Publishable Package Boundary

**Files:**
- Modify: `projects/duxkit-ai/src/lib/confirmation/confirmation.stories.ts`
- Modify: `projects/duxkit-ai/src/lib/tool/tool.stories.ts`
- Modify: `README.md`
- Modify: `projects/duxkit-ai/README.md`
- Delete: `projects/duxkit-ai/helm/**`

- [ ] **Step 1: Update confirmation story button import**

In `projects/duxkit-ai/src/lib/confirmation/confirmation.stories.ts`, replace:

```ts
import { HlmButton } from 'duxkit-ai/helm/button';
```

with:

```ts
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
```

Then replace `HlmButton` in the story `imports` array with `HlmButtonDirective`.

- [ ] **Step 2: Update tool story button import**

In `projects/duxkit-ai/src/lib/tool/tool.stories.ts`, replace:

```ts
import { HlmButton } from 'duxkit-ai/helm/button';
```

with:

```ts
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
```

Then replace `HlmButton` in the story `imports` array with `HlmButtonDirective`.

- [ ] **Step 3: Confirm no private UI imports in `duxkit-ai` source**

Run:

```bash
rg -n "@duxkit/ui|duxkit-ai/helm" projects/duxkit-ai/src
```

Expected: no matches for `@duxkit/ui` or `duxkit-ai/helm`.

- [ ] **Step 4: Delete old generated Helm package tree**

Run:

```bash
rm -rf projects/duxkit-ai/helm
```

Expected: `projects/duxkit-ai/helm` no longer exists.

- [ ] **Step 5: Update root README**

In `README.md`, replace the "Generated Spartan Helm entrypoints" section with:

~~~md
Private app UI primitives:

```ts
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmTabs } from '@duxkit/ui/helm/tabs';
import { HlmNavigationMenu } from '@duxkit/ui/helm/navigation-menu';
```

These imports are for workspace apps only. They are not part of the published `duxkit-ai` package.
~~~

In the "Generate More Helm Components" section, replace:

```text
projects/duxkit-ai/helm
```

with:

```text
projects/ui/helm
```

Replace the existing sample generation commands with:

```bash
pnpm exec ng g @spartan-ng/cli:ui navigation-menu --interactive=false
pnpm exec ng g @spartan-ng/cli:ui button --interactive=false
pnpm exec ng g @spartan-ng/cli:ui tabs --interactive=false
```

Remove the paragraph that says generated primitives should get `ng-package.json` files when published.

- [ ] **Step 6: Update package README**

In `projects/duxkit-ai/README.md`, remove the list of `duxkit-ai/helm/*` secondary entrypoints.

Add this sentence near the package entrypoint documentation:

```md
Generated Spartan HLM primitives are private workspace UI code and are not published by `duxkit-ai`.
```

- [ ] **Step 7: Verify package boundary**

Run:

```bash
rg -n "duxkit-ai/helm|projects/duxkit-ai/helm|@duxkit/ui" README.md projects tsconfig.json components.json
```

Expected:

- No `duxkit-ai/helm` matches.
- No `projects/duxkit-ai/helm` matches.
- `@duxkit/ui` matches only in workspace app code, docs, root `tsconfig.json`, and generated `projects/ui/helm` code.
- No `@duxkit/ui` matches under `projects/duxkit-ai/src`.

- [ ] **Step 8: Build and test publishable package**

Run:

```bash
pnpm nx build duxkit-ai
pnpm nx test duxkit-ai -- --watch=false
```

Expected: both commands succeed.

- [ ] **Step 9: Confirm package output has no Helm entrypoints**

Run:

```bash
find dist/duxkit-ai -maxdepth 3 -type d | sort | rg "/helm($|/)"
```

Expected: no output.

- [ ] **Step 10: Commit package boundary cleanup**

Run:

```bash
git add README.md projects/duxkit-ai tsconfig.json components.json
git add -u projects/duxkit-ai/helm
git commit -m "refactor: remove helm primitives from package api"
```

Expected: commit succeeds.

---

### Task 5: Final Verification

**Files:**
- Read: `docs/superpowers/specs/2026-06-26-private-ui-library-design.md`
- Read: `docs/superpowers/plans/2026-06-26-private-ui-library.md`

- [ ] **Step 1: Run full build targets**

Run:

```bash
pnpm nx build www
pnpm nx build playground
pnpm nx build duxkit-ai
```

Expected: all builds succeed.

- [ ] **Step 2: Run tests**

Run:

```bash
pnpm nx test duxkit-ai -- --watch=false
```

Expected: tests pass.

- [ ] **Step 3: Verify old public Helm namespace is gone**

Run:

```bash
rg -n "duxkit-ai/helm|projects/duxkit-ai/helm" README.md projects tsconfig.json components.json package.json
```

Expected: no matches.

- [ ] **Step 4: Verify private UI namespace is not used by package source**

Run:

```bash
rg -n "@duxkit/ui" projects/duxkit-ai/src
```

Expected: no matches.

- [ ] **Step 5: Verify generated requested components exist**

Run:

```bash
test -f projects/ui/helm/navigation-menu/src/index.ts
test -f projects/ui/helm/button/src/index.ts
test -f projects/ui/helm/tabs/src/index.ts
```

Expected: all commands exit successfully.

- [ ] **Step 6: Review final diff**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: working tree is clean after the task commits. Recent commits include the UI scaffold, Spartan generation, app migration, and package boundary cleanup.

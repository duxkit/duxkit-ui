# Repo Conventions Tidy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make repo file and folder conventions consistent across docs, Helm UI modules, workspace metadata, and www docs data.

**Architecture:** Treat every `projects/ui/helm/*` entry as a first-class Nx library module because callers already import them through first-class `@duxkit/ui/helm/*` path aliases. Keep documentation source under version control, and move component-doc snippets into focused data modules so page rendering is not the source of truth for primitive metadata.

**Tech Stack:** Nx 23, pnpm 10, Angular 22, TypeScript 6, Vitest/Nx unit tests, generated docs metadata via `pnpm docs:generate-metadata`.

---

## Guardrails

- Do not touch unrelated primitive implementation files.
- Do not revert existing user work.
- Do not introduce Angular `standalone: true` or explicit `ChangeDetectionStrategy.OnPush`.
- Keep new files ASCII-only.
- Use `apply_patch` for manual edits.
- Commit after each task if the user still wants commits.
- Run the exact verification command in each task before committing that task.

## File Map

- `.gitignore`: remove the broad `/docs/` ignore rule and replace it only if a generated docs artifact actually needs ignoring.
- `projects/ui/helm/button/project.json`: create missing Nx project metadata.
- `projects/ui/helm/icon/project.json`: create missing Nx project metadata.
- `projects/ui/helm/navigation-menu/project.json`: create missing Nx project metadata.
- `projects/ui/helm/tabs/project.json`: create missing Nx project metadata.
- `projects/ui/helm/utils/project.json`: create missing Nx project metadata.
- `projects/ui/helm/*/tsconfig.lib.json`: normalize library compiler options across every Helm module.
- `docs/workspace-conventions.md`: document the intended workspace ownership rules.
- `projects/www/src/app/docs/component-doc-snippets.ts`: create a focused module for import and anatomy snippet data.
- `projects/www/src/app/docs/component-doc.page.ts`: consume snippet data instead of defining it inline.
- `projects/www/src/app/docs/component-docs.registry.ts`: keep slug, title, and description only.
- `projects/www/src/app/docs/docs-search.spec.ts`: extend coverage so every registered primitive has snippet data.

---

### Task 1: Make Docs Trackable

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Confirm the current ignore behavior**

Run:

```bash
git check-ignore -v docs/new-plan-check.md || true
```

Expected before the fix:

```text
.gitignore:61:/docs/	docs/new-plan-check.md
```

- [ ] **Step 2: Remove the broad docs ignore rule**

Modify `.gitignore` by deleting this line:

```gitignore
/docs/
```

Keep the local-agent artifact ignore:

```gitignore
# Local agent artifacts
/.agents/
```

- [ ] **Step 3: Verify docs are no longer ignored**

Run:

```bash
git check-ignore -v docs/new-plan-check.md || true
```

Expected after the fix: no output.

- [ ] **Step 4: Verify normal ignored paths still work**

Run:

```bash
git check-ignore -v .agents/tmp.md .nx/cache/example .angular/cache/example
```

Expected: each path is still ignored by `.gitignore`.

- [ ] **Step 5: Commit**

Run:

```bash
git add .gitignore
git commit -m "chore: track repository docs"
```

Expected: commit succeeds with only `.gitignore` staged.

---

### Task 2: Add Missing Helm Nx Project Metadata

**Files:**
- Create: `projects/ui/helm/button/project.json`
- Create: `projects/ui/helm/icon/project.json`
- Create: `projects/ui/helm/navigation-menu/project.json`
- Create: `projects/ui/helm/tabs/project.json`
- Create: `projects/ui/helm/utils/project.json`

- [ ] **Step 1: Confirm current Nx project list**

Run:

```bash
pnpm exec nx show projects
```

Expected before the fix: the list includes `command`, `dialog`, `input`, `input-group`, and `textarea`, but does not include `button`, `icon`, `navigation-menu`, `tabs`, or `utils`.

- [ ] **Step 2: Add `button` project metadata**

Create `projects/ui/helm/button/project.json`:

```json
{
  "name": "button",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/ui/helm/button/src",
  "prefix": "hlm",
  "projectType": "library",
  "tags": []
}
```

- [ ] **Step 3: Add `icon` project metadata**

Create `projects/ui/helm/icon/project.json`:

```json
{
  "name": "icon",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/ui/helm/icon/src",
  "prefix": "hlm",
  "projectType": "library",
  "tags": []
}
```

- [ ] **Step 4: Add `navigation-menu` project metadata**

Create `projects/ui/helm/navigation-menu/project.json`:

```json
{
  "name": "navigation-menu",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/ui/helm/navigation-menu/src",
  "prefix": "hlm",
  "projectType": "library",
  "tags": []
}
```

- [ ] **Step 5: Add `tabs` project metadata**

Create `projects/ui/helm/tabs/project.json`:

```json
{
  "name": "tabs",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/ui/helm/tabs/src",
  "prefix": "hlm",
  "projectType": "library",
  "tags": []
}
```

- [ ] **Step 6: Add `utils` project metadata**

Create `projects/ui/helm/utils/project.json`:

```json
{
  "name": "utils",
  "$schema": "../../../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "projects/ui/helm/utils/src",
  "prefix": "hlm",
  "projectType": "library",
  "tags": []
}
```

- [ ] **Step 7: Verify Nx sees every Helm module**

Run:

```bash
pnpm exec nx show projects
```

Expected after the fix: the JSON list includes all of these project names:

```text
button
command
dialog
icon
input
input-group
navigation-menu
tabs
textarea
utils
```

- [ ] **Step 8: Commit**

Run:

```bash
git add projects/ui/helm/button/project.json projects/ui/helm/icon/project.json projects/ui/helm/navigation-menu/project.json projects/ui/helm/tabs/project.json projects/ui/helm/utils/project.json
git commit -m "chore: register helm libraries with nx"
```

Expected: commit succeeds with only the five new `project.json` files staged.

---

### Task 3: Normalize Helm Library TypeScript Config

**Files:**
- Modify: `projects/ui/helm/button/tsconfig.lib.json`
- Modify: `projects/ui/helm/command/tsconfig.lib.json`
- Modify: `projects/ui/helm/dialog/tsconfig.lib.json`
- Modify: `projects/ui/helm/icon/tsconfig.lib.json`
- Modify: `projects/ui/helm/input/tsconfig.lib.json`
- Modify: `projects/ui/helm/input-group/tsconfig.lib.json`
- Modify: `projects/ui/helm/navigation-menu/tsconfig.lib.json`
- Modify: `projects/ui/helm/tabs/tsconfig.lib.json`
- Modify: `projects/ui/helm/textarea/tsconfig.lib.json`
- Modify: `projects/ui/helm/utils/tsconfig.lib.json`

- [ ] **Step 1: Confirm the current drift**

Run:

```bash
for file in projects/ui/helm/*/tsconfig.lib.json; do
  printf '\n## %s\n' "$file"
  sed -n '1,80p' "$file"
done
```

Expected before the fix: some files contain `"rootDir": ".."` and some contain `"inlineSources": true`.

- [ ] **Step 2: Replace every Helm `tsconfig.lib.json` with the shared shape**

For each file listed in this task, use this exact content:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../dist/out-tsc",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts", "src/**/*.test.ts"]
}
```

- [ ] **Step 3: Verify all Helm configs match**

Run:

```bash
shasum projects/ui/helm/*/tsconfig.lib.json
```

Expected: every `tsconfig.lib.json` prints the same hash.

- [ ] **Step 4: Verify TypeScript still builds the UI library**

Run:

```bash
pnpm exec tsc -p projects/ui/tsconfig.lib.json
```

Expected: command exits `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add projects/ui/helm/*/tsconfig.lib.json
git commit -m "chore: normalize helm tsconfig files"
```

Expected: commit succeeds with only Helm `tsconfig.lib.json` files staged.

---

### Task 4: Document Workspace Ownership Rules

**Files:**
- Create: `docs/workspace-conventions.md`
- Modify: `README.md`

- [ ] **Step 1: Create the conventions document**

Create `docs/workspace-conventions.md`:

```markdown
# Workspace Conventions

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
```

- [ ] **Step 2: Link the conventions from the README**

In `README.md`, add this section near the development/setup section:

```markdown
## Workspace conventions

File and folder ownership rules are documented in [docs/workspace-conventions.md](docs/workspace-conventions.md).
```

- [ ] **Step 3: Verify the link target exists**

Run:

```bash
test -f docs/workspace-conventions.md && rg -n "Workspace conventions|docs/workspace-conventions.md" README.md docs/workspace-conventions.md
```

Expected: the command exits `0` and prints matches from both files.

- [ ] **Step 4: Commit**

Run:

```bash
git add README.md docs/workspace-conventions.md
git commit -m "docs: document workspace conventions"
```

Expected: commit succeeds with only `README.md` and `docs/workspace-conventions.md` staged.

---

### Task 5: Split Component Docs Snippets From The Page

**Files:**
- Create: `projects/www/src/app/docs/component-doc-snippets.ts`
- Modify: `projects/www/src/app/docs/component-doc.page.ts`
- Modify: `projects/www/src/app/docs/docs-search.spec.ts`

- [ ] **Step 1: Add coverage for snippet completeness**

Append this test to `projects/www/src/app/docs/docs-search.spec.ts`:

```ts
import {
  anatomySnippets,
  componentImports,
} from './component-doc-snippets';
import { componentPreviewSnippets } from './component-doc-preview.component';
import { componentDocs } from './component-docs.registry';

describe('component docs snippets', () => {
  it('keeps import, anatomy, and preview snippets for every registered component doc', () => {
    for (const doc of componentDocs) {
      expect(componentImports[doc.slug]).toContain("from 'duxkit-ai'");
      expect(anatomySnippets[doc.slug].trim().length).toBeGreaterThan(0);
      expect(componentPreviewSnippets[doc.slug].trim().length).toBeGreaterThan(0);
    }
  });
});
```

If `docs-search.spec.ts` already imports `componentDocs`, merge the imports instead of duplicating them.

- [ ] **Step 2: Run the failing docs test**

Run:

```bash
pnpm exec nx test www -- --watch=false --include projects/www/src/app/docs/docs-search.spec.ts
```

Expected: FAIL because `component-doc-snippets.ts` does not exist yet.

- [ ] **Step 3: Create the snippets module**

Create `projects/www/src/app/docs/component-doc-snippets.ts` with:

```ts
import { type ComponentDocSlug } from './component-docs.registry';

export const componentImports: Record<ComponentDocSlug, string> = {
  conversation:
    "import { Conversation, ConversationContent, ConversationScrollAnchor } from 'duxkit-ai';",
  message: "import { Message, MessageActions, MessageContent, MessageCopy } from 'duxkit-ai';",
  checkpoint: "import { Checkpoint, CheckpointIcon, CheckpointTrigger } from 'duxkit-ai';",
  context:
    "import { Context, ContextContent, ContextContentBody, ContextContentFooter, ContextContentHeader, ContextInputUsage, ContextOutputUsage, ContextTrigger } from 'duxkit-ai';",
  'model-selector':
    "import { ModelSelector, ModelSelectorContent, ModelSelectorDescription, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorGroupHeading, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorLogo, ModelSelectorName, ModelSelectorShortcut, ModelSelectorTitle, ModelSelectorTrigger } from 'duxkit-ai';",
  'prompt-input':
    "import { ModelSelector, ModelSelectorContent, ModelSelectorDescription, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorGroupHeading, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorLogo, ModelSelectorName, ModelSelectorTitle, ModelSelectorTrigger, PromptInput, PromptInputAddAttachment, PromptInputAttachments, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from 'duxkit-ai';",
  queue:
    "import { Queue, QueueItem, QueueItemAction, QueueItemActions, QueueItemAttachment, QueueItemContent, QueueItemDescription, QueueItemFile, QueueItemImage, QueueItemIndicator, QueueList, QueueSection, QueueSectionContent, QueueSectionCount, QueueSectionLabel, QueueSectionTrigger } from 'duxkit-ai';",
  attachment:
    "import { Attachment, AttachmentPreview, AttachmentRemove, Attachments } from 'duxkit-ai';",
  'chain-of-thought':
    "import { ChainOfThought, ChainOfThoughtContent, ChainOfThoughtImage, ChainOfThoughtImageCaption, ChainOfThoughtStep, ChainOfThoughtStepDescription, ChainOfThoughtStepIcon, ChainOfThoughtStepLabel, ChainOfThoughtTrigger } from 'duxkit-ai';",
  task: "import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from 'duxkit-ai';",
  tool: "import { Tool, ToolContent, ToolTrigger } from 'duxkit-ai';",
  reasoning: "import { Reasoning, ReasoningContent, ReasoningTrigger } from 'duxkit-ai';",
  sources: "import { Source, Sources, SourcesContent, SourcesTrigger } from 'duxkit-ai';",
  confirmation:
    "import { Confirmation, ConfirmationAction, ConfirmationActions, ConfirmationRequest, ConfirmationTitle } from 'duxkit-ai';",
  'code-block': "import { CodeBlock } from 'duxkit-ai';",
  shimmer: "import { Shimmer } from 'duxkit-ai';",
};
```

Move the existing `anatomySnippets` constant from `component-doc.page.ts` into this new file and export it:

```ts
export const anatomySnippets: Record<ComponentDocSlug, string> = {
  conversation: `<ai-conversation>
  <ai-conversation-content>
    <ai-message from="assistant">
      <ai-message-content markdown="Hello from your AI assistant." />
    </ai-message>
    <div aiConversationScrollAnchor></div>
  </ai-conversation-content>
</ai-conversation>`,
  message: `<ai-message from="assistant">
  <ai-message-content markdown="Message content supports markdown." />
</ai-message>`,
  checkpoint: `<ai-checkpoint>
  <ai-checkpoint-icon />
  <button aiCheckpointTrigger>Restore checkpoint</button>
</ai-checkpoint>`,
  context: `<ai-context [usedTokens]="40000" [maxTokens]="128000" [usage]="usage" modelId="openai:gpt-4o-mini">
  <button aiContextTrigger></button>
  <ai-context-content>
    <ai-context-content-header />
    <ai-context-content-body>
      <ai-context-input-usage />
      <ai-context-output-usage />
    </ai-context-content-body>
    <ai-context-content-footer />
  </ai-context-content>
</ai-context>`,
  'model-selector': `<ai-model-selector>
  <button aiModelSelectorTrigger>
    <ai-model-selector-logo provider="openai" />
    <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
  </button>
  <ai-model-selector-content>
    <h2 aiModelSelectorTitle class="sr-only">Choose a model</h2>
    <p aiModelSelectorDescription class="sr-only">Search and select an AI model.</p>
    <ai-model-selector-input placeholder="Search models..." />
    <ai-model-selector-list>
      <ai-model-selector-empty>No models found.</ai-model-selector-empty>
      <ai-model-selector-group>
        <ai-model-selector-group-heading>OpenAI</ai-model-selector-group-heading>
        <button aiModelSelectorItem value="gpt-4.1 GPT-4.1 openai OpenAI">
          <ai-model-selector-logo provider="openai" />
          <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
        </button>
      </ai-model-selector-group>
    </ai-model-selector-list>
  </ai-model-selector-content>
</ai-model-selector>`,
  'prompt-input': `<form aiPromptInput (promptSubmit)="sendMessage($event)">
  <textarea aiPromptInputTextarea placeholder="Ask a question..."></textarea>
  <ai-prompt-input-attachments />
  <ai-prompt-input-toolbar>
    <ai-prompt-input-tools>
      <ai-model-selector>
        <button aiModelSelectorTrigger>
          <ai-model-selector-logo provider="openai" />
          <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
        </button>
        <ai-model-selector-content>
          <h2 aiModelSelectorTitle class="sr-only">Choose a model</h2>
          <p aiModelSelectorDescription class="sr-only">Search and select an AI model.</p>
          <ai-model-selector-input placeholder="Search models..." />
          <ai-model-selector-list>
            <ai-model-selector-empty>No models found.</ai-model-selector-empty>
            <ai-model-selector-group>
              <ai-model-selector-group-heading>OpenAI</ai-model-selector-group-heading>
              <button aiModelSelectorItem value="gpt-4.1 GPT-4.1 openai OpenAI">
                <ai-model-selector-logo provider="openai" />
                <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
              </button>
            </ai-model-selector-group>
          </ai-model-selector-list>
        </ai-model-selector-content>
      </ai-model-selector>
      <button aiPromptInputAddAttachment>Add attachment</button>
    </ai-prompt-input-tools>
    <button aiPromptInputSubmit></button>
  </ai-prompt-input-toolbar>
</form>`,
  queue: `<ai-queue>
  <ai-queue-section>
    <button aiQueueSectionTrigger>
      <ai-queue-section-label>
        <span aiQueueSectionCount>{{ items.length }}</span>
        <span>queued tasks</span>
      </ai-queue-section-label>
    </button>
    <ai-queue-section-content>
      <ai-queue-list>
        @for (item of items; track item.id) {
          <ai-queue-item>
            <div class="flex items-start gap-3">
              <span aiQueueItemIndicator [completed]="item.status === 'completed'"></span>
              <span aiQueueItemContent [completed]="item.status === 'completed'">
                {{ item.title }}
              </span>
            </div>
          </ai-queue-item>
        }
      </ai-queue-list>
    </ai-queue-section-content>
  </ai-queue-section>
</ai-queue>`,
  attachment: `<ai-attachments variant="grid">
  @for (attachment of attachments; track attachmentKey(attachment)) {
    <ai-attachment [data]="attachment" (removed)="removeAttachment(attachment)">
      <ai-attachment-preview />
      <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-sm"></button>
    </ai-attachment>
  }
</ai-attachments>`,
  'chain-of-thought': `<ai-chain-of-thought>
  <button aiChainOfThoughtTrigger></button>
  <ai-chain-of-thought-content>
    <ai-chain-of-thought-step status="complete">
      <ai-chain-of-thought-step-icon>✓</ai-chain-of-thought-step-icon>
      <ai-chain-of-thought-step-label>Read files</ai-chain-of-thought-step-label>
      <ai-chain-of-thought-step-description>
        Read matching docs.
      </ai-chain-of-thought-step-description>
    </ai-chain-of-thought-step>
  </ai-chain-of-thought-content>
</ai-chain-of-thought>`,
  task: `<ai-task>
  <button aiTaskTrigger>Update docs</button>
  <ai-task-content>
    <div aiTaskItem>Changed <span aiTaskItemFile>component-doc.page.ts</span></div>
  </ai-task-content>
</ai-task>`,
  tool: `<ai-tool [part]="toolPart">
  <button aiToolTrigger></button>
  <ai-tool-content>Tool call details</ai-tool-content>
</ai-tool>`,
  reasoning: `<ai-reasoning [expanded]="true">
  <button aiReasoningTrigger>Thought for 8 seconds</button>
  <ai-reasoning-content markdown="Summarized reasoning can render here." />
</ai-reasoning>`,
  sources: `<ai-sources [expanded]="true">
  <button aiSourcesTrigger [count]="sources.length"></button>
  <ai-sources-content>
    @for (source of sources; track source.href) {
      <a aiSource [href]="source.href" [title]="source.title"></a>
    }
  </ai-sources-content>
</ai-sources>`,
  confirmation: `<ai-confirmation [part]="toolPart">
  <ai-confirmation-request>
    <ai-confirmation-title />
    <ai-confirmation-actions>
      <button aiConfirmationAction>Deny</button>
      <button aiConfirmationAction>Allow</button>
    </ai-confirmation-actions>
  </ai-confirmation-request>
</ai-confirmation>`,
  'code-block': `<ai-code-block language="ts" [code]="code" />`,
  shimmer: `<p aiShimmer>
  Generating a response from the model...
</p>`,
};
```

- [ ] **Step 4: Import snippets from the new module**

In `projects/www/src/app/docs/component-doc.page.ts`, replace the snippet imports and inline constants with:

```ts
import {
  anatomySnippets,
  componentImports,
} from './component-doc-snippets';
import {
  attachmentPreviewSnippets,
  ComponentDocPreview,
  componentPreviewSnippets,
} from './component-doc-preview.component';
```

Delete the inline `componentImports` and `anatomySnippets` constants from `component-doc.page.ts`.

- [ ] **Step 5: Keep rendered preview snippets with the preview module**

Do not move `componentPreviewSnippets` or `attachmentPreviewSnippets` out of `component-doc-preview.component.ts`. Those snippets are coupled to the rendered preview module and should stay beside it.

- [ ] **Step 6: Run the docs tests**

Run:

```bash
pnpm exec nx test www -- --watch=false --include projects/www/src/app/docs/docs-search.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Run TypeScript build for www**

Run:

```bash
pnpm exec nx build www --configuration development
```

Expected: build exits `0`.

- [ ] **Step 8: Commit**

Run:

```bash
git add projects/www/src/app/docs/component-doc-snippets.ts projects/www/src/app/docs/component-doc.page.ts projects/www/src/app/docs/docs-search.spec.ts
git commit -m "refactor: split component docs snippets"
```

Expected: commit succeeds with only the new snippets module, `component-doc.page.ts`, and `docs-search.spec.ts` staged.

---

### Task 6: Add Convention Drift Checks

**Files:**
- Create: `scripts/check-workspace-conventions.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the convention check script**

Create `scripts/check-workspace-conventions.mjs`:

```js
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

const helmRoot = join(root, 'projects/ui/helm');
const helmDirs = readdirSync(helmRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const tsconfig = JSON.parse(readFileSync(join(root, 'tsconfig.json'), 'utf8'));
const paths = tsconfig.compilerOptions?.paths ?? {};

for (const name of helmDirs) {
  const dir = join(helmRoot, name);
  for (const requiredFile of [
    'project.json',
    'tsconfig.json',
    'tsconfig.lib.json',
    'README.md',
    'src/index.ts',
  ]) {
    if (!existsSync(join(dir, requiredFile))) {
      fail(`projects/ui/helm/${name} is missing ${requiredFile}`);
    }
  }

  const alias = `@duxkit/ui/helm/${name}`;
  const expectedPath = `./projects/ui/helm/${name}/src/index.ts`;
  const actualPath = paths[alias]?.[0];
  if (actualPath !== expectedPath) {
    fail(`${alias} must point to ${expectedPath}`);
  }
}

const primitiveRoot = join(root, 'projects/duxkit-ai/src/lib');
const primitiveDirs = readdirSync(primitiveRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const publicApi = readFileSync(join(root, 'projects/duxkit-ai/src/public-api.ts'), 'utf8');

for (const name of primitiveDirs) {
  const dir = join(primitiveRoot, name);
  if (!existsSync(join(dir, 'index.ts'))) {
    fail(`projects/duxkit-ai/src/lib/${name} is missing index.ts`);
  }
  if (!publicApi.includes(`export * from './lib/${name}';`)) {
    fail(`projects/duxkit-ai/src/lib/${name} is not exported from public-api.ts`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('Workspace conventions OK');
```

- [ ] **Step 2: Add a package script**

In `package.json`, add this script after `docs:generate-metadata`:

```json
"check:conventions": "node scripts/check-workspace-conventions.mjs",
```

The surrounding `scripts` block should remain valid JSON.

- [ ] **Step 3: Run the convention check**

Run:

```bash
pnpm check:conventions
```

Expected:

```text
Workspace conventions OK
```

- [ ] **Step 4: Run the existing test suite**

Run:

```bash
pnpm test:ci
```

Expected: command exits `0`.

- [ ] **Step 5: Commit**

Run:

```bash
git add package.json scripts/check-workspace-conventions.mjs
git commit -m "test: add workspace convention checks"
```

Expected: commit succeeds with only the script and `package.json` staged.

---

## Final Verification

- [ ] Run:

```bash
pnpm check:conventions
pnpm test:ci
pnpm build
```

Expected: all commands exit `0`.

- [ ] Confirm the working tree is clean:

```bash
git status --short
```

Expected: no output.

## Self-Review

- Spec coverage: covers docs ignore drift, Helm Nx project identity, Helm TypeScript config drift, workspace convention documentation, www docs data locality, and automated drift checks.
- Placeholder scan: checked for forbidden placeholder phrases and vague test instructions.
- Type consistency: all new TypeScript imports use existing `ComponentDocSlug`, existing `componentDocs`, and new `component-doc-snippets.ts` exports.

import { Component, inject } from '@angular/core';
import { SeoService } from '../../shared/seo/seo.service';
import { DocsCodeTabs, type DocsCodeTab } from './components/docs-code-tabs.component';
import { DocsTableOfContents } from './components/docs-table-of-contents.component';
import type { DocsTableOfContentsItem } from './utils/docs-table-of-contents';

const packageManagerTabs = (command: string): readonly DocsCodeTab[] => [
  {
    id: 'pnpm',
    label: 'pnpm',
    language: 'bash',
    code: `pnpm dlx @duxkit/ui@latest ${command}`,
  },
  {
    id: 'npm',
    label: 'npm',
    language: 'bash',
    code: `npx @duxkit/ui@latest ${command}`,
  },
  {
    id: 'yarn',
    label: 'yarn',
    language: 'bash',
    code: `yarn dlx @duxkit/ui@latest ${command}`,
  },
  {
    id: 'bun',
    label: 'bun',
    language: 'bash',
    code: `bunx @duxkit/ui@latest ${command}`,
  },
];

const cliTableOfContents = [
  { id: 'initialize', label: 'Initialize your workspace' },
  { id: 'add', label: 'Add primitives' },
  { id: 'list', label: 'List primitives' },
  { id: 'inspect', label: 'Inspect your setup' },
  { id: 'safe-changes', label: 'Plan changes safely' },
  { id: 'configuration', label: 'Configuration' },
] as const satisfies readonly DocsTableOfContentsItem[];

const initTabs = packageManagerTabs('init');
const addTabs = packageManagerTabs('add conversation message prompt-input');
const listTabs = packageManagerTabs('list --verbose');
const inspectTabs = packageManagerTabs('inspect');

const safeChangeTabs: readonly DocsCodeTab[] = [
  {
    id: 'preview-init',
    label: 'Preview init',
    language: 'bash',
    code: 'pnpm dlx @duxkit/ui@latest init --dry-run --verbose',
  },
  {
    id: 'preview-add',
    label: 'Preview add',
    language: 'bash',
    code: 'pnpm dlx @duxkit/ui@latest add message --dry-run --verbose',
  },
  {
    id: 'ci',
    label: 'Non-interactive',
    language: 'bash',
    code: 'pnpm dlx @duxkit/ui@latest add message --yes',
  },
  {
    id: 'manual-install',
    label: 'No install',
    language: 'bash',
    code: 'pnpm dlx @duxkit/ui@latest add message --no-install',
  },
];

const configTabs: readonly DocsCodeTab[] = [
  {
    id: 'json',
    label: 'duxkit-ai.json',
    language: 'json',
    code: `{
  "$schema": "https://duxkit.com/schemas/duxkit-ai.json",
  "project": "app",
  "style": "css",
  "componentsPath": "libs/dux-ui",
  "stylesheet": "src/styles.css",
  "tailwind": {
    "version": 4,
    "sourcePath": "./libs/dux-ui"
  },
  "primitives": {
    "conversation": "0.0.1",
    "message": "0.0.1"
  }
}`,
  },
];

const commonFlags = [
  {
    flag: '--dry-run',
    description: 'Print the plan without writing files or installing packages.',
  },
  {
    flag: '--verbose',
    description: 'Show every planned package, file, and configuration change.',
  },
  {
    flag: '--json',
    description: 'Return machine-readable output for scripts and agents.',
  },
  {
    flag: '--yes',
    description: 'Accept safe defaults and skip the final confirmation.',
  },
  {
    flag: '--no-install',
    description: 'Skip dependency installation and print the required install command.',
  },
] as const;

@Component({
  imports: [DocsCodeTabs, DocsTableOfContents],
  template: `
    <div class="cli-page-layout">
      <div class="cli-page-main">
        <header class="cli-page-header border-b border-border">
          <h1 id="cli-title" class="text-foreground">CLI</h1>
          <p class="text-muted-foreground">
            Add editable Duxkit UI primitives to an Angular app with one command.
          </p>
          <p class="cli-page-summary text-muted-foreground">
            The <code class="bg-muted text-foreground">&#64;duxkit/ui</code> CLI detects Angular CLI
            and Nx workspaces, configures the shared styling foundation, copies primitive source
            into your project, and installs only the dependencies that source needs.
          </p>
        </header>

        <section class="cli-section border-b border-border" aria-labelledby="initialize">
          <div class="cli-section-copy">
            <h2 id="initialize" class="text-foreground">Initialize your workspace</h2>
            <p class="text-muted-foreground">
              Run <code class="bg-muted text-foreground">init</code> once from the workspace root.
              The CLI selects an Angular app, configures Tailwind CSS v4 and theme tokens, creates
              the generated library, and records the result in
              <code class="bg-muted text-foreground">duxkit-ai.json</code>.
            </p>
          </div>
          <app-docs-code-tabs
            ariaLabel="Initialize Duxkit UI by package manager"
            copyLabel="Copy initialization command"
            [tabs]="initTabs"
          />
          <p class="cli-callout border-l-2 border-primary text-muted-foreground">
            Use <code class="bg-muted text-foreground">--project</code>,
            <code class="bg-muted text-foreground">--stylesheet</code>, or
            <code class="bg-muted text-foreground">--library-path</code> when workspace detection
            needs an explicit choice.
          </p>
        </section>

        <section class="cli-section border-b border-border" aria-labelledby="add">
          <div class="cli-section-copy">
            <h2 id="add" class="text-foreground">Add primitives</h2>
            <p class="text-muted-foreground">
              Add one or more primitives by name. Duxkit resolves primitive dependencies, writes the
              editable Angular source into your configured library, and installs missing package
              dependencies. Run the command without names for an interactive multi-select.
            </p>
          </div>
          <app-docs-code-tabs
            ariaLabel="Add Duxkit UI primitives by package manager"
            copyLabel="Copy add command"
            [tabs]="addTabs"
          />
          <div class="cli-examples border border-border bg-muted/35">
            <h3 class="text-foreground">Useful variations</h3>
            <dl class="text-muted-foreground">
              <div>
                <dt><code class="bg-muted text-foreground">add</code></dt>
                <dd>Open the interactive primitive picker.</dd>
              </div>
              <div>
                <dt><code class="bg-muted text-foreground">add message</code></dt>
                <dd>Add one primitive and its transitive primitive dependencies.</dd>
              </div>
              <div>
                <dt><code class="bg-muted text-foreground">add --all</code></dt>
                <dd>Add every primitive available in the installed CLI release.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section class="cli-section border-b border-border" aria-labelledby="list">
          <div class="cli-section-copy">
            <h2 id="list" class="text-foreground">List primitives</h2>
            <p class="text-muted-foreground">
              See the available and installed primitives. Add
              <code class="bg-muted text-foreground">--verbose</code> to include aliases, primitive
              dependencies, and package dependency groups.
            </p>
          </div>
          <app-docs-code-tabs
            ariaLabel="List Duxkit UI primitives by package manager"
            copyLabel="Copy list command"
            [tabs]="listTabs"
          />
        </section>

        <section class="cli-section border-b border-border" aria-labelledby="inspect">
          <div class="cli-section-copy">
            <h2 id="inspect" class="text-foreground">Inspect your setup</h2>
            <p class="text-muted-foreground">
              Print a read-only summary of the detected workspace, selected app, generated library,
              stylesheet, Tailwind source coverage, theme tokens, installed primitives, and missing
              dependencies. Use <code class="bg-muted text-foreground">--json</code> when another
              tool needs to consume the result.
            </p>
          </div>
          <app-docs-code-tabs
            ariaLabel="Inspect Duxkit UI setup by package manager"
            copyLabel="Copy inspect command"
            [tabs]="inspectTabs"
          />
        </section>

        <section class="cli-section border-b border-border" aria-labelledby="safe-changes">
          <div class="cli-section-copy">
            <h2 id="safe-changes" class="text-foreground">Plan changes safely</h2>
            <p class="text-muted-foreground">
              <code class="bg-muted text-foreground">init</code> and
              <code class="bg-muted text-foreground">add</code> are plan-first commands. They
              inspect the workspace, summarize the operation, and ask before applying safe changes.
            </p>
          </div>
          <app-docs-code-tabs
            ariaLabel="Safe CLI workflow examples"
            copyLabel="Copy safe workflow command"
            [tabs]="safeChangeTabs"
          />
          <div class="cli-table-wrap border border-border bg-card">
            <table class="cli-table text-muted-foreground">
              <thead>
                <tr>
                  <th scope="col">Flag</th>
                  <th scope="col">Use it when</th>
                </tr>
              </thead>
              <tbody>
                @for (item of commonFlags; track item.flag) {
                  <tr>
                    <td>
                      <code class="bg-muted text-foreground">{{ item.flag }}</code>
                    </td>
                    <td>{{ item.description }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <section class="cli-section" aria-labelledby="configuration">
          <div class="cli-section-copy">
            <h2 id="configuration" class="text-foreground">Configuration</h2>
            <p class="text-muted-foreground">
              Duxkit keeps its workspace choices and generated primitive versions in
              <code class="bg-muted text-foreground">duxkit-ai.json</code>. The file lets future
              commands reuse the same app, stylesheet, output path, and style language without
              asking again.
            </p>
          </div>
          <app-docs-code-tabs
            ariaLabel="Duxkit UI configuration example"
            copyLabel="Copy configuration example"
            [tabs]="configTabs"
          />
          <p class="cli-callout border-l-2 border-primary text-muted-foreground">
            Generated files are application-owned. Edit them to match your product, and preview a
            future <code class="bg-muted text-foreground">--force</code> run with
            <code class="bg-muted text-foreground">--dry-run</code> before overwriting safe
            Duxkit-owned files.
          </p>
        </section>
      </div>

      <app-docs-table-of-contents [items]="tableOfContents" />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .cli-page-layout {
      width: 100%;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      align-items: start;
      gap: clamp(40px, 5vw, 72px);
    }

    .cli-page-main {
      width: min(100%, 820px);
      min-width: 0;
      justify-self: center;
    }

    .cli-page-header {
      display: grid;
      gap: 14px;
      padding-bottom: 30px;
    }

    .cli-page-header h1,
    .cli-page-header p,
    .cli-section h2,
    .cli-section h3,
    .cli-section p,
    .cli-examples dl,
    .cli-examples dd {
      margin: 0;
    }

    .cli-page-header h1 {
      font-size: clamp(2.125rem, 3.6vw, 3rem);
      line-height: 1.08;
      font-weight: 400;
    }

    .cli-page-header > p,
    .cli-section-copy p {
      max-width: 680px;
      font-size: 17px;
      line-height: 1.6;
    }

    .cli-page-header > p:first-of-type {
      font-size: 19px;
    }

    .cli-page-summary {
      font-size: 16px !important;
    }

    .cli-section {
      display: grid;
      gap: 18px;
      padding: 36px 0;
    }

    .cli-section-copy {
      display: grid;
      gap: 8px;
    }

    .cli-section h2 {
      font-size: 22px;
      line-height: 1.25;
      font-weight: 500;
    }

    .cli-section h3 {
      font-size: 15px;
      line-height: 1.4;
      font-weight: 600;
    }

    code {
      border-radius: 4px;
      padding: 0.1em 0.32em;
      font-size: 0.9em;
    }

    .cli-callout {
      max-width: none;
      padding: 4px 0 4px 16px;
      font-size: 14px;
      line-height: 1.6;
    }

    .cli-examples {
      display: grid;
      gap: 12px;
      border-radius: 8px;
      padding: 18px;
    }

    .cli-examples dl {
      display: grid;
      gap: 10px;
    }

    .cli-examples dl div {
      display: grid;
      grid-template-columns: minmax(140px, 0.32fr) minmax(0, 1fr);
      gap: 16px;
      align-items: baseline;
    }

    .cli-examples dt,
    .cli-examples dd {
      font-size: 14px;
      line-height: 1.5;
    }

    .cli-table-wrap {
      min-width: 0;
      overflow-x: auto;
      border-radius: 8px;
    }

    .cli-table {
      width: 100%;
      min-width: 560px;
      border-collapse: collapse;
      font-size: 14px;
      line-height: 1.5;
      text-align: left;
    }

    .cli-table th,
    .cli-table td {
      border-bottom: 1px solid var(--border);
      padding: 11px 12px;
      vertical-align: top;
    }

    .cli-table th {
      color: var(--foreground);
      font-weight: 600;
    }

    .cli-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .cli-table td:first-child {
      width: 150px;
      white-space: nowrap;
    }

    @media (max-width: 1500px) {
      .cli-page-layout {
        grid-template-columns: minmax(0, 1fr);
      }

      .cli-page-main {
        grid-column: 1;
        margin: 0 auto;
      }
    }

    @media (max-width: 640px) {
      .cli-examples dl div {
        grid-template-columns: 1fr;
        gap: 3px;
      }
    }
  `,
})
export class CliPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.setPath('/docs/cli');
  }

  protected readonly initTabs = initTabs;
  protected readonly addTabs = addTabs;
  protected readonly listTabs = listTabs;
  protected readonly inspectTabs = inspectTabs;
  protected readonly safeChangeTabs = safeChangeTabs;
  protected readonly configTabs = configTabs;
  protected readonly commonFlags = commonFlags;
  protected readonly tableOfContents = cliTableOfContents;
}

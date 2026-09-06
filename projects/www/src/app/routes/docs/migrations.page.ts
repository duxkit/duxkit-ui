import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SeoService } from '../../shared/seo/seo.service';
import { DocsCodeTabs, type DocsCodeTab } from './components/docs-code-tabs.component';
import { DocsTableOfContents } from './components/docs-table-of-contents.component';
import { migrationGuides, migrationHref, type MigrationStep } from './data/migrations';

@Component({
  imports: [RouterLink, DocsCodeTabs, DocsTableOfContents],
  template: `
    @if (guide(); as guide) {
      <div class="migration-layout">
        <div class="migration-main">
          <header class="migration-header border-b border-border">
            <a class="migration-link text-muted-foreground" routerLink="/docs/migrations"
              >All migrations</a
            >
            <h1 class="text-foreground">{{ guide.fromRelease }} → {{ guide.toRelease }}</h1>
            <p class="text-muted-foreground">{{ guide.description }}</p>
            <p class="text-foreground font-medium">This release includes breaking changes.</p>
            <dl class="version-pair text-muted-foreground">
              <div>
                <dt>Site release</dt>
                <dd>{{ guide.fromRelease }} → {{ guide.toRelease }}</dd>
              </div>
              <div>
                <dt>npm CLI</dt>
                <dd>&#64;duxkit/ui {{ guide.fromCli }} → {{ guide.toCli }}</dd>
              </div>
            </dl>
          </header>

          <section
            class="migration-section border-b border-border"
            aria-labelledby="who-needs-this"
          >
            <h2 id="who-needs-this" class="text-foreground">Who needs to migrate?</h2>
            <p class="text-muted-foreground">
              Follow this guide if your app already contains component source installed with
              &#64;duxkit/ui {{ guide.fromCli }} and you plan to replace it with {{ guide.toCli }}.
              Check the primitive versions recorded in your duxkit-ai.json file. If your generated
              files have local edits, review those too.
            </p>
            <p class="text-muted-foreground">
              Updating or running the CLI alone does not rewrite your installed components. These
              changes take effect when you regenerate or manually replace the source. New projects
              can start with the current examples in the component docs.
            </p>
            <p class="text-muted-foreground">
              The site release and npm CLI use separate version numbers. Use the CLI version shown
              above for the commands below.
            </p>
          </section>

          <section class="migration-section border-b border-border" aria-labelledby="update-safely">
            <h2 id="update-safely" class="text-foreground">Update without losing your changes</h2>
            <ol class="migration-list text-muted-foreground">
              <li>
                Commit or back up your app, including generated components, before regenerating
                them.
              </li>
              <li>
                Run list to see which components you have installed. Choose the installed families
                you want to update.
              </li>
              <li>
                Preview the update with --dry-run --verbose --force. It shows the replacement plan
                without writing files.
              </li>
              <li>
                Review the planned files and dependencies, then run the update. --force replaces
                Duxkit-owned source; it does not merge your edits.
              </li>
              <li>
                Compare the result with your saved version, reapply customisations, and follow the
                relevant steps below.
              </li>
            </ol>
            <p class="text-muted-foreground">
              These commands pin CLI {{ guide.toCli }}. The example updates prompt-input and
              attachment; replace those names with the installed families you want to update. Avoid
              --all unless you want every available family added to your app.
            </p>
            <app-docs-code-tabs
              ariaLabel="Migration commands"
              copyLabel="Copy migration command"
              [tabs]="commandTabs()"
            />
            <p class="text-muted-foreground">
              If you prefer to merge by hand, generate the same families in a separate copy of your
              workspace and compare the files. Bring across new helper files, family exports, styles
              and required dependencies together. --no-install skips package installation and prints
              the command to run yourself.
            </p>
          </section>

          <p class="example-note text-muted-foreground">
            The examples below show the parts to change. Keep your surrounding components, app
            signals and event handlers. Adjust import paths to your generated library and add any
            new pieces to your standalone component's imports.
          </p>
          @for (step of guide.steps; track step.id) {
            <section
              class="migration-section border-b border-border"
              [attr.aria-labelledby]="step.id"
            >
              <h2 [id]="step.id" class="text-foreground">{{ step.title }}</h2>
              @for (paragraph of step.explanation; track paragraph) {
                <p class="text-muted-foreground">{{ paragraph }}</p>
              }
              <app-docs-code-tabs
                [ariaLabel]="step.title + ' examples'"
                [copyLabel]="'Copy ' + step.title + ' example'"
                [tabs]="stepTabs(step)"
              />
            </section>
          }

          <section class="migration-section" aria-labelledby="check-your-app">
            <h2 id="check-your-app" class="text-foreground">Check your app after updating</h2>
            <ul class="migration-list text-muted-foreground">
              @for (check of guide.checks; track check) {
                <li>{{ check }}</li>
              }
            </ul>
            <a
              class="migration-link text-foreground"
              routerLink="/docs/changelog"
              [fragment]="'bundle-' + guide.toRelease.replaceAll('.', '-')"
              >Read the release notes</a
            >
          </section>
        </div>
        <app-docs-table-of-contents [items]="tableOfContents()" />
      </div>
    } @else if (slug()) {
      <section class="migration-main migration-header">
        <h1 class="text-foreground">Migration guide not found</h1>
        <a class="migration-link text-foreground" routerLink="/docs/migrations"
          >Browse migration guides</a
        >
      </section>
    } @else {
      <div class="migration-main">
        <header class="migration-header border-b border-border">
          <h1 class="text-foreground">Migrations</h1>
          <p class="text-muted-foreground">
            Updating an existing app? Choose a version below for the changes you need to make,
            before-and-after examples, and checks to run afterwards.
          </p>
        </header>
        <div class="migration-section">
          @for (guide of guides; track guide.slug) {
            <a
              class="guide-link rounded-lg border border-border bg-card p-6 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              [routerLink]="guideHref(guide)"
            >
              <h2 class="text-foreground">{{ guide.fromRelease }} → {{ guide.toRelease }}</h2>
              <p class="text-muted-foreground">{{ guide.description }}</p>
              <p class="text-muted-foreground">
                CLI {{ guide.fromCli }} → {{ guide.toCli }} · Includes breaking changes
              </p>
              <span class="text-foreground underline underline-offset-4">Read migration guide</span>
            </a>
          }
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .migration-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      gap: 40px;
    }
    .migration-main {
      width: 100%;
      max-width: 820px;
      min-width: 0;
    }
    .migration-header,
    .migration-section {
      display: grid;
      gap: 18px;
      padding: 32px 0;
    }
    .migration-header {
      padding-top: 0;
    }
    h1,
    h2,
    p,
    dl,
    dd {
      margin: 0;
    }
    h1 {
      font-size: clamp(2rem, 3vw, 3rem);
      font-weight: 500;
      line-height: 1.2;
    }
    h2 {
      font-size: 1.35rem;
      font-weight: 500;
      line-height: 1.4;
    }
    p,
    li,
    dl {
      line-height: 1.7;
    }
    .migration-list {
      margin: 0;
      padding-left: 24px;
      display: grid;
      gap: 12px;
    }
    ol.migration-list {
      list-style: decimal;
    }
    ul.migration-list {
      list-style: disc;
    }
    .version-pair {
      display: grid;
      gap: 8px;
    }
    .version-pair div {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 24px;
    }
    .version-pair dt {
      min-width: 110px;
      font-weight: 500;
    }
    .migration-link {
      text-decoration: underline;
      text-underline-offset: 4px;
      width: fit-content;
    }
    .guide-link {
      display: grid;
      gap: 12px;
      text-decoration: none;
    }
    .example-note {
      padding-top: 32px;
    }
    @media (max-width: 1500px) {
      .migration-layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class MigrationsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  protected readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug'))));
  protected readonly guide = computed(() =>
    migrationGuides.find((guide) => guide.slug === this.slug()),
  );
  protected readonly guides = migrationGuides;
  protected readonly guideHref = migrationHref;
  protected readonly tableOfContents = computed(() => [
    { id: 'who-needs-this', label: 'Who needs to migrate?' },
    { id: 'update-safely', label: 'Update safely' },
    ...(this.guide()?.steps.map((step) => ({ id: step.id, label: step.title })) ?? []),
    { id: 'check-your-app', label: 'Check your app' },
  ]);
  protected readonly commandTabs = computed<readonly DocsCodeTab[]>(() => {
    const version = this.guide()?.toCli;
    return [
      {
        id: 'list',
        label: '1. List installed',
        language: 'bash',
        code: `pnpm dlx @duxkit/ui@${version} list --verbose`,
      },
      {
        id: 'preview',
        label: '2. Preview',
        language: 'bash',
        code: `pnpm dlx @duxkit/ui@${version} add prompt-input attachment --force --dry-run --verbose`,
      },
      {
        id: 'apply',
        label: '3. Update',
        language: 'bash',
        code: `pnpm dlx @duxkit/ui@${version} add prompt-input attachment --force`,
      },
      {
        id: 'npm',
        label: 'Using npm',
        language: 'bash',
        code: `npx @duxkit/ui@${version} list --verbose\nnpx @duxkit/ui@${version} add prompt-input attachment --force --dry-run --verbose\n# After reviewing the plan:\nnpx @duxkit/ui@${version} add prompt-input attachment --force`,
      },
    ];
  });

  constructor() {
    effect(() =>
      this.seo.setPath(this.slug() ? `/docs/migrations/${this.slug()}` : '/docs/migrations'),
    );
  }

  protected stepTabs(step: MigrationStep): readonly DocsCodeTab[] {
    return [
      { id: 'before', label: 'Before', code: step.before, language: step.language ?? 'html' },
      { id: 'after', label: 'After', code: step.after, language: step.language ?? 'html' },
      ...(step.imports
        ? [{ id: 'imports', label: 'Imports', code: step.imports, language: 'ts' }]
        : []),
    ];
  }
}

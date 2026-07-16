import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';
import { DocsCodeTabs, type DocsCodeTab } from './components/docs-code-tabs.component';

const initTabs: readonly DocsCodeTab[] = [
  {
    id: 'pnpm',
    label: 'pnpm',
    language: 'bash',
    code: 'pnpm dlx @duxkit/ui@latest init',
  },
  {
    id: 'npm',
    label: 'npm',
    language: 'bash',
    code: 'npx @duxkit/ui@latest init',
  },
  {
    id: 'yarn',
    label: 'yarn',
    language: 'bash',
    code: 'yarn dlx @duxkit/ui@latest init',
  },
  {
    id: 'bun',
    label: 'bun',
    language: 'bash',
    code: 'bunx @duxkit/ui@latest init',
  },
] as const;

const addTabs: readonly DocsCodeTab[] = [
  {
    id: 'pnpm',
    label: 'pnpm',
    language: 'bash',
    code: 'pnpm dlx @duxkit/ui@latest add conversation message prompt-input',
  },
  {
    id: 'npm',
    label: 'npm',
    language: 'bash',
    code: 'npx @duxkit/ui@latest add conversation message prompt-input',
  },
  {
    id: 'yarn',
    label: 'yarn',
    language: 'bash',
    code: 'yarn dlx @duxkit/ui@latest add conversation message prompt-input',
  },
  {
    id: 'bun',
    label: 'bun',
    language: 'bash',
    code: 'bunx @duxkit/ui@latest add conversation message prompt-input',
  },
] as const;

const verificationTabs: readonly DocsCodeTab[] = [
  {
    id: 'component',
    label: 'chat-preview.component.ts',
    language: 'ts',
    code: `import { Component } from '@angular/core';
import { Conversation, ConversationContent } from './components/ai/conversation';
import { Message, MessageContent } from './components/ai/message';

@Component({
  selector: 'app-chat-preview',
  imports: [Conversation, ConversationContent, Message, MessageContent],
  template: \`
    <ai-conversation>
      <ai-conversation-content>
        <ai-message from="assistant">
          <ai-message-content>Hello from Duxkit UI.</ai-message-content>
        </ai-message>
      </ai-conversation-content>
    </ai-conversation>
  \`,
})
export class ChatPreviewComponent {}`,
  },
] as const;

const inspectTabs: readonly DocsCodeTab[] = [
  {
    id: 'pnpm',
    label: 'pnpm',
    language: 'bash',
    code: 'pnpm dlx @duxkit/ui@latest inspect',
  },
  {
    id: 'npm',
    label: 'npm',
    language: 'bash',
    code: 'npx @duxkit/ui@latest inspect',
  },
] as const;

const initChanges = [
  'Creates duxkit-ai.json with the selected project and generated-components path.',
  'Configures Tailwind CSS v4 and PostCSS when they are missing.',
  'Adds the Spartan preset and required theme tokens without replacing existing token values.',
  'Creates src/app/components/ai for editable primitive source.',
  'Installs only the missing baseline styling dependencies.',
] as const;

const troubleshooting = [
  {
    title: 'The CLI detected the wrong Angular app',
    body: 'Run init with --project followed by the Angular or Nx project name. Use --dry-run first to review the plan without changing files.',
  },
  {
    title: 'Components render without styles',
    body: 'Run @duxkit/ui inspect. It reports the selected stylesheet, Tailwind source coverage, missing tokens, and missing dependencies.',
  },
  {
    title: 'You want to approve dependency changes yourself',
    body: 'Add --no-install. The CLI will skip package installation and print the exact commands required for the selected primitives.',
  },
] as const;

@Component({
  imports: [DocsCodeTabs, RouterLink],
  template: `
    <section
      class="installation-page mx-auto grid w-full max-w-3xl gap-0 px-4 sm:px-0"
      aria-labelledby="installation-title"
    >
      <header class="installation-hero border-b border-border">
        <p class="installation-kicker text-muted-foreground">Getting Started</p>
        <h1 id="installation-title" class="text-foreground">Installation</h1>
        <p class="installation-lead text-muted-foreground">
          Add editable Duxkit UI primitives to an Angular app with the
          <code class="bg-muted text-foreground">&#64;duxkit/ui</code> CLI.
        </p>
        <p class="text-muted-foreground">
          There is no separate Duxkit runtime package to install. The CLI copies the primitive
          source into your app and installs only the dependencies that source needs.
        </p>
      </header>

      <section class="installation-section border-b border-border" aria-labelledby="requirements">
        <div class="installation-copy">
          <h2 id="requirements" class="text-foreground">Requirements</h2>
          <p class="text-muted-foreground">
            Start in an Angular 22 application or an Nx workspace containing an Angular app. The CLI
            supports npm, pnpm, Yarn, and Bun and requires a supported Node 22, 24, or 26 release.
          </p>
        </div>

        <ul class="installation-checklist text-muted-foreground">
          <li>Angular 22 application</li>
          <li>
            Node version supported by <code class="bg-muted text-foreground">&#64;duxkit/ui</code>
          </li>
          <li>Write access to the application workspace</li>
        </ul>
      </section>

      <section class="installation-section border-b border-border" aria-labelledby="initialize">
        <div class="installation-copy">
          <h2 id="initialize" class="text-foreground">1. Initialize your app</h2>
          <p class="text-muted-foreground">
            Run the CLI from the workspace root. It inspects the app, shows the planned changes, and
            asks for confirmation before writing files or installing packages.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="Initialize Duxkit UI"
          copyLabel="Copy initialization command"
          [tabs]="initTabs"
        />

        <aside class="installation-note border border-border bg-muted/35">
          <h3 class="text-foreground">What init handles</h3>
          <ul class="installation-checklist text-muted-foreground">
            @for (item of initChanges; track item) {
              <li>{{ item }}</li>
            }
          </ul>
        </aside>
      </section>

      <section class="installation-section border-b border-border" aria-labelledby="add-primitives">
        <div class="installation-copy">
          <h2 id="add-primitives" class="text-foreground">2. Add primitives</h2>
          <p class="text-muted-foreground">
            Choose only the pieces your interface needs. This example adds a conversation, messages,
            and a prompt input. The CLI also resolves their primitive dependencies, copies the
            source, and installs any missing Angular, AI SDK, icon, markdown, and styling packages.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="Add Duxkit UI primitives"
          copyLabel="Copy add command"
          [tabs]="addTabs"
        />

        <p class="installation-callout border-l-2 border-primary text-muted-foreground">
          You do not need to install the previous dependency list by hand. Dependencies vary by
          primitive, so <code class="bg-muted text-foreground">&#64;duxkit/ui add</code> installs
          only what the selected source imports. Existing compatible packages are left alone.
        </p>
      </section>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="render-primitive"
      >
        <div class="installation-copy">
          <h2 id="render-primitive" class="text-foreground">3. Import the generated source</h2>
          <p class="text-muted-foreground">
            The default destination is
            <code class="bg-muted text-foreground">src/app/components/ai</code>. Import from that
            local path, then edit the generated components whenever your product needs a different
            API or style.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="Minimal generated primitive render check"
          copyLabel="Copy verification component"
          [tabs]="verificationTabs"
        />
      </section>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="dependency-model"
      >
        <div class="installation-copy">
          <h2 id="dependency-model" class="text-foreground">How dependencies work</h2>
          <p class="text-muted-foreground">
            <code class="bg-muted text-foreground">init</code> installs the baseline Tailwind and
            Spartan packages. Each <code class="bg-muted text-foreground">add</code> command then
            installs the missing packages required by those primitives. For example, markdown
            support adds <code class="bg-muted text-foreground">marked</code> and
            <code class="bg-muted text-foreground">highlight.js</code>; an overlay primitive can add
            <code class="bg-muted text-foreground">&#64;angular/cdk</code>.
          </p>
          <p class="text-muted-foreground">
            <code class="bg-muted text-foreground">&#64;ai-sdk/angular</code> is not required by the
            generated primitives and is not installed automatically. Add it separately only if your
            application chooses its <code class="bg-muted text-foreground">Chat</code> state and
            streaming API. Provider packages are also application choices, and credentials belong on
            your server.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="Inspect Duxkit UI setup"
          copyLabel="Copy inspection command"
          [tabs]="inspectTabs"
        />
      </section>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="troubleshooting"
      >
        <div class="installation-copy">
          <h2 id="troubleshooting" class="text-foreground">Troubleshooting</h2>
        </div>

        <div class="installation-troubleshooting">
          @for (item of troubleshooting; track item.title) {
            <article class="border-t border-border">
              <h3 class="text-foreground">{{ item.title }}</h3>
              <p class="text-muted-foreground">{{ item.body }}</p>
            </article>
          }
        </div>
      </section>

      <section class="installation-section" aria-labelledby="next-steps">
        <div class="installation-copy">
          <h2 id="next-steps" class="text-foreground">Next steps</h2>
          <p class="text-muted-foreground">
            Browse the component docs, then run
            <code class="bg-muted text-foreground">&#64;duxkit/ui add &lt;primitive&gt;</code> for
            each piece you want to own in your application.
          </p>
        </div>

        <ul class="installation-next-links">
          <li>
            <a
              class="border border-border bg-card text-foreground hover:bg-muted"
              routerLink="/components"
              >Components</a
            >
          </li>
          <li>
            <a
              class="border border-border bg-card text-foreground hover:bg-muted"
              routerLink="/components/conversation"
              >Conversation</a
            >
          </li>
          <li>
            <a
              class="border border-border bg-card text-foreground hover:bg-muted"
              routerLink="/components/message"
              >Message</a
            >
          </li>
          <li>
            <a
              class="border border-border bg-card text-foreground hover:bg-muted"
              routerLink="/components/prompt-input"
              >Prompt Input</a
            >
          </li>
        </ul>
      </section>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .installation-page,
    .installation-hero,
    .installation-section {
      min-width: 0;
      grid-template-columns: minmax(0, 1fr);
    }

    .installation-page > *,
    .installation-hero > *,
    .installation-section > * {
      min-width: 0;
      max-width: 100%;
    }

    .installation-hero,
    .installation-section {
      display: grid;
      gap: 18px;
      padding: 0 0 36px;
    }

    .installation-section {
      padding-top: 36px;
    }

    .installation-copy {
      display: grid;
      gap: 10px;
    }

    .installation-kicker {
      margin: 0;
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0.08em;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      max-width: 760px;
      font-size: clamp(2.125rem, 3.6vw, 3rem);
      line-height: 1.08;
      font-weight: 400;
    }

    h2 {
      font-size: 24px;
      line-height: 1.25;
      font-weight: 500;
    }

    h3 {
      font-size: 15px;
      line-height: 1.35;
      font-weight: 600;
    }

    p {
      max-width: 760px;
      font-size: 16px;
      line-height: 1.65;
    }

    .installation-lead {
      font-size: 18px;
    }

    code {
      border-radius: 4px;
      padding: 0.1em 0.32em;
      font-size: 0.9em;
    }

    .installation-checklist,
    .installation-next-links {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .installation-checklist {
      display: grid;
      gap: 10px;
    }

    .installation-checklist li {
      position: relative;
      padding-left: 22px;
      font-size: 15px;
      line-height: 1.55;
    }

    .installation-checklist li::before {
      content: '';
      position: absolute;
      top: 0.72em;
      left: 2px;
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--primary);
    }

    .installation-note {
      display: grid;
      gap: 12px;
      border-radius: 8px;
      padding: 18px;
    }

    .installation-callout {
      max-width: none;
      padding: 4px 0 4px 16px;
      font-size: 14px;
    }

    .installation-troubleshooting {
      display: grid;
    }

    .installation-troubleshooting article {
      display: grid;
      gap: 6px;
      padding: 18px 0;
    }

    .installation-troubleshooting article:first-child {
      padding-top: 0;
      border-top: 0;
    }

    .installation-troubleshooting p {
      font-size: 15px;
      line-height: 1.6;
    }

    .installation-next-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .installation-next-links a {
      display: inline-flex;
      min-height: 38px;
      align-items: center;
      border-radius: 999px;
      padding: 0 14px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
    }

    .installation-next-links a:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }

    @media (max-width: 720px) {
      .installation-hero,
      .installation-section {
        gap: 16px;
        padding-bottom: 30px;
      }

      .installation-section {
        padding-top: 30px;
      }
    }
  `,
})
export class InstallationPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.setPath('/docs/installation');
  }

  protected readonly initTabs = initTabs;
  protected readonly addTabs = addTabs;
  protected readonly verificationTabs = verificationTabs;
  protected readonly inspectTabs = inspectTabs;
  protected readonly initChanges = initChanges;
  protected readonly troubleshooting = troubleshooting;
}

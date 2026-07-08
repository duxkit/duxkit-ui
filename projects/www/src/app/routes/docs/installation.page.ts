import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/seo/seo.service';
import { DocsCodeTabs, type DocsCodeTab } from './components/docs-code-tabs.component';

const runtimePackages =
  'duxkit-ai @angular/cdk @angular/forms @ai-sdk/angular ai @spartan-ng/brain @ng-icons/core @ng-icons/lucide class-variance-authority clsx highlight.js marked tailwind-merge tw-animate-css';

const installTabs: readonly DocsCodeTab[] = [
  {
    id: 'pnpm',
    label: 'pnpm',
    language: 'bash',
    code: `pnpm add ${runtimePackages}
pnpm add -D tailwindcss @tailwindcss/postcss`,
  },
  {
    id: 'npm',
    label: 'npm',
    language: 'bash',
    code: `npm install ${runtimePackages}
npm install -D tailwindcss @tailwindcss/postcss`,
  },
  {
    id: 'yarn',
    label: 'yarn',
    language: 'bash',
    code: `yarn add ${runtimePackages}
yarn add -D tailwindcss @tailwindcss/postcss`,
  },
  {
    id: 'bun',
    label: 'bun',
    language: 'bash',
    code: `bun add ${runtimePackages}
bun add -d tailwindcss @tailwindcss/postcss`,
  },
] as const;

const postcssTabs: readonly DocsCodeTab[] = [
  {
    id: 'postcss',
    label: 'postcss.config.json',
    language: 'json',
    code: `{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}`,
  },
] as const;

const stylesheetTabs: readonly DocsCodeTab[] = [
  {
    id: 'styles',
    label: 'styles.scss',
    language: 'scss',
    code: `@layer theme, base, components, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css';
@import '@spartan-ng/brain/hlm-tailwind-preset.css';

@source '../node_modules/duxkit-ai';`,
  },
] as const;

const themeTabs: readonly DocsCodeTab[] = [
  {
    id: 'tokens',
    label: 'theme tokens',
    language: 'scss',
    code: `:root {
  color-scheme: light;
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
}

.dark,
[data-theme='dark'] {
  color-scheme: dark;
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.92 0.004 286.32);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.92 0.004 286.32);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.92 0.004 286.32);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.92 0.004 286.32);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.92 0.004 286.32);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }
}`,
  },
] as const;

const verificationTabs: readonly DocsCodeTab[] = [
  {
    id: 'component',
    label: 'chat-preview.component.ts',
    language: 'ts',
    code: `import { Component } from '@angular/core';
import { Conversation, ConversationContent } from 'duxkit-ai/conversation';
import { Message, MessageContent } from 'duxkit-ai/message';

@Component({
  selector: 'app-chat-preview',
  imports: [Conversation, ConversationContent, Message, MessageContent],
  template: \`
    <ai-conversation>
      <ai-conversation-content>
        <ai-message from="assistant">
          <ai-message-content>Hello from Duxkit AI.</ai-message-content>
        </ai-message>
      </ai-conversation-content>
    </ai-conversation>
  \`,
})
export class ChatPreviewComponent {}`,
  },
] as const;

const chatStateTabs: readonly DocsCodeTab[] = [
  {
    id: 'state',
    label: 'chat-state.ts',
    language: 'ts',
    code: `import { Chat } from '@ai-sdk/angular';

export class ChatState {
  readonly chat = new Chat({});
}`,
  },
] as const;

const requiredPackages = [
  {
    name: 'duxkit-ai',
    reason: 'The Angular UI primitives.',
  },
  {
    name: '@angular/cdk',
    reason: 'Overlay and accessibility infrastructure used by Spartan Brain primitives.',
  },
  {
    name: '@angular/forms',
    reason: 'Peer dependency for Angular form integration surfaces.',
  },
  {
    name: '@ai-sdk/angular',
    reason: 'Angular integration for AI SDK chat and streaming state.',
  },
  {
    name: 'ai',
    reason: 'AI SDK UI types and helpers used by tool, prompt, attachment, and usage primitives.',
  },
  {
    name: '@spartan-ng/brain',
    reason:
      'Accessible headless behavior for collapsible, command, dialog, and hover-card primitives.',
  },
  {
    name: '@ng-icons/core and @ng-icons/lucide',
    reason: 'Icons rendered by Duxkit AI primitives.',
  },
  {
    name: 'class-variance-authority, clsx, tailwind-merge',
    reason: 'Runtime class composition used by styled primitives.',
  },
  {
    name: 'highlight.js and marked',
    reason: 'Markdown and code rendering support.',
  },
  {
    name: 'tailwindcss and @tailwindcss/postcss',
    reason: 'Tailwind CSS v4 compilation for utility classes.',
  },
  {
    name: 'tw-animate-css',
    reason: 'Animation utilities used by the Spartan preset and peer contract.',
  },
] as const;

const notRequired = [
  '@spartan-ng/cli',
  'copied Spartan Helm components',
  '@duxkit/ui',
  'Storybook',
  'tokenlens',
  'a specific AI provider package',
  'Vercel AI Gateway',
] as const;

const troubleshooting = [
  {
    title: 'Components render but look unstyled',
    body: "Check that your stylesheet imports Tailwind utilities and includes `@source '../node_modules/duxkit-ai';`.",
  },
  {
    title: 'Token classes compile but colors look wrong',
    body: 'Add the theme variables for `--background`, `--foreground`, `--muted`, `--border`, `--ring`, and related tokens.',
  },
  {
    title: 'Peer dependency warnings',
    body: 'Install the peer packages listed in this guide. Duxkit AI keeps Angular, AI SDK, Spartan Brain, icons, and Tailwind utilities as peer dependencies so your app owns those versions.',
  },
  {
    title: 'API keys in the browser',
    body: 'Duxkit AI is only the UI layer. Put model provider credentials in a server route or backend service.',
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
          Install Duxkit AI in an Angular app, wire up Tailwind CSS v4, and render your first AI UI
          primitive.
        </p>
        <p class="text-muted-foreground">
          Duxkit AI is a UI layer. It gives you composable Angular primitives for chat, reasoning,
          tools, files, sources, and prompt input. You bring the model provider, server route, and
          application state.
        </p>
      </header>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="before-you-start"
      >
        <div class="installation-copy">
          <h2 id="before-you-start" class="text-foreground">Before you start</h2>
          <p class="text-muted-foreground">
            Use an Angular 22 app with Tailwind CSS v4. Duxkit AI is built for standalone Angular
            components and the AI SDK 6 generation.
          </p>
          <p class="text-muted-foreground">
            Start with an Angular 22 app using Tailwind CSS v4. If your app does not have Tailwind
            yet, configure Tailwind first, then continue.
          </p>
        </div>

        <ul class="installation-checklist text-muted-foreground">
          <li>Angular <code class="bg-muted text-foreground">^22.0.4</code></li>
          <li>Tailwind CSS v4</li>
          <li>Node version supported by the app</li>
          <li>A server/API route for model calls when you connect real streaming data</li>
        </ul>
      </section>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="install-packages"
      >
        <div class="installation-copy">
          <h2 id="install-packages" class="text-foreground">Install packages</h2>
          <p class="text-muted-foreground">
            Install Duxkit AI with its runtime peer dependencies. These packages cover the UI
            primitives, AI SDK types and Angular bindings, Spartan Brain behavior, icons, markdown
            rendering, and Tailwind class utilities.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="Package manager installation commands"
          copyLabel="Copy installation command"
          [tabs]="installTabs"
        />

        <div class="installation-table-wrap border border-border bg-card">
          <table class="installation-table text-muted-foreground">
            <caption class="sr-only">
              Required packages and why Duxkit AI needs them
            </caption>
            <thead>
              <tr>
                <th scope="col">Package</th>
                <th scope="col">Why it is needed</th>
              </tr>
            </thead>
            <tbody>
              @for (item of requiredPackages; track item.name) {
                <tr>
                  <td>
                    <code class="bg-muted text-foreground">{{ item.name }}</code>
                  </td>
                  <td>{{ item.reason }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <aside class="installation-note border border-border bg-muted/35">
          <h3 class="text-foreground">Not required for installation</h3>
          <p class="text-muted-foreground">
            Duxkit AI ships Angular primitives through npm. You do not need these packages or
            services for a consumer install.
          </p>
          <ul class="installation-tag-list text-muted-foreground">
            @for (item of notRequired; track item) {
              <li>{{ item }}</li>
            }
          </ul>
          <p class="text-muted-foreground">
            Use <code class="bg-muted text-foreground">tokenlens</code> only when you need context
            cost estimation. Provider SDKs and AI Gateway are server-side application choices, not
            Duxkit UI requirements.
          </p>
        </aside>
      </section>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="configure-tailwind"
      >
        <div class="installation-copy">
          <h2 id="configure-tailwind" class="text-foreground">Configure Tailwind CSS</h2>
          <p class="text-muted-foreground">
            Duxkit AI ships Tailwind utility classes in the package. Tailwind CSS v4 needs an
            explicit source path so those classes are included in your app build.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="PostCSS configuration"
          copyLabel="Copy PostCSS configuration"
          [tabs]="postcssTabs"
        />

        <app-docs-code-tabs
          ariaLabel="Global stylesheet setup"
          copyLabel="Copy stylesheet setup"
          [tabs]="stylesheetTabs"
        />

        <p class="installation-callout border-l-2 border-primary text-muted-foreground">
          Adjust the <code class="bg-muted text-foreground">&#64;source</code> path if your global
          stylesheet is not next to <code class="bg-muted text-foreground">node_modules</code> in
          the usual Angular app layout.
        </p>
      </section>

      <section class="installation-section border-b border-border" aria-labelledby="theme-tokens">
        <div class="installation-copy">
          <h2 id="theme-tokens" class="text-foreground">Add theme tokens</h2>
          <p class="text-muted-foreground">
            Duxkit AI uses the same token names as Spartan/shadcn-style Angular apps:
            <code class="bg-muted text-foreground">background</code>,
            <code class="bg-muted text-foreground">foreground</code>,
            <code class="bg-muted text-foreground">muted</code>,
            <code class="bg-muted text-foreground">border</code>,
            <code class="bg-muted text-foreground">ring</code>, and related colors. Add these
            variables once in your global stylesheet, then customize them to match your product.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="Theme token stylesheet"
          copyLabel="Copy theme tokens"
          [tabs]="themeTabs"
        />
      </section>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="render-primitive"
      >
        <div class="installation-copy">
          <h2 id="render-primitive" class="text-foreground">Render your first primitive</h2>
          <p class="text-muted-foreground">
            Create a small standalone component and render one assistant message. If this compiles
            and the message is styled, the package, Tailwind scan path, and theme tokens are
            working.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="Minimal Duxkit AI render check"
          copyLabel="Copy verification component"
          [tabs]="verificationTabs"
        />

        <p class="installation-callout border-l-2 border-primary text-muted-foreground">
          You should see a styled assistant message. If the message renders without styling, check
          the Tailwind <code class="bg-muted text-foreground">&#64;source</code> path and theme
          tokens.
        </p>
      </section>

      <section class="installation-section border-b border-border" aria-labelledby="connect-ai-sdk">
        <div class="installation-copy">
          <h2 id="connect-ai-sdk" class="text-foreground">Connect AI SDK state</h2>
          <p class="text-muted-foreground">
            Use <code class="bg-muted text-foreground">&#64;ai-sdk/angular</code> for chat state and
            streaming, then pass the resulting message data into Duxkit AI primitives. Keep provider
            credentials on your server; do not expose model API keys in browser code.
          </p>
        </div>

        <app-docs-code-tabs
          ariaLabel="AI SDK Angular chat state"
          copyLabel="Copy chat state example"
          [tabs]="chatStateTabs"
        />
      </section>

      <section
        class="installation-section border-b border-border"
        aria-labelledby="optional-integrations"
      >
        <div class="installation-copy">
          <h2 id="optional-integrations" class="text-foreground">Optional integrations</h2>
          <p class="text-muted-foreground">
            These packages are useful in specific apps, but they are not required to install Duxkit
            AI.
          </p>
        </div>

        <div class="installation-options">
          <article class="border border-border bg-card">
            <h3 class="text-foreground">tokenlens</h3>
            <p class="text-muted-foreground">Use only for context cost estimation.</p>
          </article>
          <article class="border border-border bg-card">
            <h3 class="text-foreground">Model provider SDKs</h3>
            <p class="text-muted-foreground">Install on the server side if your app needs them.</p>
          </article>
          <article class="border border-border bg-card">
            <h3 class="text-foreground">AI Gateway</h3>
            <p class="text-muted-foreground">
              Optional provider strategy, not a Duxkit AI requirement.
            </p>
          </article>
        </div>
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
            Once the minimal message renders, add the primitives your interface needs: conversation
            layout, prompt input, tools, reasoning, confirmations, sources, attachments, and
            markdown.
          </p>
        </div>

        <ul class="installation-next-links">
          <li>
            <a
              class="border border-border bg-card text-foreground hover:bg-muted"
              routerLink="/docs"
              >Docs</a
            >
          </li>
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
    .installation-tag-list,
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

    .installation-table-wrap {
      overflow-x: auto;
      border-radius: 8px;
    }

    .installation-table {
      width: 100%;
      min-width: 680px;
      border-collapse: collapse;
      font-size: 14px;
      line-height: 1.5;
    }

    .installation-table th,
    .installation-table td {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
      text-align: left;
    }

    .installation-table th {
      color: var(--foreground);
      font-weight: 600;
    }

    .installation-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .installation-note {
      display: grid;
      gap: 12px;
      border-radius: 8px;
      padding: 18px;
    }

    .installation-tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .installation-tag-list li {
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 5px 10px;
      font-size: 13px;
      line-height: 1.3;
    }

    .installation-callout {
      max-width: none;
      padding: 4px 0 4px 16px;
      font-size: 14px;
    }

    .installation-options {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    .installation-options article {
      display: grid;
      align-content: start;
      gap: 8px;
      border-radius: 8px;
      padding: 16px;
    }

    .installation-options p {
      font-size: 14px;
      line-height: 1.55;
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

      .installation-options {
        grid-template-columns: 1fr;
      }

      .installation-table {
        min-width: 620px;
      }
    }
  `,
})
export class InstallationPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.setPath('/docs/installation');
  }

  protected readonly installTabs = installTabs;
  protected readonly postcssTabs = postcssTabs;
  protected readonly stylesheetTabs = stylesheetTabs;
  protected readonly themeTabs = themeTabs;
  protected readonly verificationTabs = verificationTabs;
  protected readonly chatStateTabs = chatStateTabs;
  protected readonly requiredPackages = requiredPackages;
  protected readonly notRequired = notRequired;
  protected readonly troubleshooting = troubleshooting;
}

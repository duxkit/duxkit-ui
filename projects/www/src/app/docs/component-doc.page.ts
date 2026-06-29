import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import {
  componentApiMetadata,
  type ComponentApiSymbolMetadata,
} from './component-api-metadata.generated';
import {
  attachmentPreviewSnippets,
  ComponentDocPreview,
  componentPreviewSnippets,
} from './component-doc-preview.component';
import { DocsCodeTabs } from './docs-code-tabs.component';
import { DocsTableOfContents } from './docs-table-of-contents.component';
import { apiSymbolHeadingId, buildComponentDocsTableOfContents } from './docs-table-of-contents';
import { type ComponentDocSlug, componentDocs, findComponentDoc } from './component-docs.registry';

const packagePublished = false;

const componentImports: Record<ComponentDocSlug, string> = {
  conversation:
    "import { Conversation, ConversationContent, ConversationScrollAnchor } from 'duxkit-ai';",
  message: "import { Message, MessageContent } from 'duxkit-ai';",
  checkpoint: "import { Checkpoint, CheckpointIcon, CheckpointTrigger } from 'duxkit-ai';",
  attachment:
    "import { Attachment, AttachmentPreview, AttachmentRemove, Attachments } from 'duxkit-ai';",
  'chain-of-thought':
    "import { ChainOfThought, ChainOfThoughtContent, ChainOfThoughtStep, ChainOfThoughtTrigger } from 'duxkit-ai';",
  task: "import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from 'duxkit-ai';",
  tool: "import { Tool, ToolContent, ToolTrigger } from 'duxkit-ai';",
  reasoning: "import { Reasoning, ReasoningContent, ReasoningTrigger } from 'duxkit-ai';",
  sources: "import { Source, Sources, SourcesContent, SourcesTrigger } from 'duxkit-ai';",
  confirmation:
    "import { Confirmation, ConfirmationAction, ConfirmationActions, ConfirmationRequest, ConfirmationTitle } from 'duxkit-ai';",
  'code-block': "import { CodeBlock } from 'duxkit-ai';",
  shimmer: "import { Shimmer } from 'duxkit-ai';",
};

const anatomySnippets: Record<ComponentDocSlug, string> = {
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
  attachment: `<ai-attachments variant="grid">
  @for (attachment of attachments; track attachmentKey(attachment)) {
    <ai-attachment [data]="attachment" (removed)="removeAttachment(attachment)">
      <ai-attachment-preview />
      <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-sm"></button>
    </ai-attachment>
  }
</ai-attachments>`,
  'chain-of-thought': `<ai-chain-of-thought>
  <button aiChainOfThoughtTrigger>Reviewed context</button>
  <ai-chain-of-thought-content>
    <ai-chain-of-thought-step label="Read files" status="complete" />
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

const attachmentPreviewExamples = [
  { variant: 'grid', label: 'Grid' },
  { variant: 'inline', label: 'Inline' },
  { variant: 'list', label: 'List' },
] as const;

@Component({
  imports: [ComponentDocPreview, DocsCodeTabs, DocsTableOfContents, RouterLink],
  template: `
    @if (doc(); as doc) {
      <div class="docs-page-layout">
        <div class="docs-page-main">
          <header class="docs-page-header border-b border-border">
            <h1 class="font-medium! text-foreground">{{ doc.title }}</h1>
            <p class="text-muted-foreground">{{ doc.description }}</p>
          </header>

          <section class="docs-section border-b border-border" aria-labelledby="install">
            <div class="docs-section-copy">
              <h2 id="install" class="text-foreground">Install</h2>
              @if (packagePublished) {
                <p class="text-muted-foreground">
                  Add the package once, then import the primitive directly from the public API.
                </p>
              } @else {
                <p class="text-muted-foreground">
                  The docs are available as a preview while the package API is still being
                  finalized.
                </p>
              }
            </div>
            @if (packagePublished) {
              <app-docs-code-tabs
                ariaLabel="Installation options"
                copyLabel="Copy installation snippet"
                [tabs]="installTabs()"
              />
            } @else {
              <aside class="docs-install-soon border border-border bg-card text-muted-foreground">
                <h3 class="text-foreground">Coming soon</h3>
                <p>
                  The component APIs, examples, and usage patterns are still being finalized.
                  Install instructions are temporarily hidden while the component set is refined.
                </p>
              </aside>
            }
          </section>

          <section class="docs-section border-b border-border" aria-labelledby="anatomy">
            <div class="docs-section-copy">
              <h2 id="anatomy" class="text-foreground">Anatomy</h2>
              <p class="text-muted-foreground">
                Use these pieces as the starting structure for a generated example page.
              </p>
            </div>
            <app-docs-code-tabs
              ariaLabel="Component anatomy code"
              copyLabel="Copy anatomy snippet"
              [tabs]="anatomyTabs()"
            />
          </section>

          <section class="docs-section border-b border-border" aria-labelledby="preview">
            <div class="docs-section-copy">
              <h2 id="preview" class="text-foreground">Preview</h2>
              <p class="text-muted-foreground">
                Rendered Angular examples using the same primitives shown in the code tab.
              </p>
            </div>
            @if (doc.slug === 'attachment') {
              <div class="docs-preview-examples">
                @for (example of attachmentPreviewExamples; track example.variant) {
                  <article class="docs-preview-example">
                    <h3 class="text-foreground">{{ example.label }}</h3>
                    <app-docs-code-tabs
                      [ariaLabel]="example.label + ' attachment preview and code'"
                      [copyLabel]="'Copy ' + example.label + ' attachment code'"
                      previewLabel="Preview"
                      [tabs]="attachmentPreviewTabs(example.variant)"
                    >
                      <app-component-doc-preview
                        slug="attachment"
                        [attachmentVariant]="example.variant"
                      />
                    </app-docs-code-tabs>
                  </article>
                }
              </div>
            } @else {
              <app-docs-code-tabs
                ariaLabel="Preview and code"
                copyLabel="Copy preview code"
                previewLabel="Preview"
                [tabs]="previewTabs()"
              >
                <app-component-doc-preview [slug]="doc.slug" />
              </app-docs-code-tabs>
            }
          </section>

          <section class="docs-section border-b border-border" aria-labelledby="api">
            <div class="docs-section-copy">
              <h2 id="api" class="text-foreground">API</h2>
              <p class="text-muted-foreground">
                Generated selector, input, output, export, and source metadata.
              </p>
            </div>
            @if (apiMetadata(); as api) {
              <div class="docs-api-reference">
                @for (symbol of api.symbols; track symbol.name) {
                  <article class="docs-api-entry">
                    <h3 [id]="apiSymbolId(symbol.name)" class="text-foreground">
                      {{ symbol.name }}
                    </h3>

                    <dl class="docs-api-meta text-muted-foreground">
                      @for (selector of symbol.selectors; track selector) {
                        <div>
                          <dt>Selector:</dt>
                          <dd>
                            <code class="bg-muted text-foreground">{{ selector }}</code>
                          </dd>
                        </div>
                      }

                      @if (symbolExportAs(symbol); as exportAs) {
                        <div>
                          <dt>ExportAs:</dt>
                          <dd>
                            <code class="bg-muted text-foreground">{{ exportAs }}</code>
                          </dd>
                        </div>
                      }
                    </dl>

                    @if (symbol.inputs.length > 0) {
                      <div class="docs-api-table-group">
                        <h4 class="text-foreground">Inputs</h4>
                        <div class="docs-api-table-wrap border border-border bg-card">
                          <table
                            class="docs-api-table text-muted-foreground [&_td]:border-b [&_td]:border-border [&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-top [&_td]:whitespace-nowrap [&_th]:border-b [&_th]:border-border [&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:align-top [&_th]:font-semibold [&_th]:text-foreground [&_th]:whitespace-nowrap [&_tbody_tr:last-child_td]:border-b-0"
                          >
                            <thead>
                              <tr>
                                <th scope="col">Prop</th>
                                <th scope="col">Type</th>
                                <th scope="col">Default</th>
                                <th scope="col">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (input of symbol.inputs; track input.name) {
                                <tr>
                                  <td>
                                    <code class="docs-api-prop bg-muted text-foreground">
                                      {{ input.name }}
                                      @if (input.required) {
                                        <span aria-hidden="true">*</span>
                                        <span class="sr-only"> required</span>
                                      }
                                    </code>
                                  </td>
                                  <td>{{ input.type }}</td>
                                  <td>
                                    <code class="bg-muted text-foreground">
                                      {{ input.defaultValue }}
                                    </code>
                                  </td>
                                  <td>{{ apiDescription(input.description) }}</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    }

                    @if (symbol.outputs.length > 0) {
                      <div class="docs-api-table-group">
                        <h4 class="text-foreground">Outputs</h4>
                        <div class="docs-api-table-wrap border border-border bg-card">
                          <table
                            class="docs-api-table text-muted-foreground [&_td]:border-b [&_td]:border-border [&_td]:px-2.5 [&_td]:py-2.5 [&_td]:align-top [&_td]:whitespace-nowrap [&_th]:border-b [&_th]:border-border [&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:align-top [&_th]:font-semibold [&_th]:text-foreground [&_th]:whitespace-nowrap [&_tbody_tr:last-child_td]:border-b-0"
                          >
                            <thead>
                              <tr>
                                <th scope="col">Output</th>
                                <th scope="col">Type</th>
                                <th scope="col">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              @for (output of symbol.outputs; track output.name) {
                                <tr>
                                  <td>
                                    <code class="docs-api-prop bg-muted text-foreground">
                                      {{ output.name }}
                                    </code>
                                  </td>
                                  <td>{{ output.type }}</td>
                                  <td>{{ apiDescription(output.description) }}</td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>
                      </div>
                    }
                  </article>
                }
              </div>
            }
          </section>

          <section class="docs-section border-b border-border" aria-labelledby="related-primitives">
            <div class="docs-section-copy">
              <h2 id="related-primitives" class="text-foreground">Related Primitives</h2>
            </div>
            <ul class="related-list">
              @for (item of relatedDocs(); track item.slug) {
                <li>
                  <a
                    class="border border-border bg-card text-foreground hover:bg-muted"
                    [routerLink]="['/docs/components', item.slug]"
                  >
                    {{ item.title }}
                  </a>
                </li>
              }
            </ul>
          </section>
        </div>

        <app-docs-table-of-contents [items]="tableOfContents()" />
      </div>
    } @else {
      <section class="docs-missing" aria-labelledby="missing-title">
        <h1 id="missing-title" class="text-foreground">Component not found</h1>
        <p class="text-muted-foreground">This primitive is not in the docs registry yet.</p>
        <a
          class="border border-border bg-card text-foreground hover:bg-muted"
          routerLink="/docs/components"
        >
          View component docs
        </a>
      </section>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .docs-page-layout {
      width: 100%;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      align-items: start;
      gap: clamp(40px, 5vw, 72px);
    }

    .docs-page-main {
      width: min(100%, 820px);
      min-width: 0;
      justify-self: center;
    }

    .docs-page-header {
      display: grid;
      gap: 14px;
      padding-bottom: 30px;
    }

    .docs-page-header h1,
    .docs-missing h1 {
      font-size: clamp(2.125rem, 3.6vw, 3rem);
      line-height: 1.08;
      letter-spacing: 0;
      font-weight: 400;
    }

    .docs-page-header p,
    .docs-section-copy p,
    .docs-missing p {
      max-width: 680px;
      font-size: 17px;
      line-height: 1.6;
    }

    .docs-section {
      display: grid;
      gap: 18px;
      padding: 36px 0;
    }

    .docs-section-copy {
      display: grid;
      gap: 8px;
    }

    .docs-install-soon {
      display: grid;
      gap: 8px;
      border-radius: 8px;
      padding: 16px;
      font-size: 15px;
      line-height: 1.55;
    }

    .docs-install-soon h3 {
      margin: 0;
      font-size: 15px;
      line-height: 1.4;
      font-weight: 600;
      letter-spacing: 0;
    }

    .docs-install-soon p {
      margin: 0;
    }

    .docs-install-soon code {
      border-radius: 4px;
      padding: 2px 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.45;
    }

    .docs-section h2 {
      font-size: 22px;
      line-height: 1.25;
      font-weight: 500;
      letter-spacing: 0;
    }

    .docs-preview-examples {
      display: grid;
      gap: 18px;
      min-width: 0;
    }

    .docs-preview-example {
      display: grid;
      gap: 10px;
      min-width: 0;
    }

    .docs-preview-example h3 {
      margin: 0;
      font-size: 15px;
      line-height: 1.4;
      font-weight: 500;
      letter-spacing: 0;
    }

    .docs-api-reference {
      display: grid;
      gap: 34px;
    }

    .docs-api-entry {
      display: grid;
      align-content: start;
      gap: 8px;
      min-width: 0;
    }

    .docs-api-entry h3 {
      margin: 0;
      font-size: 18px;
      line-height: 1.3;
      font-weight: 600;
      letter-spacing: 0;
    }

    .docs-api-meta {
      display: grid;
      gap: 2px;
      margin: 0;
      font-size: 14px;
      line-height: 1.45;
    }

    .docs-api-meta div {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px;
      min-width: 0;
    }

    .docs-api-meta dt,
    .docs-api-meta dd {
      margin: 0;
    }

    .docs-api-meta code,
    .docs-api-table code {
      border-radius: 4px;
      padding: 2px 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.45;
    }

    .docs-api-table-group {
      display: grid;
      gap: 12px;
      min-width: 0;
      margin-top: 22px;
    }

    .docs-api-table-group h4 {
      margin: 0;
      font-size: 15px;
      line-height: 1.4;
      font-weight: 500;
    }

    .docs-api-table-wrap {
      min-width: 0;
      overflow-x: auto;
      border-radius: 8px;
    }

    .docs-api-table {
      width: 100%;
      min-width: 670px;
      border-collapse: collapse;
      font-size: 14px;
      line-height: 1.45;
      text-align: left;
    }

    .docs-api-table td:last-child,
    .docs-api-table th:last-child {
      width: 38%;
    }

    .docs-api-prop {
      font-weight: 600;
    }

    .related-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .related-list a,
    .docs-missing a {
      min-height: 36px;
      display: inline-flex;
      align-items: center;
      border-radius: 8px;
      padding: 0 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
    }

    .docs-missing {
      display: grid;
      gap: 16px;
      justify-items: start;
      padding: 44px 0;
    }

    @media (max-width: 1500px) {
      .docs-page-layout {
        grid-template-columns: minmax(0, 1fr);
      }

      .docs-page-main {
        grid-column: 1;
        margin: 0 auto;
      }
    }

    @media (max-width: 720px) {
      .docs-api-table {
        min-width: 600px;
      }
    }
  `,
})
export class ComponentDocPage {
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(this.route.paramMap.pipe(map((params) => params.get('slug'))), {
    initialValue: 'conversation',
  });

  protected readonly packagePublished = packagePublished;
  protected readonly doc = computed(() => findComponentDoc(this.slug() ?? ''));
  protected readonly attachmentPreviewExamples = attachmentPreviewExamples;
  protected readonly apiMetadata = computed(() => {
    const doc = this.doc();

    return doc ? componentApiMetadata[doc.slug] : undefined;
  });
  protected readonly tableOfContents = computed(() =>
    buildComponentDocsTableOfContents(this.apiMetadata()?.symbols ?? []),
  );
  protected readonly installSnippet = computed(() => 'pnpm add duxkit-ai');
  protected readonly importSnippet = computed(() => {
    const doc = this.doc();

    return doc ? componentImports[doc.slug] : '';
  });
  protected readonly anatomySnippet = computed(() => {
    const doc = this.doc();

    return doc ? anatomySnippets[doc.slug] : '';
  });
  protected readonly installTabs = computed(() => [
    {
      id: 'pnpm',
      label: 'pnpm',
      code: this.installSnippet(),
      language: 'bash',
    },
    {
      id: 'npm',
      label: 'npm',
      code: 'npm install duxkit-ai',
      language: 'bash',
    },
    {
      id: 'import',
      label: 'Manual',
      code: this.importSnippet(),
      language: 'ts',
    },
  ]);
  protected readonly anatomyTabs = computed(() => [
    {
      id: 'template',
      label: 'Template',
      code: this.anatomySnippet(),
      language: 'html',
    },
  ]);
  protected readonly previewTabs = computed(() => [
    {
      id: 'code',
      label: 'Code',
      code: this.doc() ? componentPreviewSnippets[this.doc()!.slug] : '',
      language: 'html',
    },
  ]);
  protected readonly relatedDocs = computed(() => {
    const doc = this.doc();

    return componentDocs.filter((item) => item.slug !== doc?.slug).slice(0, 3);
  });

  protected apiSymbolId(symbolName: string): string {
    return apiSymbolHeadingId(symbolName);
  }

  protected symbolExportAs(symbol: ComponentApiSymbolMetadata): string | undefined {
    return symbol.exportAs;
  }

  protected apiDescription(description: string | undefined): string {
    return description?.trim() || '-';
  }

  protected attachmentPreviewTabs(variant: keyof typeof attachmentPreviewSnippets) {
    return [
      {
        id: 'code',
        label: 'Code',
        code: attachmentPreviewSnippets[variant],
        language: 'html',
      },
    ];
  }
}

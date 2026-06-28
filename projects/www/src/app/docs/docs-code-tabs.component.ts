import { Component, ViewEncapsulation, computed, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy } from '@ng-icons/lucide';
import { AI_MARKDOWN_OPTIONS, renderHighlightedCode } from 'duxkit-ai';
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmIcon } from '@duxkit/ui/helm/icon';

export interface DocsCodeTab {
  readonly id: string;
  readonly label: string;
  readonly code: string;
  readonly language?: string;
}

@Component({
  selector: 'app-docs-code-tabs',
  imports: [HlmButton, HlmIcon, NgIcon],
  providers: [provideIcons({ lucideCheck, lucideCopy })],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (hasContent()) {
      <div class="docs-code-tabs">
        <div class="docs-code-tabs-header">
          <div class="docs-code-tabs-list" role="tablist" [attr.aria-label]="ariaLabel()">
            @if (hasPreview()) {
              <button
                class="docs-code-tab-trigger"
                type="button"
                role="tab"
                [id]="tabId(previewTabId)"
                [attr.aria-controls]="panelId(previewTabId)"
                [attr.aria-selected]="isPreviewActive()"
                [attr.tabindex]="isPreviewActive() ? 0 : -1"
                (click)="selectTab(previewTabId)"
                (keydown)="handleTabKeydown($event, previewTabId)"
              >
                {{ previewLabel() }}
              </button>
            }

            @for (item of tabs(); track item.id) {
              <button
                class="docs-code-tab-trigger"
                type="button"
                role="tab"
                [id]="tabId(item.id)"
                [attr.aria-controls]="panelId(item.id)"
                [attr.aria-selected]="item.id === activePanelId()"
                [attr.tabindex]="item.id === activePanelId() ? 0 : -1"
                (click)="selectTab(item.id)"
                (keydown)="handleTabKeydown($event, item.id)"
              >
                {{ item.label }}
              </button>
            }
          </div>

          @if (activeTab()) {
            <button
              hlmBtn
              class="docs-code-copy"
              type="button"
              variant="ghost"
              size="icon-sm"
              [attr.aria-label]="copyButtonLabel()"
              [title]="copyButtonLabel()"
              (click)="copyActiveCode()"
            >
              <ng-icon
                hlmIcon
                size="sm"
                [name]="copied() ? 'lucideCheck' : 'lucideCopy'"
                aria-hidden="true"
              />
            </button>
          }
        </div>

        <div
          class="docs-code-tabs-panel"
          [class.docs-code-tabs-panel-preview]="isPreviewActive()"
          role="tabpanel"
          tabindex="0"
          [id]="panelId(activePanelId())"
          [attr.aria-labelledby]="tabId(activePanelId())"
        >
          @if (isPreviewActive()) {
            <ng-content />
          } @else {
            <pre><code
              class="hljs"
              [class]="'hljs language-' + languageLabel()"
              [innerHTML]="highlightedCode()"
            ></code></pre>
          }
        </div>
      </div>
    }
  `,
  styles: `
    .docs-code-tabs {
      overflow: hidden;
      border: 1px solid #dcdfe4;
      border-radius: 6px;
      background: #ffffff;
      color: #18181b;
    }

    .docs-code-tabs-header {
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid #dcdfe4;
      background: #fafafa;
      padding: 0 8px 0 12px;
    }

    .docs-code-tabs-list {
      min-width: 0;
      display: flex;
      align-items: stretch;
      gap: 14px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .docs-code-tabs-list::-webkit-scrollbar {
      display: none;
    }

    .docs-code-tab-trigger {
      min-height: 36px;
      flex: 0 0 auto;
      border: 0;
      border-bottom: 2px solid transparent;
      padding: 0;
      background: transparent;
      color: #71717a;
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0;
    }

    .docs-code-tab-trigger:hover,
    .docs-code-tab-trigger:focus-visible {
      color: #09090b;
    }

    .docs-code-tab-trigger:focus-visible {
      outline: 2px solid #0069ff;
      outline-offset: 2px;
    }

    .docs-code-tab-trigger[aria-selected='true'] {
      border-bottom-color: #0069ff;
      color: #0069ff;
    }

    .docs-code-copy {
      flex: 0 0 auto;
      color: #3f3f46;
    }

    .docs-code-copy:hover,
    .docs-code-copy:focus-visible {
      background: transparent !important;
      color: #09090b;
    }

    .docs-code-tabs-panel {
      overflow: auto;
      background: #ffffff;
    }

    .docs-code-tabs-panel-preview {
      overflow: visible;
      padding: 16px;
    }

    .docs-code-tabs-panel:focus-visible {
      outline: 2px solid #0069ff;
      outline-offset: -2px;
    }

    .docs-code-tabs pre {
      margin: 0;
      padding: 16px;
      font-size: 13px;
      line-height: 1.65;
    }

    .docs-code-tabs code {
      min-width: max-content;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      white-space: pre;
    }

    .docs-code-tabs .ai-code-line {
      display: block;
    }

    .docs-code-tabs .ai-code-line-number {
      display: none;
    }

    .docs-code-tabs .hljs-keyword,
    .docs-code-tabs .hljs-selector-tag,
    .docs-code-tabs .hljs-title.function_ {
      color: #0969da;
    }

    .docs-code-tabs .hljs-string,
    .docs-code-tabs .hljs-attr,
    .docs-code-tabs .hljs-template-tag {
      color: #0a7f42;
    }

    .docs-code-tabs .hljs-title,
    .docs-code-tabs .hljs-name,
    .docs-code-tabs .hljs-variable,
    .docs-code-tabs .hljs-property {
      color: #8250df;
    }

    .docs-code-tabs .hljs-comment {
      color: #6e7781;
    }

    .docs-code-tabs .hljs-number,
    .docs-code-tabs .hljs-literal {
      color: #cf222e;
    }

    @media (prefers-color-scheme: dark) {
      .docs-code-tabs {
        border-color: #27272a;
        background: #111113;
        color: #fafafa;
      }

      .docs-code-tabs-header {
        border-color: #27272a;
        background: #09090b;
      }

      .docs-code-tab-trigger {
        color: #a1a1aa;
      }

      .docs-code-tab-trigger:hover,
      .docs-code-tab-trigger:focus-visible,
      .docs-code-copy:hover,
      .docs-code-copy:focus-visible {
        color: #fafafa;
      }

      .docs-code-copy {
        color: #d4d4d8;
      }

      .docs-code-tabs-panel {
        background: #111113;
      }

      .docs-code-tabs .hljs-keyword,
      .docs-code-tabs .hljs-selector-tag,
      .docs-code-tabs .hljs-title.function_ {
        color: #79c0ff;
      }

      .docs-code-tabs .hljs-string,
      .docs-code-tabs .hljs-attr,
      .docs-code-tabs .hljs-template-tag {
        color: #7ee787;
      }

      .docs-code-tabs .hljs-title,
      .docs-code-tabs .hljs-name,
      .docs-code-tabs .hljs-variable,
      .docs-code-tabs .hljs-property {
        color: #d2a8ff;
      }

      .docs-code-tabs .hljs-comment {
        color: #8b949e;
      }

      .docs-code-tabs .hljs-number,
      .docs-code-tabs .hljs-literal {
        color: #ffa198;
      }
    }

    @media (max-width: 640px) {
      .docs-code-tabs-header {
        padding-left: 10px;
      }

      .docs-code-tabs pre {
        padding: 14px;
        font-size: 12px;
      }

      .docs-code-tabs code {
        min-width: 0;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }
    }
  `,
})
export class DocsCodeTabs {
  protected readonly previewTabId = 'preview';

  public readonly tabs = input.required<readonly DocsCodeTab[]>();
  public readonly ariaLabel = input('Code snippets');
  public readonly copyLabel = input('Copy code');
  public readonly previewLabel = input<string | undefined>(undefined);

  private readonly markdownOptions = inject(AI_MARKDOWN_OPTIONS);

  protected readonly selectedTabId = signal<string | undefined>(undefined);
  protected readonly copied = signal(false);
  protected readonly hasPreview = computed(() => Boolean(this.previewLabel()));
  protected readonly hasContent = computed(() => this.hasPreview() || this.tabs().length > 0);
  protected readonly activePanelId = computed(() => {
    const selectedTabId = this.selectedTabId();

    if (selectedTabId) {
      return selectedTabId;
    }

    if (this.hasPreview()) {
      return this.previewTabId;
    }

    return this.tabs().find((tab) => tab.code.trim().length > 0)?.id ?? this.tabs()[0]?.id ?? '';
  });
  protected readonly isPreviewActive = computed(() => this.activePanelId() === this.previewTabId);
  protected readonly activeTab = computed(() =>
    this.tabs().find((tab) => tab.id === this.activePanelId()),
  );
  protected readonly languageLabel = computed(() => this.activeTab()?.language?.trim() || 'text');
  protected readonly highlightedCode = computed(() => {
    const tab = this.activeTab();

    return tab ? renderHighlightedCode(tab.code, tab.language, this.markdownOptions) : '';
  });
  protected readonly copyButtonLabel = computed(() =>
    this.copied() ? 'Copied code' : this.copyLabel(),
  );

  protected selectTab(id: string): void {
    this.selectedTabId.set(id);
    this.copied.set(false);
  }

  protected async copyActiveCode(): Promise<void> {
    const code = this.activeTab()?.code;

    if (!code) {
      return;
    }

    await globalThis.navigator?.clipboard?.writeText(code);

    this.copied.set(true);
    globalThis.setTimeout(() => this.copied.set(false), 1400);
  }

  protected handleTabKeydown(event: KeyboardEvent, id: string): void {
    const tabs = [
      ...(this.hasPreview() ? [{ id: this.previewTabId }] : []),
      ...this.tabs().map((tab) => ({ id: tab.id })),
    ];
    const currentIndex = tabs.findIndex((tab) => tab.id === id);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextTab = tabs[nextIndex];

    if (!nextTab) {
      return;
    }

    this.selectTab(nextTab.id);
    queueMicrotask(() => this.focusTab(event.currentTarget, nextTab.id));
  }

  protected tabId(id: string): string {
    return `docs-code-tab-${id}`;
  }

  protected panelId(id: string): string {
    return `docs-code-panel-${id}`;
  }

  private focusTab(currentTarget: EventTarget | null, id: string): void {
    if (!(currentTarget instanceof HTMLElement)) {
      return;
    }

    currentTarget
      .closest('.docs-code-tabs-list')
      ?.querySelector<HTMLElement>(`#${CSS.escape(this.tabId(id))}`)
      ?.focus();
  }
}

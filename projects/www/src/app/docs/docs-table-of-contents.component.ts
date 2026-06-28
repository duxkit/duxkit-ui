import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import {
  flattenDocsTableOfContentsItems,
  type DocsTableOfContentsItem,
} from './docs-table-of-contents';

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
      width: 300px;
      min-width: 0;
      display: block;
      position: sticky;
      top: 89px;
      justify-self: end;
      align-self: start;
    }

    .docs-toc {
      max-height: calc(100dvh - 113px);
      overflow: auto;
      padding-left: 20px;
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
      max-width: 100%;
      display: inline-flex;
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

    @media (max-width: 1500px) {
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
  private readonly flatItems = computed(() => flattenDocsTableOfContentsItems(this.items()));

  constructor() {
    effect(() => {
      this.flatItems();
      this.scheduleActiveUpdate();
    });
  }

  protected anchorHref(id: string): string {
    const { pathname, search } = this.document.location;

    return `${pathname}${search}#${id}`;
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
    let activeHeading = headings[0];

    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= activationLine) {
        activeHeading = heading;
      }
    }

    this.activeId.set(activeHeading.id);
  }
}

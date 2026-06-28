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
    <nav class="docs-toc border-l border-border" aria-label="On this page">
      <h2 class="text-muted-foreground">On this page</h2>
      <ol>
        @for (item of items(); track item.id) {
          <li>
            <a
              class="text-muted-foreground hover:text-foreground focus-visible:text-foreground"
              [href]="anchorHref(item.id)"
              [class.is-active]="activeId() === item.id"
              [class.text-foreground]="activeId() === item.id"
              [class.text-muted-foreground]="activeId() !== item.id"
              [class.font-semibold]="activeId() === item.id"
              [attr.aria-current]="activeId() === item.id ? 'location' : null"
            >
              {{ item.label }}
            </a>

            @if (item.items?.length) {
              <ol>
                @for (child of item.items; track child.id) {
                  <li>
                    <a
                      class="text-muted-foreground hover:text-foreground focus-visible:text-foreground"
                      [href]="anchorHref(child.id)"
                      [class.is-active]="activeId() === child.id"
                      [class.text-foreground]="activeId() === child.id"
                      [class.text-muted-foreground]="activeId() !== child.id"
                      [class.font-semibold]="activeId() === child.id"
                      [attr.aria-current]="activeId() === child.id ? 'location' : null"
                    >
                      <code class="bg-muted text-inherit">{{ child.label }}</code>
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
      scrollbar-width: thin;
    }

    .docs-toc h2 {
      margin: 0 0 12px;
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
      font-size: 14px;
      line-height: 1.35;
      font-weight: 450;
      text-decoration: none;
    }

    .docs-toc a.is-active {
      font-weight: 650;
    }

    .docs-toc code {
      overflow-wrap: anywhere;
      border-radius: 4px;
      padding: 1px 3px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.45;
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

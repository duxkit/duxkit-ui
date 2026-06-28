import { NgOptimizedImage, DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { type BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmCommandImports } from '@duxkit/ui/helm/command';
import { HlmNavigationMenuImports } from '@duxkit/ui/helm/navigation-menu';
import {
  type ComponentDocsSearchItem,
  componentDocsSearchIndex,
  matchesDocsSearchText,
  searchComponentDocs,
} from './docs/docs-search';

interface HeaderNavItem {
  readonly label: string;
  readonly routerLink: string;
  readonly fragment?: string;
}

@Component({
  selector: 'app-header',
  imports: [
    HlmCommandImports,
    HlmNavigationMenuImports,
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
  ],
  host: {
    '(document:keydown)': 'handleDocumentKeydown($event)',
  },
  template: `
    <header class="site-header" aria-label="Site header">
      <div class="site-header-inner">
        <div class="header-left">
          <a class="brand" routerLink="/" aria-label="Duxkit UI home">
            <img
              class="brand-mark"
              ngSrc="duxkit-mark.png"
              width="512"
              height="512"
              alt=""
              aria-hidden="true"
              priority
            />
            <span class="brand-name">
              Duxkit
              <span class="brand-badge" aria-hidden="true">UI</span>
            </span>
          </a>

          <nav
            hlmNavigationMenu
            class="primary-navigation"
            aria-label="Primary navigation"
            openOn="hover"
          >
            <ul hlmNavigationMenuList class="primary-nav">
              @for (item of primaryNavItems; track item.label) {
                <li hlmNavigationMenuItem>
                  <a
                    hlmNavigationMenuLink
                    routerLinkActive
                    #routeActive="routerLinkActive"
                    [active]="routeActive.isActive"
                    [routerLink]="item.routerLink"
                    [fragment]="item.fragment"
                    [routerLinkActiveOptions]="{ exact: item.routerLink === '/' }"
                  >
                    {{ item.label }}
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>

        <div class="nav-actions" aria-label="Account actions">
          <button
            class="search-trigger"
            type="button"
            aria-label="Search documentation"
            aria-haspopup="dialog"
            [attr.aria-expanded]="searchOpen()"
            (click)="openSearch()"
          >
            <span>Search...</span>
            <kbd>⌘K</kbd>
          </button>
          <button class="ask-trigger" type="button">
            <span aria-hidden="true">↗</span>
            <span>Ask AI</span>
          </button>
        </div>
      </div>
    </header>

    <hlm-command-dialog
      title="Search documentation"
      description="Search component docs by name, selector, export, input, or output."
      dialogContentClass="w-[min(92vw,520px)] p-0"
      [state]="searchState()"
      (stateChange)="setSearchState($event)"
    >
      <hlm-command
        [filter]="commandSearchFilter"
        [search]="searchQuery()"
        (searchChange)="setSearchQuery($event)"
        aria-label="Search documentation"
      >
        <hlm-command-input
          inputId="docs-command-search"
          placeholder="Search components or APIs..."
        />

        <hlm-command-list>
          @if (filteredDocs().length === 0) {
            <div hlmCommandEmpty>No documentation found.</div>
          } @else {
            <hlm-command-group>
              <div hlmCommandGroupLabel>Components</div>
              @for (item of filteredDocs(); track item.slug) {
                <button
                  hlmCommandItem
                  type="button"
                  [value]="item.searchText"
                  (selected)="openSearchResult(item)"
                  (click)="openSearchResult(item)"
                >
                  <span class="docs-command-result">
                    <span class="docs-command-result-title">{{ item.title }}</span>
                    <span class="docs-command-result-description">{{ item.description }}</span>
                  </span>
                  <!--                  <span hlmCommandShortcut>{{ primarySelector(item) }}</span>-->
                </button>
              }
            </hlm-command-group>
          }
        </hlm-command-list>
      </hlm-command>
    </hlm-command-dialog>
  `,
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  protected readonly primaryNavItems: readonly HeaderNavItem[] = [
    { label: 'Primitives', routerLink: '/docs/components' },
    { label: 'Examples', routerLink: '/', fragment: 'primitives' },
    { label: 'Docs', routerLink: '/docs/components' },
  ];

  protected readonly searchState = signal<BrnDialogState>('closed');
  protected readonly searchQuery = signal('');
  protected readonly searchOpen = computed(() => this.searchState() === 'open');
  protected readonly filteredDocs = computed(() =>
    searchComponentDocs(this.searchQuery()).slice(0, componentDocsSearchIndex.length),
  );
  protected readonly commandSearchFilter = (value: string, search: string): boolean =>
    matchesDocsSearchText(value, search);

  protected openSearch(): void {
    this.searchState.set('open');
    globalThis.setTimeout(() => {
      this.document.getElementById('docs-command-search')?.focus();
    });
  }

  protected setSearchState(state: BrnDialogState): void {
    this.searchState.set(state);

    if (state === 'closed') {
      this.searchQuery.set('');
    }
  }

  protected setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  protected openSearchResult(item: ComponentDocsSearchItem): void {
    this.searchState.set('closed');
    this.searchQuery.set('');
    void this.router.navigate(['/docs/components', item.slug]);
  }

  protected primarySelector(item: ComponentDocsSearchItem): string {
    return item.api.selectors[0] ?? item.slug;
  }

  protected handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) {
      return;
    }

    event.preventDefault();
    this.openSearch();
  }
}

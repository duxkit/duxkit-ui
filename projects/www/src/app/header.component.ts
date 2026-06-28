import { NgOptimizedImage, DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { type BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmCommandImports } from '@duxkit/ui/helm/command';
import { HlmIcon } from '@duxkit/ui/helm/icon';
import {
  type ComponentDocsSearchItem,
  componentDocsSearchIndex,
  matchesDocsSearchText,
  searchComponentDocs,
} from './docs/docs-search';

type ThemeMode = 'light' | 'dark';

const themeStorageKey = 'duxkit-ui-theme';

@Component({
  selector: 'app-header',
  imports: [HlmCommandImports, HlmIcon, NgIcon, RouterLink],
  providers: [provideIcons({ lucideMoon, lucideSun })],
  host: {
    '(document:keydown)': 'handleDocumentKeydown($event)',
  },
  template: `
    <header class="site-header" aria-label="Site header">
      <div class="site-header-inner">
        <div class="header-left">
          <a class="brand" routerLink="/" aria-label="Duxkit UI home">
<!--            <img-->
<!--              class="brand-mark"-->
<!--              ngSrc="dux_logomark.png"-->
<!--              width="512"-->
<!--              height="352"-->
<!--              alt=""-->
<!--              aria-hidden="true"-->
<!--              priority-->
<!--            />-->
            <span class="brand-name">Duxkit</span>
          </a>

          <span class="brand-badge" aria-hidden="true">UI</span>
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

          <button
            class="theme-trigger"
            type="button"
            [attr.aria-label]="themeToggleLabel()"
            [title]="themeToggleLabel()"
            (click)="toggleTheme()"
          >
            <ng-icon hlmIcon size="sm" [name]="themeIcon()" aria-hidden="true" />
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

  protected readonly searchState = signal<BrnDialogState>('closed');
  protected readonly searchQuery = signal('');
  protected readonly theme = signal<ThemeMode>(this.readInitialTheme());
  protected readonly searchOpen = computed(() => this.searchState() === 'open');
  protected readonly themeIcon = computed(() =>
    this.theme() === 'dark' ? 'lucideSun' : 'lucideMoon',
  );
  protected readonly themeToggleLabel = computed(() =>
    this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
  protected readonly filteredDocs = computed(() =>
    searchComponentDocs(this.searchQuery()).slice(0, componentDocsSearchIndex.length),
  );
  protected readonly commandSearchFilter = (value: string, search: string): boolean =>
    matchesDocsSearchText(value, search);

  constructor() {
    this.applyTheme(this.theme());
  }

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

  protected toggleTheme(): void {
    const nextTheme = this.theme() === 'dark' ? 'light' : 'dark';

    this.theme.set(nextTheme);
    this.applyTheme(nextTheme);
    this.storeTheme(nextTheme);
  }

  protected handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key.toLowerCase() !== 'k' || (!event.metaKey && !event.ctrlKey)) {
      return;
    }

    event.preventDefault();
    this.openSearch();
  }

  private readInitialTheme(): ThemeMode {
    const storedTheme = this.readStoredTheme();

    if (storedTheme) {
      return storedTheme;
    }

    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private readStoredTheme(): ThemeMode | undefined {
    try {
      const storedTheme = globalThis.localStorage?.getItem(themeStorageKey);

      return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : undefined;
    } catch {
      return undefined;
    }
  }

  private storeTheme(theme: ThemeMode): void {
    try {
      globalThis.localStorage?.setItem(themeStorageKey, theme);
    } catch {
      // Storage can be unavailable in private browsing or restricted embeds.
    }
  }

  private applyTheme(theme: ThemeMode): void {
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
  }
}

import { isPlatformBrowser, NgOptimizedImage, DOCUMENT } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGithub, lucideMenu, lucideX } from '@ng-icons/lucide';
import { type BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmCommandImports } from '@duxkit-private/ui/helm/command';
import { HlmDrawerImports } from '@duxkit-private/ui/helm/drawer';
import { HlmIcon } from '@duxkit-private/ui/helm/icon';
import { HlmNavigationMenuImports } from '@duxkit-private/ui/helm/navigation-menu';
import { filter, map } from 'rxjs';
import {
  componentSidebarGroup,
  componentHref,
  docsPages,
  getSectionForPath,
  topLevelSections,
  type SiteSection,
} from '../../routes/docs/data/docs-navigation';
import {
  type ComponentDocsSearchItem,
  componentDocsSearchIndex,
  matchesDocsSearchText,
  searchComponentDocs,
} from '../../routes/docs/search/docs-search';

@Component({
  selector: 'app-header',
  imports: [
    HlmCommandImports,
    HlmDrawerImports,
    HlmIcon,
    HlmNavigationMenuImports,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [provideIcons({ lucideGithub, lucideMenu, lucideX })],
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
              ngSrc="dux_logomark.png"
              width="512"
              height="352"
              alt=""
              aria-hidden="true"
              priority
            />
            <span class="brand-name">Duxkit</span>
          </a>

          <span class="brand-badge" aria-hidden="true">UI</span>

          <nav
            class="site-section-nav desktop-only"
            hlmNavigationMenu
            orientation="horizontal"
            openOn="hover"
            aria-label="Primary"
          >
            <ul hlmNavigationMenuList class="site-section-nav-list">
              @for (section of topLevelSections; track section.href) {
                <li hlmNavigationMenuItem>
                  <a
                    hlmNavigationMenuLink
                    class="site-section-link"
                    [class.site-section-link-active]="activeSection() === section.section"
                    [routerLink]="section.href"
                    [attr.aria-current]="activeSection() === section.section ? 'page' : null"
                  >
                    {{ section.label }}
                  </a>
                </li>
              }
            </ul>
          </nav>
        </div>

        <div class="nav-actions" aria-label="Site actions">
          @if (isBrowser) {
            <hlm-drawer direction="left" class="mobile-only">
              <button
                hlmDrawerTrigger
                class="theme-trigger mobile-nav-trigger"
                type="button"
                aria-label="Open navigation menu"
              >
                <ng-icon hlmIcon size="sm" name="lucideMenu" aria-hidden="true" />
              </button>

              <hlm-drawer-content *hlmDrawerPortal class="mobile-nav-drawer">
                <div hlmDrawerHeader class="mobile-nav-header">
                  <div class="mobile-nav-brand-row">
                    <div class="mobile-nav-brand">
                      <span hlmDrawerTitle class="mobile-nav-brand-name">Duxkit</span>
                      <span class="mobile-nav-brand-badge" aria-hidden="true">UI</span>
                    </div>

                    <button
                      hlmDrawerClose
                      class="theme-trigger mobile-nav-close"
                      type="button"
                      aria-label="Close navigation menu"
                    >
                      <ng-icon hlmIcon size="sm" name="lucideX" aria-hidden="true" />
                    </button>
                  </div>

                  <p hlmDrawerDescription class="sr-only">Navigation</p>
                </div>

                <div class="mobile-nav-body">
                  <nav class="mobile-nav-group" aria-label="Sections">
                    <div class="mobile-nav-links">
                      @for (section of topLevelSections; track section.href) {
                        <a
                          class="mobile-nav-link"
                          [class.mobile-nav-link-active]="activeSection() === section.section"
                          [routerLink]="section.href"
                          [attr.aria-current]="activeSection() === section.section ? 'page' : null"
                        >
                          {{ section.label }}
                        </a>
                      }
                    </div>
                  </nav>

                  @if (activeSection() === 'docs') {
                    <nav class="mobile-nav-group" aria-label="Docs pages">
                      <p class="mobile-nav-heading text-muted-foreground">Getting Started</p>
                      <div class="mobile-nav-links">
                        @for (page of docsPages; track page.href) {
                          <a
                            class="mobile-nav-link"
                            [class.mobile-nav-link-active]="currentUrl() === page.href"
                            [routerLink]="page.href"
                            [attr.aria-current]="currentUrl() === page.href ? 'page' : null"
                          >
                            {{ page.title }}
                          </a>
                        }
                      </div>
                    </nav>
                  } @else if (activeSection() === 'components') {
                    <nav class="mobile-nav-group" aria-label="Component pages">
                      <p class="mobile-nav-heading text-muted-foreground">
                        {{ componentSidebarGroup.title }}
                      </p>
                      <div class="mobile-nav-links">
                        @for (item of componentSidebarGroup.items; track item.slug) {
                          <a
                            class="mobile-nav-link"
                            [class.mobile-nav-link-active]="
                              currentUrl() === componentHref(item.slug)
                            "
                            [routerLink]="componentHref(item.slug)"
                            [attr.aria-current]="
                              currentUrl() === componentHref(item.slug) ? 'page' : null
                            "
                          >
                            {{ item.title }}
                          </a>
                        }
                      </div>
                    </nav>
                  }
                </div>
              </hlm-drawer-content>
            </hlm-drawer>
          }

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

          <a
            class="theme-trigger"
            href="https://github.com/duxkit/duxkit-ui"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View DuxKit UI on GitHub"
            title="View DuxKit UI on GitHub"
          >
            <ng-icon hlmIcon size="sm" name="lucideGithub" aria-hidden="true" />
          </a>
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
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly routerUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly searchState = signal<BrnDialogState>('closed');
  protected readonly searchQuery = signal('');
  protected readonly currentUrl = computed(() => this.routerUrl());
  protected readonly activeSection = computed<SiteSection | undefined>(() =>
    getSectionForPath(this.currentUrl()),
  );
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
    void this.router.navigate(['/components', item.slug]);
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

  protected readonly componentSidebarGroup = componentSidebarGroup;
  protected readonly componentHref = componentHref;
  protected readonly docsPages = docsPages;
  protected readonly topLevelSections = topLevelSections;
}

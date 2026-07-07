import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmNavigationMenuImports } from '@duxkit/ui/helm/navigation-menu';
import { docsPages } from './data/docs-navigation';

@Component({
  imports: [HlmNavigationMenuImports, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="docs-layout">
      <aside class="docs-sidebar" aria-label="Documentation navigation">
        <div class="docs-sidebar-heading text-muted-foreground">
          <span>Getting Started</span>
        </div>

        <nav hlmNavigationMenu orientation="vertical" openOn="hover">
          <ul hlmNavigationMenuList class="docs-sidebar-list">
            @for (item of docsPages; track item.slug) {
              <li hlmNavigationMenuItem>
                <a
                  hlmNavigationMenuLink
                  routerLinkActive
                  #routeActive="routerLinkActive"
                  class="docs-sidebar-link hover:text-foreground focus:text-foreground"
                  [class.text-foreground]="routeActive.isActive"
                  [class.text-muted-foreground]="!routeActive.isActive"
                  [active]="routeActive.isActive"
                  [routerLink]="item.href"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  {{ item.title }}
                </a>
              </li>
            }
          </ul>
        </nav>
      </aside>

      <article class="docs-content">
        <router-outlet />
      </article>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .docs-layout {
      width: 100%;
      display: grid;
      grid-template-columns: 240px minmax(0, 1fr);
      justify-content: start;
      gap: clamp(28px, 4vw, 56px);
      padding: 48px 24px 88px clamp(24px, 4vw, 56px);
    }

    .docs-sidebar {
      align-self: start;
      position: sticky;
      top: 81px;
      max-height: calc(100dvh - 97px);
      min-width: 0;
      overflow: auto;
      scrollbar-width: thin;
    }

    .docs-sidebar-heading {
      margin-bottom: 12px;
      padding: 0 8px;
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0.08em;
    }

    .docs-sidebar nav[hlmNavigationMenu] {
      width: 100%;
      max-width: none;
      display: block;
    }

    .docs-sidebar-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 2px;
    }

    .docs-sidebar-list li,
    .docs-sidebar-list a {
      width: 100%;
    }

    .docs-sidebar-link {
      font-weight: 450;
      text-decoration: none;
      background: transparent !important;
    }

    .docs-sidebar-link:hover,
    .docs-sidebar-link:focus {
      background: transparent !important;
    }

    .docs-sidebar-link.is-active,
    .docs-sidebar-link[data-active='true'] {
      font-weight: 600;
      background: transparent !important;
    }

    .docs-content {
      min-width: 0;
    }

    @media (max-width: 860px) {
      .docs-layout {
        width: min(100% - 32px, 720px);
        grid-template-columns: 1fr;
        gap: 28px;
        margin: 0 auto;
        padding: 32px 0 72px;
      }

      .docs-sidebar {
        display: none;
      }
    }
  `,
})
export class DocsShellPage {
  protected readonly docsPages = docsPages;
}

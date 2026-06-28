import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HlmNavigationMenuImports } from '@duxkit/ui/helm/navigation-menu';
import { componentDocs } from './component-docs.registry';

@Component({
  imports: [HlmNavigationMenuImports, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="docs-layout">
      <aside class="docs-sidebar" aria-label="Component docs">
        <div class="docs-sidebar-heading">
          <span>Chatbot</span>
        </div>

        <nav hlmNavigationMenu orientation="vertical" openOn="hover">
          <ul hlmNavigationMenuList class="docs-sidebar-list">
            @for (item of componentDocs; track item.slug) {
              <li hlmNavigationMenuItem>
                <a
                  hlmNavigationMenuLink
                  routerLinkActive
                  #routeActive="routerLinkActive"
                  [active]="routeActive.isActive"
                  [routerLink]="['/docs/components', item.slug]"
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
      color: #71717a;
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

    .docs-sidebar-list a {
      color: #3f3f46;
      font-weight: 450;
      text-decoration: none;
      background: transparent !important;
    }

    .docs-sidebar-list a:hover,
    .docs-sidebar-list a:focus {
      color: #0069ff;
      background: transparent !important;
    }

    .docs-sidebar-list a.is-active,
    .docs-sidebar-list a[data-active='true'] {
      color: #09090b;
      font-weight: 600;
      background: transparent !important;
    }

    .docs-content {
      min-width: 0;
    }

    @media (prefers-color-scheme: dark) {
      .docs-sidebar-heading {
        color: #a1a1aa;
      }

      .docs-sidebar-list a {
        color: #d4d4d8;
      }

      .docs-sidebar-list a:hover,
      .docs-sidebar-list a:focus {
        color: #79c0ff;
      }

      .docs-sidebar-list a.is-active,
      .docs-sidebar-list a[data-active='true'] {
        color: #fafafa;
      }
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
        position: static;
      }

      .docs-sidebar-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
      }
    }
  `,
})
export class DocsShellPage {
  protected readonly componentDocs = componentDocs;
}

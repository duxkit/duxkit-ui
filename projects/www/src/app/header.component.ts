import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HlmNavigationMenuImports } from '@duxkit/ui/helm/navigation-menu';

interface HeaderNavItem {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-header',
  imports: [HlmNavigationMenuImports, NgOptimizedImage],
  template: `
    <header class="site-header" aria-label="Site header">
      <div class="site-header-inner">
        <div class="header-left">
          <a class="brand" href="/" aria-label="Duxkit UI home">
            <img
              class="brand-mark"
              ngSrc="duxkit-mark.png"
              width="512"
              height="512"
              alt=""
              aria-hidden="true"
              priority
            />
            <span class="brand-name">Duxkit</span>
          </a>

          <nav
            hlmNavigationMenu
            class="primary-navigation"
            aria-label="Primary navigation"
            openOn="hover"
          >
            <ul hlmNavigationMenuList class="primary-nav">
              @for (item of primaryNavItems; track item.href) {
                <li hlmNavigationMenuItem>
                  <a hlmNavigationMenuLink [href]="item.href">{{ item.label }}</a>
                </li>
              }
            </ul>
          </nav>
        </div>

        <div class="nav-actions" aria-label="Account actions">
          <button class="search-trigger" type="button" aria-label="Search documentation">
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
  `,
})
export class HeaderComponent {
  protected readonly primaryNavItems: readonly HeaderNavItem[] = [
    { label: 'Primitives', href: '#primitives' },
    { label: 'Examples', href: '#examples' },
    { label: 'Docs', href: '#docs' },
  ];
}

import { Component } from '@angular/core';
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmNavigationMenuImports } from '@duxkit/ui/helm/navigation-menu';

interface HeaderNavItem {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-header',
  imports: [HlmButton, HlmNavigationMenuImports],
  template: `
    <header class="site-header w-full flex justify-center p-2" aria-label="Site header">
      <div class="flex gap-7 items-center w-full max-w-6xl mx-auto justify-center">
        <a class="brand" href="/" aria-label="DuxKit AI home">
          <span class="brand-mark" aria-hidden="true">ng</span>
          <span class="brand-name">DuxKit AI</span>
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

        <div class="nav-actions" aria-label="Account actions">
          <a class="nav-link" href="#github">GitHub</a>
          <a hlmBtn class="nav-button" href="#docs" size="sm" variant="outline">Docs</a>
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

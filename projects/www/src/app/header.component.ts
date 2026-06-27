import { Component } from '@angular/core';
import { HlmNavigationMenuImports } from '@duxkit/ui/helm/navigation-menu';

interface HeaderNavItem {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-header',
  imports: [HlmNavigationMenuImports],
  template: `
    <header class="site-header w-full flex justify-center p-2" aria-label="Site header">
      <div class="flex gap-7 items-center w-full max-w-6xl mx-auto justify-between">
        <a class="brand" href="/" aria-label="Duxkit UI home">
          <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path
              d="M31.77 5.67c4.76 0 8.52 2.31 11.14 6.89l16.84 29.15c2.56 4.42 1.86 8.62-.07 11.63-1.92 3-5.31 4.99-9.83 4.99H37.84c-.91-7.24-3.52-12.67-6.24-17.03-1.58-2.53-1.88-5.11-.78-7.21 1.11-2.12 3.42-3.4 6.03-3.11 2.89.32 5.58 2.03 8.61 4.23 1.8 1.3 3.69 2.63 5.86 3.56 2.47 1.07 4.64 1.35 6.04.81 1.52-.58 1.84-1.88.56-2.35-8.67-3.17-12.4-11.48-16.15-18.39-2.16-3.98-4.6-8.61-9.99-8.61-5.26 0-7.8 4.48-10.34 8.94L4.29 49.38c-1.5 2.62-.8 8.95 7.73 8.95h9.72c3.5-2.29 5.28-4.37 5.9-7.31.47-2.21.06-4.54-.92-6.81-2.68-6.2-3.35-12.64.3-18.39 2.9-4.56 7.7-6.88 13.13-6.08-2.7-4.68-4.73-8.01-8.38-8.01-3.38 0-5.39 3.18-7.43 6.75L8.16 46.56c-2.32 4.03-1.42 7.28.67 8.97-2.56-.77-4.58-2.43-5.62-4.72-1.28-2.82-.91-6.19 1.12-9.73L20.7 12.66c2.6-4.53 6.39-6.99 11.07-6.99Z"
            />
          </svg>
          <span class="brand-name">Duxkit UI</span>
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

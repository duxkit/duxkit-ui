import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmButton } from '@duxkit-private/ui/helm/button';
import { HlmIcon } from '@duxkit-private/ui/helm/icon';
import { footerLinkGroups } from './footer-link-groups';

type ThemeMode = 'light' | 'dark';

const themeStorageKey = 'duxkit-ui-theme';

@Component({
  imports: [HlmButton, HlmIcon, NgIcon, RouterLink],
  providers: [provideIcons({ lucideMoon, lucideSun })],
  selector: 'app-footer',
  template: `
    <footer class="site-footer">
      <div class="site-footer-container">
        <section class="site-footer-cta" aria-labelledby="site-footer-title">
          <h2 id="site-footer-title">AI interfaces, built for Angular.</h2>

          <a hlmBtn class="site-footer-button" routerLink="/components"> Explore components </a>
        </section>

        <nav class="site-footer-nav" aria-label="Footer navigation">
          <div class="site-footer-brand">
            <h2>Duxkit UI</h2>
            <p>UI pieces for AI SDK chat, tools, approvals, files, and generated output.</p>
          </div>

          @for (group of footerLinkGroups; track group.title) {
            <section class="site-footer-group" [attr.aria-labelledby]="'footer-' + group.title">
              <h3 [id]="'footer-' + group.title">{{ group.title }}</h3>

              <ul>
                @for (link of group.links; track link.title) {
                  <li>
                    <a [routerLink]="link.route">{{ link.title }}</a>
                  </li>
                }
              </ul>
            </section>
          }
        </nav>

        <div class="site-footer-legal">
          <p>&copy; {{ currentYear }} Duxkit UI. All rights reserved.</p>

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
    </footer>
  `,
  styles: `
    :host {
      display: block;
    }

    .site-footer {
      border-top: 1px solid var(--border);
      background: var(--background);
      color: var(--foreground);
    }

    .site-footer-container {
      width: min(100% - 48px, 1024px);
      margin: 0 auto;
    }

    .site-footer-cta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      border-bottom: 1px solid var(--border);
      padding: clamp(48px, 7vw, 82px) 0;
    }

    .site-footer-cta h2 {
      max-width: 780px;
      margin: 0;
      font-size: clamp(2.5rem, 7vw, 5rem);
      line-height: 1.02;
      font-weight: 600;
      letter-spacing: 0;
    }

    .site-footer-button {
      min-height: 40px;
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      padding: 0 18px;
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: 14px;
      font-weight: 560;
      text-decoration: none;
      outline-offset: 3px;
    }

    .site-footer-button:focus-visible,
    .site-footer a:focus-visible {
      outline: 2px solid #0069ff;
    }

    .site-footer-nav {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) repeat(4, minmax(0, 1fr));
      gap: clamp(24px, 4vw, 44px);
      padding: 34px 0 44px;
    }

    .site-footer-brand,
    .site-footer-group {
      min-width: 0;
    }

    .site-footer-brand h2,
    .site-footer-group h3 {
      margin: 0;
      color: var(--foreground);
      font-size: 14px;
      line-height: 1.4;
      font-weight: 650;
      letter-spacing: 0;
    }

    .site-footer-brand p {
      max-width: 250px;
      margin: 10px 0 0;
      color: var(--muted-foreground);
      font-size: 14px;
      line-height: 1.55;
    }

    .site-footer-group ul {
      display: grid;
      gap: 8px;
      margin: 10px 0 0;
      padding: 0;
      list-style: none;
    }

    .site-footer-group a {
      color: var(--muted-foreground);
      font-size: 14px;
      line-height: 1.45;
      text-decoration: none;
      outline-offset: 3px;
      transition: color 150ms ease;
    }

    .site-footer-group a:hover,
    .site-footer-group a:focus-visible {
      color: var(--foreground);
    }

    .site-footer-legal {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      border-top: 1px solid var(--border);
      padding: 20px 0 24px;
    }

    .site-footer-legal p {
      margin: 0;
      color: var(--muted-foreground);
      font-size: 13px;
      line-height: 1.5;
    }

    @media (max-width: 860px) {
      .site-footer-nav {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .site-footer-brand {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 640px) {
      .site-footer-container {
        width: min(100% - 32px, 1024px);
      }

      .site-footer-cta {
        align-items: flex-start;
        flex-direction: column;
        gap: 22px;
      }

      .site-footer-nav {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class FooterComponent {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly footerLinkGroups = footerLinkGroups;
  protected readonly currentYear = new Date().getFullYear();
  protected readonly theme = signal<ThemeMode>(this.readInitialTheme());
  protected readonly themeIcon = computed(() =>
    this.theme() === 'dark' ? 'lucideSun' : 'lucideMoon',
  );
  protected readonly themeToggleLabel = computed(() =>
    this.theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );

  constructor() {
    if (this.isBrowser) {
      this.applyTheme(this.theme());
    }
  }

  protected toggleTheme(): void {
    const nextTheme = this.theme() === 'dark' ? 'light' : 'dark';

    this.theme.set(nextTheme);
    this.applyTheme(nextTheme);
    this.storeTheme(nextTheme);
  }

  private readInitialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

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
    if (!this.isBrowser) {
      return;
    }

    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
  }
}

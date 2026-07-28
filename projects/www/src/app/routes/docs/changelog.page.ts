import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { HlmAccordionImports } from '@duxkit-private/ui/helm/accordion';
import { SeoService } from '../../shared/seo/seo.service';
import {
  DocsTableOfContents,
  type DocsTableOfContentsSelection,
} from './components/docs-table-of-contents.component';
import { changelogBundleId, changelogBundles, changelogTableOfContents } from './data/changelog';

@Component({
  imports: [DocsTableOfContents, HlmAccordionImports],
  template: `
    <div class="changelog-layout">
      <section class="changelog-page" aria-labelledby="changelog-title">
        <header class="changelog-hero border-b border-border">
          <h1 id="changelog-title" class="text-foreground">Changelog</h1>
        </header>

        <div hlmAccordion class="changelog-bundles" type="single">
          @for (bundle of changelogBundles; track bundle.version) {
            <div
              hlmAccordionItem
              class="changelog-bundle"
              [id]="bundleId(bundle.version)"
              [isOpened]="openBundle() === bundle.version"
              (openedChange)="setBundleOpen(bundle.version, $event)"
            >
              <hlm-accordion-trigger triggerClass="items-center">
                <span class="changelog-entry-heading">
                  <span class="changelog-version text-foreground">{{ bundle.version }}</span>
                  <time
                    class="changelog-date text-muted-foreground"
                    [attr.datetime]="bundle.dateTime"
                  >
                    {{ bundle.date }}
                  </time>
                </span>
              </hlm-accordion-trigger>

              <hlm-accordion-content>
                <div class="changelog-groups">
                  @for (group of bundle.groups; track group.title) {
                    @if (group.changes.length > 0) {
                      <section
                        class="changelog-group"
                        [attr.aria-labelledby]="bundle.version + group.title"
                      >
                        <h4 [id]="bundle.version + group.title" class="text-foreground">
                          {{ group.title }}
                        </h4>

                        <ul class="text-muted-foreground">
                          @for (change of group.changes; track change) {
                            <li>{{ change }}</li>
                          }
                        </ul>
                      </section>
                    }
                  }
                </div>
              </hlm-accordion-content>
            </div>
          }
        </div>
      </section>

      <app-docs-table-of-contents
        [items]="changelogTableOfContents"
        (itemSelected)="openFromTableOfContents($event)"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .changelog-layout {
      width: 100%;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 300px;
      align-items: start;
      gap: clamp(40px, 5vw, 72px);
    }

    .changelog-page {
      width: min(100%, 820px);
      min-width: 0;
      display: grid;
      justify-self: center;
    }

    .changelog-hero {
      padding-bottom: 30px;
    }

    h1,
    h4,
    p,
    ul {
      margin: 0;
    }

    h1 {
      font-size: clamp(2.125rem, 3.6vw, 3rem);
      line-height: 1.08;
      font-weight: 400;
    }

    .changelog-version {
      font-size: 20px;
      line-height: 1.3;
      font-weight: 500;
    }

    .changelog-entry-heading {
      min-width: 0;
      display: flex;
      flex: 1;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      padding-right: 12px;
    }

    .changelog-date {
      font-size: 13px;
      line-height: 1.4;
      font-weight: 450;
    }

    .changelog-bundles {
      border-bottom: 1px solid var(--border);
    }

    .changelog-bundle {
      scroll-margin-top: 104px;
    }

    .changelog-groups {
      display: grid;
      gap: 0;
      border-top: 1px solid var(--border);
    }

    .changelog-group {
      display: grid;
      grid-template-columns: minmax(72px, 120px) minmax(0, 1fr);
      gap: 24px;
      padding: 22px 0;
      border-bottom: 1px solid var(--border);
    }

    h4 {
      font-size: 13px;
      line-height: 1.6;
      font-weight: 700;
      letter-spacing: 0.06em;
    }

    ul {
      display: grid;
      gap: 8px;
      padding-left: 18px;
      font-size: 15px;
      line-height: 1.6;
    }

    @media (max-width: 1500px) {
      .changelog-layout {
        grid-template-columns: minmax(0, 1fr);
      }

      .changelog-page {
        grid-column: 1;
        margin: 0 auto;
      }
    }

    @media (max-width: 560px) {
      .changelog-group {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `,
})
export class ChangelogPage {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly seo = inject(SeoService);

  protected readonly changelogBundles = changelogBundles;
  protected readonly changelogTableOfContents = changelogTableOfContents;
  protected readonly openBundle = signal<string>(changelogBundles[0]?.version ?? '');
  protected readonly bundleId = changelogBundleId;

  constructor() {
    this.seo.setPath('/docs/changelog');
  }

  protected setBundleOpen(version: string, isOpened: boolean): void {
    if (isOpened) {
      this.openBundle.set(version);
    } else if (this.openBundle() === version) {
      this.openBundle.set('');
    }
  }

  protected openFromTableOfContents(selection: DocsTableOfContentsSelection): void {
    const bundle = changelogBundles.find(
      (candidate) => changelogBundleId(candidate.version) === selection.id,
    );

    if (!bundle) {
      return;
    }

    selection.event.preventDefault();
    this.openBundle.set(bundle.version);

    if (!this.isBrowser) {
      return;
    }

    this.document.defaultView?.setTimeout(() => {
      const target = this.document.getElementById(selection.id);

      if (!target) {
        return;
      }

      this.document.defaultView?.history.replaceState(null, '', `#${selection.id}`);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }
}

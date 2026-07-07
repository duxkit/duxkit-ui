import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  absoluteUrl,
  defaultOgImageAlt,
  defaultOgImageHeight,
  defaultOgImagePath,
  defaultOgImageWidth,
  getSeoPage,
  type SeoPage,
  siteName,
} from './seo';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setPath(path: string): void {
    this.setPage(getSeoPage(path));
  }

  setPage(page: SeoPage): void {
    this.title.setTitle(page.title);
    this.setMetaTag('name', 'description', page.description);
    this.setMetaTag('name', 'robots', page.robots ?? 'index,follow');
    this.setMetaTag('property', 'og:type', 'website');
    this.setMetaTag('property', 'og:site_name', siteName);
    this.setMetaTag('property', 'og:title', page.title);
    this.setMetaTag('property', 'og:description', page.description);
    this.setMetaTag('property', 'og:url', page.canonicalUrl);
    this.setMetaTag('property', 'og:image', absoluteUrl(defaultOgImagePath));
    this.setMetaTag('property', 'og:image:width', String(defaultOgImageWidth));
    this.setMetaTag('property', 'og:image:height', String(defaultOgImageHeight));
    this.setMetaTag('property', 'og:image:alt', defaultOgImageAlt);
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', page.title);
    this.setMetaTag('name', 'twitter:description', page.description);
    this.setMetaTag('name', 'twitter:image', absoluteUrl(defaultOgImagePath));
    this.setMetaTag('name', 'twitter:image:alt', defaultOgImageAlt);
    this.setCanonical(page.canonicalUrl);
    this.setJsonLd(page.jsonLd);
  }

  private setMetaTag(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}="${key}"`);
  }

  private setCanonical(href: string): void {
    let canonical = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }

    canonical.href = href;
  }

  private setJsonLd(items: readonly Record<string, unknown>[]): void {
    for (const existing of Array.from(
      this.document.querySelectorAll('script[data-seo-json-ld="true"]'),
    )) {
      existing.remove();
    }

    for (const item of items) {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-json-ld', 'true');
      script.text = JSON.stringify(item);
      this.document.head.appendChild(script);
    }
  }
}

import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@duxkit/ui/helm/button';
import { SeoService } from '../seo.service';

@Component({
  imports: [HlmButton, NgOptimizedImage, RouterLink],
  template: `
    <section class="min-h-[calc(100dvh-65px)] overflow-hidden px-6 py-10">
      <div class="mx-auto flex min-h-[calc(100dvh-145px)] w-full max-w-xl flex-col justify-center">
        <div class="mb-4 flex items-center justify-between gap-6">
          <p class="text-muted-foreground text-sm font-medium tracking-[0.28em] uppercase">
            Page not found
          </p>

          <img
            class="not-found-logomark h-10 w-14 sm:h-14 sm:w-20"
            ngSrc="dux_logomark.png"
            width="512"
            height="352"
            alt="Duxkit"
            priority
          />
        </div>

        <h1
          class="text-foreground text-[clamp(7rem,28vw,20rem)] leading-none font-semibold tracking-normal"
        >
          404
        </h1>

        <p class="mt-6 max-w-xl text-muted-foreground text-lg leading-8">
          The page you are looking for does not exist or has flown away.
        </p>

        <a hlmBtn class="mt-9 w-fit" routerLink="/"> Back home </a>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .not-found-logomark {
      display: block;
      flex: 0 0 auto;
      object-fit: contain;
    }

    :host-context(html[data-theme='dark']) .not-found-logomark {
      filter: invert(1);
    }
  `,
})
export class NotFoundPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.setPath('/not-found');
  }
}

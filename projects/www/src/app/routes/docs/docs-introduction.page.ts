import { Component, inject } from '@angular/core';
import {
  HlmAccordion,
  HlmAccordionContent,
  HlmAccordionItem,
  HlmAccordionTrigger,
} from '../../../../../ui/helm/accordion/src/index';
import { SeoService } from '../../shared/seo/seo.service';

const faqs = [
  {
    question: 'What is Duxkit AI?',
    answer:
      'Duxkit AI is an Angular UI library for the parts of AI apps users actually see: chat, tool calls, reasoning, approvals, files, and generated output.',
  },
  {
    question: 'Is it a full chatbot app?',
    answer:
      'No. It gives you UI pieces and composition patterns, not a hosted product, backend, or finished app shell.',
  },
  {
    question: 'Do I need the AI SDK?',
    answer:
      'The components map cleanly to AI SDK-style state, but you still own the provider integration, persistence, and application logic.',
  },
  {
    question: 'Is Duxkit inspired by Vercel AI Elements?',
    answer:
      'Yes. It brings that primitive-first model to Angular, with APIs shaped for teams building their own product UI.',
  },
  {
    question: 'How does styling work?',
    answer:
      'Use the provided Helm styling as a baseline, then layer your own classes and product system on top.',
  },
] as const;

@Component({
  imports: [HlmAccordion, HlmAccordionContent, HlmAccordionItem, HlmAccordionTrigger],
  template: `
    <section class="docs-introduction-page container" aria-labelledby="docs-introduction-title">
      <header class="docs-introduction-hero">
        <h1 id="docs-introduction-title" class="text-foreground">Duxkit AI</h1>
        <p class="text-muted-foreground">
          Angular UI primitives for AI chat and agent screens. Build the product experience you need
          without starting from a boxed-in chatbot shell.
        </p>
      </header>

      <section class="docs-introduction-section" aria-labelledby="docs-how-it-works">
        <div class="docs-section-copy">
          <h2 id="docs-how-it-works" class="text-foreground">How it works</h2>
          <p class="text-muted-foreground">
            You compose the pieces instead of installing a finished chat application. The library
            covers the common UI jobs in AI products: conversations, messages, reasoning, tools,
            confirmations, prompt input, attachments, and sources.
          </p>
          <p class="text-muted-foreground">
            You bring the model provider, state, storage, and business rules. Duxkit AI stays in the
            UI layer, so the components can fit into your Angular app instead of taking it over.
          </p>
        </div>
      </section>

      <section class="docs-introduction-section" aria-labelledby="docs-faq">
        <div class="docs-section-copy">
          <h2 id="docs-faq" class="text-foreground">FAQ</h2>
        </div>

        <div hlmAccordion class="docs-faq" type="single">
          @for (faq of faqs; track faq.question) {
            <div hlmAccordionItem [isOpened]="false">
              <hlm-accordion-trigger>{{ faq.question }}</hlm-accordion-trigger>
              <hlm-accordion-content>
                <p class="text-muted-foreground">{{ faq.answer }}</p>
              </hlm-accordion-content>
            </div>
          }
        </div>
      </section>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .docs-introduction-page {
      width: min(100%, 880px);
      display: grid;
      gap: 40px;
    }

    .docs-introduction-hero,
    .docs-introduction-section,
    .docs-section-copy {
      display: grid;
      gap: 12px;
    }

    .docs-kicker {
      margin: 0;
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(2.125rem, 3.6vw, 3rem);
      line-height: 1.08;
      font-weight: 400;
    }

    h2 {
      font-size: 22px;
      line-height: 1.25;
      font-weight: 500;
    }

    p {
      max-width: 720px;
      font-size: 17px;
      line-height: 1.6;
    }

    .docs-faq {
      border-top: 1px solid color-mix(in oklab, currentColor 10%, transparent);
    }

    .docs-faq p {
      padding: 0 0 20px;
      font-size: 15px;
      line-height: 1.6;
    }
  `,
})
export class DocsIntroductionPage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.setPath('/docs');
  }

  protected readonly faqs = faqs;
}

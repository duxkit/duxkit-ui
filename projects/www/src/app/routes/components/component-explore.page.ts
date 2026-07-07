import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { componentDocs } from '../docs/data/component-docs.registry';
import { componentHref } from '../docs/data/docs-navigation';
import { SeoService } from '../../shared/seo/seo.service';

@Component({
  imports: [RouterLink],
  template: `
    <section class="explore-page" aria-labelledby="components-title">
      <header class="explore-header">
        <h1 id="components-title" class="text-foreground">Explore components</h1>
        <p class="text-muted-foreground">
          The UI pieces you need around an AI SDK stream: messages, prompt input, tool calls,
          approvals, sources, files, and generated output.
        </p>
      </header>

      @for (group of componentGroups; track group.title) {
        <section class="component-group" [attr.aria-labelledby]="group.headingId">
          <div class="component-group-heading">
            <h2 [id]="group.headingId" class="text-foreground">{{ group.title }}</h2>
            <p class="text-muted-foreground">{{ group.description }}</p>
          </div>

          <div class="component-grid">
            @for (item of group.items; track item.slug) {
              <a
                class="component-card border border-border bg-card text-card-foreground hover:bg-muted/30"
                [routerLink]="componentHref(item.slug)"
                [attr.aria-label]="'Open ' + item.title + ' component docs'"
              >
                <span class="component-card-copy">
                  <span class="component-card-title text-foreground">{{ item.title }}</span>
                  <span class="component-card-description text-muted-foreground">
                    {{ item.description }}
                  </span>
                </span>

                <span class="component-card-preview" aria-hidden="true">
                  <span class="preview-window border border-border bg-background">
                    @switch (item.slug) {
                      @case ('conversation') {
                        <span class="preview-line tone-dark w-45 align-end"></span>
                        <span class="preview-line tone-soft w-80"></span>
                        <span class="preview-line tone-dark w-36 align-end"></span>
                        <span class="preview-line w-70"></span>
                        <span class="preview-line w-52"></span>
                      }

                      @case ('message') {
                        <span class="preview-pair">
                          <span class="preview-stack">
                            <span class="preview-line w-90"></span>
                            <span class="preview-line w-72"></span>
                            <span class="preview-line w-52"></span>
                          </span>
                        </span>
                        <span class="preview-row">
                          <span class="preview-chip"></span>
                          <span class="preview-chip"></span>
                        </span>
                      }

                      @case ('chain-of-thought') {
                        <span class="preview-step">
                          <span></span>
                          <span class="preview-line w-70"></span>
                        </span>
                        <span class="preview-step tone-blue">
                          <span></span>
                          <span class="preview-line w-82"></span>
                        </span>
                        <span class="preview-step">
                          <span></span>
                          <span class="preview-line w-58"></span>
                        </span>
                      }

                      @case ('task') {
                        <span class="preview-line tone-dark w-52"></span>
                        <span class="preview-pair">
                          <span class="preview-dot"></span>
                          <span class="preview-block w-90"></span>
                        </span>
                        <span class="preview-pair">
                          <span class="preview-dot"></span>
                          <span class="preview-block w-75"></span>
                        </span>
                      }

                      @case ('tool') {
                        <span class="preview-row spread">
                          <span class="preview-line tone-dark w-45"></span>
                          <span class="preview-line tone-success w-24"></span>
                        </span>
                        <span class="preview-line w-82"></span>
                        <span class="preview-line w-58"></span>
                        <span class="preview-block w-36"></span>
                      }

                      @case ('reasoning') {
                        <span class="preview-row spread">
                          <span class="preview-line tone-dark w-52"></span>
                          <span class="preview-ring"></span>
                        </span>
                        <span class="preview-line w-88"></span>
                        <span class="preview-line w-78"></span>
                        <span class="preview-line w-52"></span>
                      }

                      @case ('confirmation') {
                        <span class="preview-dialog">
                          <span class="preview-line tone-dark w-55"></span>
                          <span class="preview-line w-88"></span>
                          <span class="preview-row align-end">
                            <span class="preview-button"></span>
                            <span class="preview-button tone-dark"></span>
                          </span>
                        </span>
                      }

                      @case ('code-block') {
                        <span class="preview-code">
                          <span class="preview-code-row">
                            <span class="preview-gutter"></span>
                            <span class="preview-token token-blue w-24"></span>
                            <span class="preview-token w-45"></span>
                          </span>
                          <span class="preview-code-row">
                            <span class="preview-gutter"></span>
                            <span class="preview-token token-pink w-24"></span>
                            <span class="preview-token w-52"></span>
                          </span>
                          <span class="preview-code-row">
                            <span class="preview-gutter"></span>
                            <span class="preview-token token-green w-70"></span>
                          </span>
                        </span>
                      }
                    }
                  </span>
                </span>
              </a>
            }
          </div>
        </section>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .explore-page {
      width: min(100%, 1120px);
      display: grid;
      gap: 42px;
      margin: 0 auto;
      padding: 4px 0 80px;
    }

    .explore-header {
      display: grid;
      gap: 12px;
      max-width: 760px;
    }

    .explore-header h1 {
      margin: 0;
      font-size: clamp(2.125rem, 3.6vw, 3rem);
      line-height: 1.08;
      font-weight: 400;
      letter-spacing: 0;
    }

    .explore-header p,
    .component-group-heading p {
      margin: 0;
      font-size: 17px;
      line-height: 1.6;
    }

    .component-group {
      display: grid;
      gap: 20px;
    }

    .component-group-heading {
      display: grid;
      gap: 6px;
      max-width: 720px;
    }

    .component-group-heading h2 {
      margin: 0;
      font-size: 24px;
      line-height: 1.25;
      font-weight: 500;
      letter-spacing: 0;
    }

    .component-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 26px;
    }

    .component-card {
      position: relative;
      min-height: 224px;
      overflow: hidden;
      display: block;
      border-radius: 8px;
      text-decoration: none;
      outline-offset: 4px;
      transition:
        border-color 150ms ease,
        transform 150ms ease,
        background-color 150ms ease;
    }

    .component-card:hover {
      transform: translateY(-2px);
    }

    .component-card:focus-visible {
      outline: 2px solid #0069ff;
    }

    .component-card-copy {
      position: relative;
      z-index: 1;
      display: grid;
      gap: 6px;
      padding: 24px 24px 0;
    }

    .component-card-title {
      font-size: 20px;
      line-height: 1.25;
      font-weight: 650;
      letter-spacing: 0;
    }

    .component-card-description {
      display: -webkit-box;
      overflow: hidden;
      font-size: 16px;
      line-height: 1.45;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .component-card-preview {
      position: absolute;
      right: -30px;
      bottom: -24px;
      left: 54px;
      height: 116px;
      transform: rotate(-3deg);
      transform-origin: 100% 100%;
    }

    .preview-window {
      width: 100%;
      height: 100%;
      display: grid;
      align-content: start;
      gap: 9px;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 18px 48px rgb(24 24 27 / 0.08);
    }

    .preview-row,
    .preview-pair,
    .preview-step {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-row.spread {
      justify-content: space-between;
    }

    .preview-row.align-end,
    .align-end {
      justify-self: end;
    }

    .preview-row.indent {
      padding-left: 28px;
    }

    .preview-stack {
      flex: 1;
      display: grid;
      gap: 7px;
    }

    .preview-line,
    .preview-block,
    .preview-chip,
    .preview-button,
    .preview-dot,
    .preview-step > span:first-child {
      display: block;
      flex: 0 0 auto;
      border-radius: 999px;
      background: #d4d4d8;
    }

    .preview-line {
      height: 8px;
    }

    .preview-block {
      height: 22px;
      border-radius: 6px;
    }

    .preview-chip,
    .preview-button {
      width: 42px;
      height: 22px;
      border-radius: 6px;
      background: #f4f4f5;
    }

    .preview-dot,
    .preview-step > span:first-child {
      width: 10px;
      height: 10px;
    }

    .preview-step > span:first-child {
      border: 2px solid #d4d4d8;
      background: #ffffff;
    }

    .tone-dark,
    .preview-dot.tone-dark {
      background: #09090b;
    }

    .tone-soft {
      background: #e4e4e7;
    }

    .tone-success,
    .preview-step.tone-success > span:first-child {
      border-color: #16a34a;
      background: #16a34a;
    }

    .tone-blue,
    .preview-step.tone-blue > span:first-child {
      border-color: #0069ff;
    }

    .preview-ring {
      width: 18px;
      height: 18px;
      border: 1px solid #d4d4d8;
      border-radius: 999px;
    }

    .preview-dialog {
      display: grid;
      gap: 10px;
      margin: 4px 16px 0 0;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 13px;
      background: #ffffff;
    }

    .preview-code {
      display: grid;
      gap: 8px;
      overflow: hidden;
    }

    .preview-code-row {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .preview-gutter,
    .preview-token {
      display: block;
      height: 8px;
      border-radius: 999px;
      background: #d4d4d8;
    }

    .preview-gutter {
      width: 14px;
      background: #e4e4e7;
    }

    .token-blue {
      background: #0069ff;
    }

    .token-pink {
      background: #c026d3;
    }

    .token-green {
      background: #15803d;
    }

    .w-24 {
      width: 24%;
    }

    .w-36 {
      width: 36%;
    }

    .w-45 {
      width: 45%;
    }

    .w-52 {
      width: 52%;
    }

    .w-55 {
      width: 55%;
    }

    .w-58 {
      width: 58%;
    }

    .w-70 {
      width: 70%;
    }

    .w-72 {
      width: 72%;
    }

    .w-75 {
      width: 75%;
    }

    .w-78 {
      width: 78%;
    }

    .w-80 {
      width: 80%;
    }

    .w-82 {
      width: 82%;
    }

    .w-88 {
      width: 88%;
    }

    .w-90 {
      width: 90%;
    }

    @media (max-width: 1180px) {
      .component-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .explore-page {
        gap: 34px;
      }

      .component-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class ComponentExplorePage {
  private readonly seo = inject(SeoService);

  constructor() {
    this.seo.setPath('/components');
  }

  protected readonly componentHref = componentHref;
  protected readonly componentGroups = [
    {
      title: 'Components',
      headingId: 'chatbot-components',
      description: 'Start with the parts your screen needs, then compose them into your own flow.',
      items: componentDocs,
    },
  ] as const;
}

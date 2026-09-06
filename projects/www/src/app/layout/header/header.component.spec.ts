import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const headerSource = readFileSync('projects/www/src/app/layout/header/header.component.ts', 'utf8');
const stylesSource = readFileSync('projects/www/src/styles.scss', 'utf8');

function mobileBreakpointBlock(): string {
  const start = stylesSource.indexOf('@media (max-width: 960px)');

  expect(start).toBeGreaterThanOrEqual(0);

  let depth = 0;
  let blockStart = -1;

  for (let index = start; index < stylesSource.length; index++) {
    const char = stylesSource[index];

    if (char === '{') {
      depth++;
      blockStart = blockStart === -1 ? index : blockStart;
    } else if (char === '}') {
      depth--;

      if (depth === 0 && blockStart !== -1) {
        return stylesSource.slice(blockStart + 1, index);
      }
    }
  }

  throw new Error('Could not find the mobile breakpoint block.');
}

describe('HeaderComponent mobile navigation', () => {
  it('projects drawer content through the Spartan drawer portal', () => {
    expect(headerSource).toContain('<hlm-drawer direction="left" class="mobile-only">');
    expect(headerSource).toContain(
      '<hlm-drawer-content *hlmDrawerPortal class="mobile-nav-drawer">',
    );
    expect(headerSource).not.toContain(
      'direction="left"\n                aria-label="Open navigation menu"',
    );
  });

  it('uses branded drawer chrome instead of generic instructional copy', () => {
    expect(headerSource).toContain('<div class="mobile-nav-brand">');
    expect(headerSource).toContain('class="mobile-nav-brand-badge"');
    expect(headerSource).toContain('aria-label="Close navigation menu"');
    expect(headerSource).not.toContain('>Sections<');
    expect(headerSource).not.toContain('Switch sections and move through the current area.');
  });

  it('hides desktop navigation and search at the mobile breakpoint', () => {
    const mobileStyles = mobileBreakpointBlock();

    expect(mobileStyles).toMatch(
      /\.site-section-nav\[hlmNavigationMenu\]\.desktop-only\s*{[^}]*display:\s*none;/s,
    );
    expect(mobileStyles).toMatch(
      /\.mobile-only,\s*\.mobile-nav-trigger\s*{[^}]*display:\s*inline-flex;/s,
    );
    expect(mobileStyles).toMatch(/\.search-trigger\s*{[^}]*display:\s*none;/s);
  });

  it('uses docs-style mobile nav rows instead of card links', () => {
    expect(stylesSource).toMatch(/\.mobile-nav-link\s*{[^}]*border:\s*0;/s);
    expect(stylesSource).toMatch(/\.mobile-nav-link\s*{[^}]*border-radius:\s*0;/s);
    expect(stylesSource).toMatch(/\.mobile-nav-link\s*{[^}]*background:\s*transparent;/s);
    expect(stylesSource).toMatch(
      /\.mobile-nav-link-active\s*{[^}]*box-shadow:\s*inset 3px 0 0 #09090b;/s,
    );
  });
});

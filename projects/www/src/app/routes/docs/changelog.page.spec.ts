import { describe, expect, it } from 'vitest';
import { changelogBundleId, changelogBundles, changelogTableOfContents } from './data/changelog';

describe('changelog page', () => {
  it('lists the newest bundle first and only includes affected product areas', () => {
    expect(changelogBundles.map((bundle) => bundle.version)).toEqual(['v0.4.1', 'v0.4']);
    expect(changelogBundles[0]).toMatchObject({
      date: '28 July 2026',
      dateTime: '2026-07-28',
    });
    expect(changelogBundles[1]).toMatchObject({
      date: '26 July 2026',
      dateTime: '2026-07-26',
    });
    expect(changelogBundles.map((bundle) => bundle.groups.map((group) => group.title))).toEqual([
      ['WWW'],
      ['WWW', 'CLI', 'UI'],
    ]);
  });

  it('records the current bundle changes by product area', () => {
    expect(changelogBundles[0].groups[0].changes).toEqual([
      'GitHub repository link and footer theme control',
    ]);
  });

  it('preserves the released v0.4 bundle', () => {
    expect(changelogBundles[1].groups[0].changes).toEqual([
      'Changelog page and docs navigation',
      'Bundled changelog workflow',
      'CLI command reference page',
    ]);
    expect(changelogBundles[1].groups[1].changes).toEqual([
      'Deterministic primitive template synchronization',
    ]);
    expect(changelogBundles[1].groups[2].changes).toEqual([
      'Accessible fallback labels for untitled sources',
      'Opt-in context usage percentage',
      'Copy confirmation for message actions',
    ]);
  });

  it('builds stable table of contents anchors for each bundle', () => {
    expect(changelogBundleId('v0.4')).toBe('bundle-v0-4');
    expect(changelogBundleId('v0.4.1')).toBe('bundle-v0-4-1');
    expect(changelogTableOfContents).toEqual([
      { id: 'bundle-v0-4-1', label: 'v0.4.1' },
      { id: 'bundle-v0-4', label: 'v0.4' },
    ]);
  });
});

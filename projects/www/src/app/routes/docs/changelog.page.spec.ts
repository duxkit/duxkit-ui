import { describe, expect, it } from 'vitest';
import { changelogBundleId, changelogBundles, changelogTableOfContents } from './data/changelog';

describe('changelog page', () => {
  it('starts at v0.4 and groups every bundle by product area', () => {
    expect(changelogBundles.map((bundle) => bundle.version)).toEqual(['v0.4']);
    expect(changelogBundles[0]).toMatchObject({
      date: '26 July 2026',
      dateTime: '2026-07-26',
    });
    expect(changelogBundles[0].groups.map((group) => group.title)).toEqual(['WWW', 'CLI', 'UI']);
  });

  it('records the current bundle changes by product area', () => {
    expect(changelogBundles[0].groups[0].changes).toEqual([
      'Changelog page and docs navigation',
      'Bundled changelog workflow',
      'CLI command reference page',
    ]);
    expect(changelogBundles[0].groups[1].changes).toEqual([
      'Deterministic primitive template synchronization',
    ]);
    expect(changelogBundles[0].groups[2].changes).toEqual([
      'Accessible fallback labels for untitled sources',
      'Opt-in context usage percentage',
      'Copy confirmation for message actions',
    ]);
  });

  it('builds stable table of contents anchors for each bundle', () => {
    expect(changelogBundleId('v0.4')).toBe('bundle-v0-4');
    expect(changelogTableOfContents).toEqual([{ id: 'bundle-v0-4', label: 'v0.4' }]);
  });
});

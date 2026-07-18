import { describe, expect, it } from 'vitest';
import { changelogBundleId, changelogBundles, changelogTableOfContents } from './data/changelog';

describe('changelog page', () => {
  it('starts at v0.4 and groups every bundle by product area', () => {
    expect(changelogBundles.map((bundle) => bundle.version)).toEqual(['v0.4']);
    expect(changelogBundles[0]).toMatchObject({
      date: '18 July 2026',
      dateTime: '2026-07-18',
    });
    expect(changelogBundles[0].groups.map((group) => group.title)).toEqual(['WWW', 'CLI', 'UI']);
  });

  it('records this work without adding earlier changes', () => {
    expect(changelogBundles[0].groups[0].changes).toEqual([
      'Changelog page and docs navigation',
      'Bundled changelog workflow',
    ]);
    expect(changelogBundles[0].groups[1].changes).toEqual([]);
    expect(changelogBundles[0].groups[2].changes).toEqual([]);
  });

  it('builds stable table of contents anchors for each bundle', () => {
    expect(changelogBundleId('v0.4')).toBe('bundle-v0-4');
    expect(changelogTableOfContents).toEqual([{ id: 'bundle-v0-4', label: 'v0.4' }]);
  });
});

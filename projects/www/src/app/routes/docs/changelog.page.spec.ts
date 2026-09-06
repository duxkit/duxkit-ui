import { describe, expect, it } from 'vitest';
import { changelogBundleId, changelogBundles, changelogTableOfContents } from './data/changelog';

describe('changelog page', () => {
  it('lists the newest bundle first and only includes affected product areas', () => {
    expect(changelogBundles.map((bundle) => bundle.version)).toEqual(['v0.4.2', 'v0.4.1', 'v0.4']);
    expect(changelogBundles[0]).toMatchObject({
      date: '6 September 2026',
      dateTime: '2026-09-06',
    });
    expect(changelogBundles[1]).toMatchObject({
      date: '28 July 2026',
      dateTime: '2026-07-28',
    });
    expect(changelogBundles[2]).toMatchObject({
      date: '26 July 2026',
      dateTime: '2026-07-26',
    });
    expect(changelogBundles.map((bundle) => bundle.groups.map((group) => group.title))).toEqual([
      ['WWW', 'CLI', 'UI'],
      ['WWW'],
      ['WWW', 'CLI', 'UI'],
    ]);
  });

  it('records the current bundle changes by product area', () => {
    expect(changelogBundles[0].groups[0].changes).toEqual([
      'New examples show how to customise components and update your existing code.',
      'Step-by-step migration guides help you update existing apps through breaking changes.',
      'Screen readers now associate each code tab with the correct example.',
      'Added a footer link to the Reasoning Effort docs.',
    ]);
    expect(changelogBundles[0].groups[1].changes).toEqual([
      'The CLI now installs the new component parts along with their required dependencies.',
    ]);
    expect(changelogBundles[0].groups[2].changes).toEqual([
      'Arrange code blocks, attachment previews and reasoning panels to fit your app.',
      'Keep prompt text and attachments in your app state, and choose when to clear them.',
      'Disabled and busy prompts now follow the same submission rules for Enter and the submit button.',
      'Turning off auto-scroll now keeps the chat in place as messages arrive.',
      'Thought panels now keep the initial open or closed state you choose.',
    ]);
  });

  it('preserves the released v0.4.1 bundle', () => {
    expect(changelogBundles[1]).toEqual({
      version: 'v0.4.1',
      date: '28 July 2026',
      dateTime: '2026-07-28',
      groups: [
        {
          title: 'WWW',
          changes: ['GitHub repository link and footer theme control'],
        },
      ],
    });
  });

  it('preserves the released v0.4 bundle', () => {
    expect(changelogBundles[2].groups[0].changes).toEqual([
      'Changelog page and docs navigation',
      'Bundled changelog workflow',
      'CLI command reference page',
    ]);
    expect(changelogBundles[2].groups[1].changes).toEqual([
      'Deterministic primitive template synchronization',
    ]);
    expect(changelogBundles[2].groups[2].changes).toEqual([
      'Accessible fallback labels for untitled sources',
      'Opt-in context usage percentage',
      'Copy confirmation for message actions',
    ]);
  });

  it('builds stable table of contents anchors for each bundle', () => {
    expect(changelogBundleId('v0.4')).toBe('bundle-v0-4');
    expect(changelogBundleId('v0.4.1')).toBe('bundle-v0-4-1');
    expect(changelogBundleId('v0.4.2')).toBe('bundle-v0-4-2');
    expect(changelogTableOfContents).toEqual([
      { id: 'bundle-v0-4-2', label: 'v0.4.2' },
      { id: 'bundle-v0-4-1', label: 'v0.4.1' },
      { id: 'bundle-v0-4', label: 'v0.4' },
    ]);
  });
});

export const changelogBundles = [
  {
    version: 'v0.4.2',
    date: '6 September 2026',
    dateTime: '2026-09-06',
    groups: [
      {
        title: 'WWW',
        changes: [
          'New examples show how to customise components and update your existing code.',
          'Step-by-step migration guides help you update existing apps through breaking changes.',
          'Screen readers now associate each code tab with the correct example.',
          'Added a footer link to the Reasoning Effort docs.',
        ],
      },
      {
        title: 'CLI',
        changes: [
          'The CLI now installs the new component parts along with their required dependencies.',
        ],
      },
      {
        title: 'UI',
        changes: [
          'Arrange code blocks, attachment previews and reasoning panels to fit your app.',
          'Keep prompt text and attachments in your app state, and choose when to clear them.',
          'Disabled and busy prompts now follow the same submission rules for Enter and the submit button.',
          'Turning off auto-scroll now keeps the chat in place as messages arrive.',
          'Thought panels now keep the initial open or closed state you choose.',
        ],
      },
    ],
  },
  {
    version: 'v0.4.1',
    date: '28 July 2026',
    dateTime: '2026-07-28',
    groups: [
      {
        title: 'WWW',
        changes: ['GitHub repository link and footer theme control'],
      },
    ],
  },
  {
    version: 'v0.4',
    date: '26 July 2026',
    dateTime: '2026-07-26',
    groups: [
      {
        title: 'WWW',
        changes: [
          'Changelog page and docs navigation',
          'Bundled changelog workflow',
          'CLI command reference page',
        ],
      },
      {
        title: 'CLI',
        changes: ['Deterministic primitive template synchronization'],
      },
      {
        title: 'UI',
        changes: [
          'Accessible fallback labels for untitled sources',
          'Opt-in context usage percentage',
          'Copy confirmation for message actions',
        ],
      },
    ],
  },
] as const;

export function changelogBundleId(version: string): string {
  return `bundle-${version.replaceAll('.', '-')}`;
}

export const changelogTableOfContents = changelogBundles.map((bundle) => ({
  id: changelogBundleId(bundle.version),
  label: bundle.version,
}));

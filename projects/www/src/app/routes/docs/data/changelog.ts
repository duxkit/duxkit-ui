export const changelogBundles = [
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

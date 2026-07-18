export const changelogBundles = [
  {
    version: 'v0.4',
    date: '18 July 2026',
    dateTime: '2026-07-18',
    groups: [
      {
        title: 'WWW',
        changes: ['Changelog page and docs navigation', 'Bundled changelog workflow'],
      },
      {
        title: 'CLI',
        changes: [],
      },
      {
        title: 'UI',
        changes: [],
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

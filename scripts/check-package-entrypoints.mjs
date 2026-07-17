import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceRoot = resolve('projects/duxkit-ai/src/lib');
const projectRoot = resolve('projects/duxkit-ai');
const packageRoot = resolve('dist/duxkit-ai');
const bundleRoot = resolve(packageRoot, 'fesm2022');
const failures = [];

const projectEntries = (await readdir(projectRoot, { withFileTypes: true })).filter((entry) =>
  entry.isDirectory(),
);
const primitives = (
  await Promise.all(
    projectEntries.map(async (entry) => {
      const ngPackage = await readFile(resolve(projectRoot, entry.name, 'ng-package.json'), 'utf8')
        .then(() => entry.name)
        .catch(() => undefined);
      return ngPackage;
    }),
  )
)
  .filter((name) => name !== undefined)
  .sort();
const packageJson = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const primary = await readFile(resolve(bundleRoot, 'duxkit-ai.mjs'), 'utf8');

if (/from\s+['"]@angular\//.test(primary) || primary.includes('ɵɵ')) {
  failures.push('Primary entrypoint contains Angular runtime code from a secondary entrypoint');
}

for (const primitive of primitives) {
  const exportName = `./${primitive}`;
  const bundleName = `duxkit-ai-${primitive}.mjs`;
  const bundlePath = resolve(bundleRoot, bundleName);
  const bundle = await readFile(bundlePath, 'utf8').catch(() => undefined);

  if (!packageJson.exports?.[exportName]) {
    failures.push(`Built package is missing the ${exportName} export`);
  }

  if (bundle === undefined) {
    failures.push(`Built package is missing ${bundleName}`);
    continue;
  }

  const sourceDirectory = resolve(sourceRoot, primitive);
  const sourceFiles =
    primitive === 'markdown'
      ? [resolve(sourceRoot, 'markdown.ts')]
      : (await readdir(sourceDirectory, { withFileTypes: true }))
          .filter(
            (entry) =>
              entry.isFile() &&
              entry.name.endsWith('.ts') &&
              !entry.name.endsWith('.spec.ts') &&
              !entry.name.endsWith('.stories.ts'),
          )
          .map((entry) => resolve(sourceDirectory, entry.name));
  const runtimeImports = new Set();

  for (const sourceFile of sourceFiles) {
    const source = await readFile(sourceFile, 'utf8');

    for (const match of source.matchAll(/from\s+['"](duxkit-ai\/[^'"]+)['"]/g)) {
      runtimeImports.add(match[1]);
    }
  }

  for (const packageImport of runtimeImports) {
    if (!bundle.includes(`'${packageImport}'`) && !bundle.includes(`"${packageImport}"`)) {
      failures.push(`${bundleName} does not externalize ${packageImport}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Package entrypoint identities OK (${primitives.length} secondary entrypoints)`);
}

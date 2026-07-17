import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

const helmRoot = join(root, 'projects/ui/helm');
const helmDirs = readdirSync(helmRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const tsconfig = JSON.parse(readFileSync(join(root, 'tsconfig.json'), 'utf8'));
const paths = tsconfig.compilerOptions?.paths ?? {};

for (const name of helmDirs) {
  const dir = join(helmRoot, name);
  for (const requiredFile of [
    'project.json',
    'tsconfig.json',
    'tsconfig.lib.json',
    'README.md',
    'src/index.ts',
  ]) {
    if (!existsSync(join(dir, requiredFile))) {
      fail(`projects/ui/helm/${name} is missing ${requiredFile}`);
    }
  }

  const alias = `@duxkit-private/ui/helm/${name}`;
  const expectedPath = `./projects/ui/helm/${name}/src/index.ts`;
  const actualPath = paths[alias]?.[0];
  if (actualPath !== expectedPath) {
    fail(`${alias} must point to ${expectedPath}`);
  }
}

const primitiveRoot = join(root, 'projects/duxkit-ai/src/lib');
const primitiveDirs = readdirSync(primitiveRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
for (const name of primitiveDirs) {
  const dir = join(primitiveRoot, name);
  if (!existsSync(join(dir, 'index.ts'))) {
    fail(`projects/duxkit-ai/src/lib/${name} is missing index.ts`);
  }
  if (!existsSync(join(root, `projects/duxkit-ai/${name}/ng-package.json`))) {
    fail(`projects/duxkit-ai/src/lib/${name} is missing its secondary entrypoint`);
  }
}

for (const name of primitiveDirs) {
  const dir = join(primitiveRoot, name);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      !entry.isFile() ||
      !entry.name.endsWith('.ts') ||
      entry.name.endsWith('.spec.ts') ||
      entry.name.endsWith('.stories.ts')
    ) {
      continue;
    }

    const source = readFileSync(join(dir, entry.name), 'utf8');
    if (/(?:from\s+|import\()\s*['"]\.\.\//.test(source)) {
      fail(
        `projects/duxkit-ai/src/lib/${name}/${entry.name} imports another primitive by a relative path`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.map((message) => `- ${message}`).join('\n'));
  process.exit(1);
}

console.log('Workspace conventions OK');

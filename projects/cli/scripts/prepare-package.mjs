import { chmod, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(projectRoot);
const workspaceRoot = dirname(dirname(packageRoot));
const outputRoot = join(workspaceRoot, 'dist/cli');

const sourcePackage = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
const outputPackage = {
  name: sourcePackage.name,
  version: sourcePackage.version,
  type: sourcePackage.type,
  bin: sourcePackage.bin,
  exports: sourcePackage.exports,
  dependencies: sourcePackage.dependencies,
  engines: sourcePackage.engines,
};

await mkdir(outputRoot, { recursive: true });
await writeFile(join(outputRoot, 'package.json'), `${JSON.stringify(outputPackage, null, 2)}\n`);
await copyFile(join(packageRoot, 'README.md'), join(outputRoot, 'README.md'));
await chmod(join(outputRoot, 'index.js'), 0o755);

import { chmod, copyFile, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  discoverPrimitiveCatalog,
  renderPrimitiveCatalog,
} from './lib/primitive-template-generator.mjs';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const packageRoot = dirname(projectRoot);
const workspaceRoot = dirname(dirname(packageRoot));
const outputRoot = join(workspaceRoot, 'dist/cli');

const sourcePackage = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
const outputPackage = {
  name: sourcePackage.name,
  version: sourcePackage.version,
  description: sourcePackage.description,
  license: sourcePackage.license,
  repository: sourcePackage.repository,
  publishConfig: sourcePackage.publishConfig,
  type: sourcePackage.type,
  bin: sourcePackage.bin,
  exports: sourcePackage.exports,
  files: sourcePackage.files,
  dependencies: sourcePackage.dependencies,
  engines: sourcePackage.engines,
};

await mkdir(outputRoot, { recursive: true });
await writeFile(join(outputRoot, 'package.json'), `${JSON.stringify(outputPackage, null, 2)}\n`);
await copyFile(join(packageRoot, 'README.md'), join(outputRoot, 'README.md'));
await copyFile(join(packageRoot, 'LICENSE'), join(outputRoot, 'LICENSE'));
await assembleTemplates();

// Keep the uninstalled build runnable from the workspace root. Published packages
// resolve this dependency through package installation instead.
const dependencyRoot = join(outputRoot, 'node_modules');
await mkdir(dependencyRoot, { recursive: true });
await rm(join(dependencyRoot, 'commander'), { force: true, recursive: true });
await symlink('../../../projects/cli/node_modules/commander', join(dependencyRoot, 'commander'));
await chmod(join(outputRoot, 'index.js'), 0o755);

async function assembleTemplates() {
  const { listPrimitives } = await import('../../../dist/cli/lib/primitive-registry.js');
  const templateRoot = join(outputRoot, 'lib/templates');
  const catalog = await discoverPrimitiveCatalog(workspaceRoot);
  const renderedByKey = new Map(
    renderPrimitiveCatalog(catalog).map((template) => [
      `${template.primitiveId}/${template.file}`,
      template.content,
    ]),
  );

  await rm(templateRoot, { force: true, recursive: true });

  for (const primitive of listPrimitives().filter((entry) => entry.status === 'available')) {
    for (const file of primitive.files) {
      const content = renderedByKey.get(`${primitive.id}/${file}`);

      if (content === undefined) {
        throw new Error(`Canonical source for ${primitive.id}/${file} is missing.`);
      }

      const target = join(templateRoot, primitive.id, `${file}.template`);

      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, content);
    }
  }
}

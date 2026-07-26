import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join as joinPath } from 'node:path';
import { dirname, join, normalize, relative } from 'node:path/posix';
import ts from 'typescript';

export class PrimitiveTemplateGenerationError extends Error {}

const installableExtensions = new Set(['.css', '.scss', '.ts']);

export async function discoverPrimitiveCatalog(workspaceRoot) {
  const libraryRoot = joinPath(workspaceRoot, 'projects/duxkit-ai/src/lib');
  const entries = (await readdir(libraryRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.entrypoint.ts'))
    .sort((left, right) => left.name.localeCompare(right.name));
  const primitives = [];

  for (const entry of entries) {
    const id = entry.name.slice(0, -'.entrypoint.ts'.length);
    const primitiveRoot = joinPath(libraryRoot, id);
    const directoryEntries = await readdir(primitiveRoot, { recursive: true }).catch((error) => {
      if (isMissingFileError(error)) {
        return null;
      }

      throw error;
    });
    const files =
      directoryEntries === null
        ? await discoverRootPrimitiveFiles(libraryRoot, id, entry.name)
        : await discoverDirectoryPrimitiveFiles(libraryRoot, id, directoryEntries);

    if (files.length === 0) {
      throw new PrimitiveTemplateGenerationError(
        `Public primitive ${id} has no installable canonical source files.`,
      );
    }

    primitives.push({ files: sortPrimitiveFiles(id, files), id });
  }

  return createCatalog(primitives);
}

export function createCatalog(primitives) {
  const sourceTargets = new Map();

  for (const primitive of primitives) {
    for (const file of primitive.files) {
      const previous = sourceTargets.get(file.sourcePath);

      if (previous !== undefined && previous !== file.targetPath) {
        throw new PrimitiveTemplateGenerationError(
          `${file.sourcePath} maps to both ${previous} and ${file.targetPath}.`,
        );
      }

      sourceTargets.set(file.sourcePath, file.targetPath);
    }

    const indexFile = primitive.files.find((file) => file.file === 'index.ts');

    if (indexFile === undefined) {
      throw new PrimitiveTemplateGenerationError(
        `Public primitive ${primitive.id} has no installable index.ts target.`,
      );
    }

    sourceTargets.set(`${primitive.id}/index.ts`, indexFile.targetPath);
  }

  return { primitives, sourceTargets };
}

export function renderPrimitiveCatalog(catalog) {
  return catalog.primitives.flatMap((primitive) =>
    primitive.files.map((file) => {
      const sourceContent = file.content;
      const transformed = transformConsumerSource({
        ...file,
        sourceTargets: catalog.sourceTargets,
      });

      return {
        ...file,
        ...transformed,
        primitiveId: primitive.id,
        sourceContent,
      };
    }),
  );
}

export function renderConsumerSource(options) {
  return transformConsumerSource(options).content;
}

export function transformConsumerSource({ content, sourcePath, sourceTargets, targetPath }) {
  if (!sourcePath.endsWith('.ts')) {
    return { content, primitiveDependencies: [] };
  }

  const sourceFile = ts.createSourceFile(
    sourcePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const replacements = [];
  const primitiveDependencies = new Set();

  if (sourceFile.parseDiagnostics.length > 0) {
    const [diagnostic] = sourceFile.parseDiagnostics;
    throw new PrimitiveTemplateGenerationError(
      `${sourcePath} cannot be parsed: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
    );
  }

  visit(sourceFile);

  const rendered = replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (result, replacement) =>
        `${result.slice(0, replacement.start)}${replacement.value}${result.slice(replacement.end)}`,
      content,
    );

  if (/['"](?:duxkit-ai(?:\/[^'"]*)?|@duxkit-private\/[^'"]*)['"]/.test(rendered)) {
    throw new PrimitiveTemplateGenerationError(
      `${sourcePath} contains a DuxKit package import that cannot be installed in a consumer.`,
    );
  }

  return { content: rendered, primitiveDependencies: [...primitiveDependencies].sort() };

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      rewriteModuleSpecifier(node.moduleSpecifier);
    }

    if (
      ts.isPropertyAssignment(node) &&
      ((ts.isIdentifier(node.name) && node.name.text === 'styleUrl') ||
        (ts.isStringLiteral(node.name) && node.name.text === 'styleUrl')) &&
      ts.isStringLiteral(node.initializer)
    ) {
      rewriteStylesheet(node.initializer);
    }

    if (
      ts.isPropertyAssignment(node) &&
      ((ts.isIdentifier(node.name) && node.name.text === 'styleUrls') ||
        (ts.isStringLiteral(node.name) && node.name.text === 'styleUrls')) &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      for (const element of node.initializer.elements) {
        if (ts.isStringLiteral(element)) {
          rewriteStylesheet(element);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  function rewriteModuleSpecifier(literal) {
    const prefix = 'duxkit-ai/';

    if (!literal.text.startsWith(prefix)) {
      return;
    }

    const importPath = literal.text.slice(prefix.length);

    if (importPath.includes('/')) {
      throw new PrimitiveTemplateGenerationError(
        `${sourcePath} imports unsupported DuxKit subpath ${literal.text}.`,
      );
    }

    const primitiveId = importPath;
    const dependencyTarget = sourceTargets.get(`${primitiveId}/index.ts`);

    if (dependencyTarget === undefined) {
      throw new PrimitiveTemplateGenerationError(
        `${sourcePath} imports ${literal.text}, but that primitive has no generated consumer target.`,
      );
    }

    primitiveDependencies.add(primitiveId);
    replaceLiteral(literal, relativeSpecifier(dirname(targetPath), dirname(dependencyTarget)));
  }

  function rewriteStylesheet(literal) {
    if (!literal.text.startsWith('.')) {
      return;
    }

    const stylesheetSource = normalize(join(dirname(sourcePath), literal.text));
    const stylesheetTarget = sourceTargets.get(stylesheetSource);

    if (stylesheetTarget === undefined) {
      throw new PrimitiveTemplateGenerationError(
        `${sourcePath} references ${literal.text}, but that stylesheet has no generated consumer target.`,
      );
    }

    replaceLiteral(literal, relativeSpecifier(dirname(targetPath), stylesheetTarget));
  }

  function replaceLiteral(literal, value) {
    replacements.push({
      end: literal.getEnd() - 1,
      start: literal.getStart(sourceFile) + 1,
      value,
    });
  }
}

function relativeSpecifier(from, to) {
  const specifier = relative(from, to);

  return specifier.startsWith('.') ? specifier : `./${specifier}`;
}

async function discoverDirectoryPrimitiveFiles(libraryRoot, id, entries) {
  const files = [];

  for (const relativeFile of entries.sort((left, right) => left.localeCompare(right))) {
    if (!isInstallableSource(relativeFile)) {
      continue;
    }

    const file = relativeFile.replaceAll('\\', '/');
    const sourcePath = `${id}/${file}`;
    files.push({
      content: await readFile(joinPath(libraryRoot, sourcePath), 'utf8'),
      file,
      sourcePath,
      targetPath: sourcePath,
    });
  }

  return files;
}

async function discoverRootPrimitiveFiles(libraryRoot, id, entrypointFile) {
  const entries = await readdir(libraryRoot, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (
      !entry.isFile() ||
      (!entry.name.startsWith(`${id}.`) && entry.name !== entrypointFile) ||
      !isInstallableSource(entry.name)
    ) {
      continue;
    }

    const file = entry.name === entrypointFile ? 'index.ts' : entry.name;
    files.push({
      content: await readFile(joinPath(libraryRoot, entry.name), 'utf8'),
      file,
      sourcePath: entry.name,
      targetPath: `${id}/${file}`,
    });
  }

  return files;
}

function sortPrimitiveFiles(id, files) {
  return files.sort((left, right) => {
    const leftRank = fileRank(id, left.file);
    const rightRank = fileRank(id, right.file);

    return leftRank - rightRank || left.file.localeCompare(right.file);
  });
}

function fileRank(id, file) {
  if (file === `${id}.ts`) {
    return 0;
  }

  if (file === 'index.ts') {
    return 2;
  }

  return 1;
}

function isInstallableSource(file) {
  return (
    installableExtensions.has(extname(file)) &&
    !basename(file).endsWith('.spec.ts') &&
    !basename(file).endsWith('.stories.ts')
  );
}

export function isMissingFileError(error) {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

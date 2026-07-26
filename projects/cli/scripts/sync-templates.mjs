import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import {
  discoverPrimitiveCatalog,
  isMissingFileError,
  PrimitiveTemplateGenerationError,
  renderPrimitiveCatalog,
} from './lib/primitive-template-generator.mjs';

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const defaultWorkspaceRoot = dirname(dirname(dirname(scriptRoot)));

export async function synchronizePrimitiveTemplates({
  check = false,
  workspaceRoot = defaultWorkspaceRoot,
} = {}) {
  const catalog = await discoverPrimitiveCatalog(workspaceRoot);
  const registryPath = join(workspaceRoot, 'projects/cli/src/lib/primitive-registry.ts');
  const registrySource = await readFile(registryPath, 'utf8');
  const registryMetadata = readRegistryMetadata(registrySource, registryPath);
  const sourceIds = catalog.primitives.map((primitive) => primitive.id);

  assertMatchingIds('primitiveIds', registryMetadata.declared, sourceIds);
  assertMatchingIds(
    'registry metadata',
    registryMetadata.entries.map((entry) => entry.id),
    sourceIds,
  );

  const generatedManifestPath = join(
    workspaceRoot,
    'projects/cli/src/lib/primitive-files.generated.ts',
  );
  const templateRoot = join(workspaceRoot, 'projects/cli/src/lib/templates');
  const manifest = renderPrimitiveFileManifest(catalog.primitives);
  const catalogTemplates = renderPrimitiveCatalog(catalog);
  validatePrimitiveDependencies(registryMetadata.entries, catalogTemplates);
  await validateRegistryAndPackageMetadata({
    catalogTemplates,
    manifest,
    registrySource,
    workspaceRoot,
  });
  const renderedTemplates = catalogTemplates.filter(
    (template) =>
      template.content !== template.sourceContent || template.sourcePath !== template.targetPath,
  );
  const expectedTemplates = new Map(
    renderedTemplates.map((template) => [
      `${template.primitiveId}/${template.file}.template`,
      template.content,
    ]),
  );

  if (check) {
    const stale = [];

    if ((await readFileOrNull(generatedManifestPath)) !== manifest) {
      stale.push(relative(workspaceRoot, generatedManifestPath));
    }

    const actualTemplateFiles = await listFiles(templateRoot);
    const allTemplateFiles = new Set([...actualTemplateFiles, ...expectedTemplates.keys()]);

    for (const file of [...allTemplateFiles].sort()) {
      const actual = await readFileOrNull(join(templateRoot, file));
      const expected = expectedTemplates.get(file) ?? null;

      if (actual !== expected) {
        stale.push(relative(workspaceRoot, join(templateRoot, file)));
      }
    }

    if (stale.length > 0) {
      throw new PrimitiveTemplateGenerationError(
        `CLI primitive templates are stale:\n${stale.map((file) => `- ${file}`).join('\n')}\nRun pnpm cli:sync-templates.`,
      );
    }

    return { changed: [], templates: renderedTemplates.length };
  }

  const changed = [];

  if ((await readFileOrNull(generatedManifestPath)) !== manifest) {
    await writeFile(generatedManifestPath, manifest);
    changed.push(relative(workspaceRoot, generatedManifestPath));
  }

  const actualTemplateFiles = await listFiles(templateRoot);
  const templatesChanged =
    actualTemplateFiles.length !== expectedTemplates.size ||
    (
      await Promise.all(
        [...expectedTemplates].map(
          async ([file, content]) => (await readFileOrNull(join(templateRoot, file))) === content,
        ),
      )
    ).some((matches) => !matches);

  if (templatesChanged) {
    await rm(templateRoot, { force: true, recursive: true });

    for (const [file, content] of [...expectedTemplates].sort(([left], [right]) =>
      left.localeCompare(right),
    )) {
      const path = join(templateRoot, file);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content);
    }

    changed.push(relative(workspaceRoot, templateRoot));
  }

  return { changed, templates: renderedTemplates.length };
}

function readRegistryMetadata(content, path) {
  const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
  let declared = null;
  const entries = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === 'primitiveIds' &&
        declaration.initializer !== undefined
      ) {
        const initializer = unwrapExpression(declaration.initializer);

        if (!ts.isArrayLiteralExpression(initializer)) {
          throw new PrimitiveTemplateGenerationError('primitiveIds must be an array literal.');
        }

        declared = initializer.elements.map((element) =>
          readStringLiteral(element, 'primitiveIds'),
        );
      }
    }
  }

  visit(sourceFile);

  if (declared === null) {
    throw new PrimitiveTemplateGenerationError('primitive-registry.ts is missing primitiveIds.');
  }

  return { declared, entries };

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'primitive' &&
      node.arguments.length === 1
    ) {
      const argument = node.arguments[0];

      if (argument !== undefined && ts.isObjectLiteralExpression(argument)) {
        const idProperty = argument.properties.find(
          (property) =>
            ts.isPropertyAssignment(property) &&
            ((ts.isIdentifier(property.name) && property.name.text === 'id') ||
              (ts.isStringLiteral(property.name) && property.name.text === 'id')),
        );

        if (idProperty !== undefined && ts.isPropertyAssignment(idProperty)) {
          const id = readStringLiteral(idProperty.initializer, 'primitive metadata id');
          readRequiredStringProperty(argument, 'title', id);
          readRequiredStringProperty(argument, 'description', id);
          readRequiredStringArrayProperty(argument, 'tokens', id);
          const dependenciesProperty = argument.properties.find(
            (property) =>
              ts.isPropertyAssignment(property) &&
              ((ts.isIdentifier(property.name) && property.name.text === 'primitiveDependencies') ||
                (ts.isStringLiteral(property.name) &&
                  property.name.text === 'primitiveDependencies')),
          );
          const primitiveDependencies =
            dependenciesProperty !== undefined && ts.isPropertyAssignment(dependenciesProperty)
              ? readStringArray(dependenciesProperty.initializer, `${id} primitiveDependencies`)
              : [];

          entries.push({ id, primitiveDependencies });
        }
      }
    }

    ts.forEachChild(node, visit);
  }
}

async function validateRegistryAndPackageMetadata({
  catalogTemplates,
  manifest,
  registrySource,
  workspaceRoot,
}) {
  const validationSource = await readFile(
    join(workspaceRoot, 'projects/cli/src/lib/primitive-template-validation.ts'),
    'utf8',
  );
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'duxkit-cli-registry-'));

  try {
    await Promise.all([
      writeFile(join(temporaryRoot, 'package.json'), '{"type":"module"}\n'),
      writeFile(
        join(temporaryRoot, 'primitive-files.generated.js'),
        transpileTypeScript(manifest, 'primitive-files.generated.ts'),
      ),
      writeFile(
        join(temporaryRoot, 'primitive-registry.js'),
        transpileTypeScript(registrySource, 'primitive-registry.ts'),
      ),
      writeFile(
        join(temporaryRoot, 'primitive-template-validation.js'),
        transpileTypeScript(validationSource, 'primitive-template-validation.ts'),
      ),
    ]);

    const [registry, validation] = await Promise.all([
      import(pathToFileURL(join(temporaryRoot, 'primitive-registry.js')).href),
      import(pathToFileURL(join(temporaryRoot, 'primitive-template-validation.js')).href),
    ]);

    validation.validatePrimitiveTemplates(registry.listPrimitives(), catalogTemplates);
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

function transpileTypeScript(content, fileName) {
  const result = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName,
    reportDiagnostics: true,
  });
  const error = result.diagnostics?.find(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );

  if (error !== undefined) {
    throw new PrimitiveTemplateGenerationError(
      `${fileName} cannot be transpiled: ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`,
    );
  }

  return result.outputText;
}

function validatePrimitiveDependencies(entries, templates) {
  const importedByPrimitive = new Map();

  for (const template of templates) {
    const imported = importedByPrimitive.get(template.primitiveId) ?? new Set();

    for (const dependency of template.primitiveDependencies) {
      imported.add(dependency);
    }

    importedByPrimitive.set(template.primitiveId, imported);
  }

  for (const entry of entries) {
    const imported = [...(importedByPrimitive.get(entry.id) ?? [])].sort();
    const declared = [...entry.primitiveDependencies].sort();

    if (JSON.stringify(imported) !== JSON.stringify(declared)) {
      throw new PrimitiveTemplateGenerationError(
        `Primitive ${entry.id} primitiveDependencies are stale: canonical source imports [${imported.join(', ')}], registry declares [${declared.join(', ')}].`,
      );
    }
  }
}

function renderPrimitiveFileManifest(primitives) {
  const lines = [
    '// Generated by pnpm cli:sync-templates. Do not edit.',
    'export const primitiveFiles = {',
  ];

  for (const primitive of primitives) {
    lines.push(`  '${primitive.id}': [`);
    lines.push(...primitive.files.map((file) => `    '${file.file}',`));
    lines.push('  ],');
  }

  lines.push('} as const;', '');
  return lines.join('\n');
}

function assertMatchingIds(label, actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = expected.filter((id) => !actualSet.has(id));
  const stale = actual.filter((id) => !expectedSet.has(id));
  const duplicates = actual.filter((id, index) => actual.indexOf(id) !== index);

  if (missing.length === 0 && stale.length === 0 && duplicates.length === 0) {
    return;
  }

  const details = [
    missing.length === 0 ? null : `missing ${missing.join(', ')}`,
    stale.length === 0 ? null : `unknown ${stale.join(', ')}`,
    duplicates.length === 0 ? null : `duplicate ${[...new Set(duplicates)].join(', ')}`,
  ].filter((detail) => detail !== null);

  throw new PrimitiveTemplateGenerationError(
    `CLI ${label} does not match public primitive sources: ${details.join('; ')}. Add or update explicit registry metadata before synchronizing.`,
  );
}

function unwrapExpression(expression) {
  if (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression)) {
    return unwrapExpression(expression.expression);
  }

  return expression;
}

function readStringLiteral(expression, label) {
  if (!ts.isStringLiteral(expression)) {
    throw new PrimitiveTemplateGenerationError(`${label} entries must be string literals.`);
  }

  return expression.text;
}

function readStringArray(expression, label) {
  const value = unwrapExpression(expression);

  if (!ts.isArrayLiteralExpression(value)) {
    throw new PrimitiveTemplateGenerationError(`${label} must be an array literal.`);
  }

  return value.elements.map((element) => readStringLiteral(element, label));
}

function readRequiredStringProperty(object, name, primitiveId) {
  const property = findPropertyAssignment(object, name);

  if (property === undefined) {
    throw new PrimitiveTemplateGenerationError(
      `Primitive ${primitiveId} registry metadata is missing required ${name}.`,
    );
  }

  const value = readStringLiteral(property.initializer, `${primitiveId} ${name}`);

  if (value.trim().length === 0) {
    throw new PrimitiveTemplateGenerationError(
      `Primitive ${primitiveId} registry metadata ${name} must not be empty.`,
    );
  }
}

function readRequiredStringArrayProperty(object, name, primitiveId) {
  const property = findPropertyAssignment(object, name);

  if (property === undefined) {
    throw new PrimitiveTemplateGenerationError(
      `Primitive ${primitiveId} registry metadata is missing required ${name}.`,
    );
  }

  readStringArray(property.initializer, `${primitiveId} ${name}`);
}

function findPropertyAssignment(object, name) {
  const property = object.properties.find(
    (candidate) =>
      ts.isPropertyAssignment(candidate) &&
      ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
        (ts.isStringLiteral(candidate.name) && candidate.name.text === name)),
  );

  return property !== undefined && ts.isPropertyAssignment(property) ? property : undefined;
}

async function listFiles(root) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true }).catch((error) => {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort();
}

async function readFileOrNull(path) {
  return readFile(path, 'utf8').catch((error) => {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');

  try {
    const result = await synchronizePrimitiveTemplates({ check });
    const action = check
      ? `CLI primitive templates are synchronized (${result.templates} derived templates).`
      : result.changed.length === 0
        ? `CLI primitive templates already synchronized (${result.templates} derived templates).`
        : `Synchronized CLI primitive templates (${result.templates} derived templates).`;
    console.log(action);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

import type { PrimitivePackageDependency, PrimitiveRegistryEntry } from './primitive-registry.js';
import type { PrimitiveTemplateFile } from './primitive-templates.js';

export class PrimitiveTemplateValidationError extends Error {}

export interface PrimitiveTemplateSource extends PrimitiveTemplateFile {
  readonly content: string;
}

const baselineOnlyPackageNames = new Set([
  '@ai-sdk/angular',
  '@angular/common',
  '@angular/core',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
  'tailwindcss',
  'tw-animate-css',
]);

export function validatePrimitiveTemplates(
  entries: readonly PrimitiveRegistryEntry[],
  templates: readonly PrimitiveTemplateSource[],
): void {
  const templatesByPrimitive = groupTemplatesByPrimitive(templates);

  for (const entry of entries) {
    const entryTemplates = templatesByPrimitive.get(entry.id);

    if (entryTemplates === undefined) {
      continue;
    }

    validateTemplateFiles(entry, entryTemplates);
    validateTemplatePackageMetadata(entry, entryTemplates);
  }
}

function validateTemplateFiles(
  entry: PrimitiveRegistryEntry,
  templates: readonly PrimitiveTemplateSource[],
): void {
  const templateFiles = new Set(templates.map((template) => template.file));
  const registryFiles = new Set(entry.files);

  for (const file of entry.files) {
    if (!templateFiles.has(file)) {
      throw new PrimitiveTemplateValidationError(
        `Primitive ${entry.id} registry file has no template: ${file}`,
      );
    }
  }

  for (const template of templates) {
    if (!registryFiles.has(template.file)) {
      throw new PrimitiveTemplateValidationError(
        `Primitive ${entry.id} template is not declared in registry: ${template.file}`,
      );
    }
  }
}

function validateTemplatePackageMetadata(
  entry: PrimitiveRegistryEntry,
  templates: readonly PrimitiveTemplateSource[],
): void {
  const importedPackages = collectImportedPackages(templates);
  const metadataPackages = new Set(
    [...entry.peerAssumptions, ...entry.dependencies].map((dependency) => dependency.name),
  );

  for (const importedPackage of importedPackages) {
    if (!metadataPackages.has(importedPackage)) {
      throw new PrimitiveTemplateValidationError(
        `Primitive ${entry.id} imports ${importedPackage} but registry metadata does not declare it.`,
      );
    }
  }

  for (const metadataPackage of metadataPackages) {
    if (baselineOnlyPackageNames.has(metadataPackage)) {
      continue;
    }

    if (!importedPackages.has(metadataPackage)) {
      throw new PrimitiveTemplateValidationError(
        `Primitive ${entry.id} declares ${metadataPackage} but templates do not import it.`,
      );
    }
  }
}

function collectImportedPackages(
  templates: readonly PrimitiveTemplateSource[],
): ReadonlySet<string> {
  const packages = new Set<string>();

  for (const template of templates) {
    for (const specifier of parseImportSpecifiers(template.content)) {
      if (specifier.startsWith('.')) {
        continue;
      }

      packages.add(toPackageName(specifier));
    }
  }

  return packages;
}

function parseImportSpecifiers(content: string): readonly string[] {
  const specifiers: string[] = [];
  const importPattern = /\bimport\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gs;

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1];

    if (specifier !== undefined) {
      specifiers.push(specifier);
    }
  }

  return specifiers;
}

function toPackageName(specifier: string): string {
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/');

    return `${scope}/${name}`;
  }

  return specifier.split('/')[0] ?? specifier;
}

function groupTemplatesByPrimitive(
  templates: readonly PrimitiveTemplateSource[],
): ReadonlyMap<PrimitiveRegistryEntry['id'], readonly PrimitiveTemplateSource[]> {
  const grouped = new Map<PrimitiveRegistryEntry['id'], PrimitiveTemplateSource[]>();

  for (const template of templates) {
    const primitiveTemplates = grouped.get(template.primitiveId) ?? [];
    primitiveTemplates.push(template);
    grouped.set(template.primitiveId, primitiveTemplates);
  }

  return grouped;
}

export function isBaselineOnlyPackageDependency(dependency: PrimitivePackageDependency): boolean {
  return baselineOnlyPackageNames.has(dependency.name);
}

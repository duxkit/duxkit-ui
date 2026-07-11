import { readFile } from 'node:fs/promises';
import { listPrimitives, type PrimitiveId } from './primitive-registry.js';

export interface PrimitiveTemplateFile {
  readonly primitiveId: PrimitiveId;
  readonly file: string;
  readonly templatePath: string;
}

export function listPrimitiveTemplates(): readonly PrimitiveTemplateFile[] {
  return listPrimitives()
    .filter((primitive) => primitive.status === 'available')
    .flatMap((primitive) =>
      primitive.files.map((file) => ({
        file,
        primitiveId: primitive.id,
        templatePath: `templates/${primitive.id}/${file}.template`,
      })),
    );
}

export function hasPrimitiveTemplate(id: PrimitiveId): boolean {
  return listPrimitives().some(
    (primitive) => primitive.id === id && primitive.status === 'available',
  );
}

export async function readPrimitiveTemplate(
  primitiveId: PrimitiveId,
  file: string,
): Promise<string> {
  const template = listPrimitiveTemplates().find(
    (candidate) => candidate.primitiveId === primitiveId && candidate.file === file,
  );

  if (template === undefined) {
    throw new Error(`The bundled template for ${primitiveId}/${file} is missing.`);
  }

  return readFile(new URL(`./${template.templatePath}`, import.meta.url), 'utf8');
}

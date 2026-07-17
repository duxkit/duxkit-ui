import { readFile } from 'node:fs/promises';
import { listPrimitives, type PrimitiveId } from './primitive-registry.js';

export const primitiveTemplateOverrides = [
  'attachment/attachment-preview.ts',
  'attachment/attachment-remove.ts',
  'attachment/attachment.ts',
  'chain-of-thought/chain-of-thought-trigger.ts',
  'code-block/code-block.ts',
  'context/context-content.ts',
  'markdown/index.ts',
  'message/message-content.ts',
  'model-selector/model-selector-content.ts',
  'model-selector/model-selector-empty.ts',
  'model-selector/model-selector-input.ts',
  'prompt-input/prompt-input-attachments.ts',
  'reasoning/reasoning-content.ts',
  'sources/source.ts',
] as const;

const overrideKeys = new Set<string>(primitiveTemplateOverrides);

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

  return readPrimitiveTemplateSource(template);
}

export async function readPrimitiveTemplateSource(
  template: PrimitiveTemplateFile,
): Promise<string> {
  try {
    return await readFile(new URL(`./${template.templatePath}`, import.meta.url), 'utf8');
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }

  return readFile(
    new URL(`../../../duxkit-ai/src/lib/${primitiveSourcePath(template)}`, import.meta.url),
    'utf8',
  );
}

export function primitiveSourcePath(
  template: Pick<PrimitiveTemplateFile, 'file' | 'primitiveId'>,
): string {
  return template.primitiveId === 'markdown'
    ? template.file
    : `${template.primitiveId}/${template.file}`;
}

export function isPrimitiveTemplateOverride(
  template: Pick<PrimitiveTemplateFile, 'file' | 'primitiveId'>,
): boolean {
  return overrideKeys.has(`${template.primitiveId}/${template.file}`);
}

function isMissingFileError(error: unknown): boolean {
  return (
    error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

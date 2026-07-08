import { listPrimitives, type PrimitiveId } from './primitive-registry.js';

export interface PrimitiveTemplateFile {
  readonly primitiveId: PrimitiveId;
  readonly file: string;
  readonly templatePath: string;
}

const launchTemplatePrimitiveIds = [
  'conversation',
  'message',
  'prompt-input',
  'reasoning',
  'tool',
  'code-block',
  'markdown',
] as const satisfies readonly PrimitiveId[];

const launchTemplatePrimitiveIdSet = new Set<PrimitiveId>(launchTemplatePrimitiveIds);

export function listPrimitiveTemplates(): readonly PrimitiveTemplateFile[] {
  return listPrimitives()
    .filter((primitive) => launchTemplatePrimitiveIdSet.has(primitive.id))
    .flatMap((primitive) =>
      primitive.files.map((file) => ({
        file,
        primitiveId: primitive.id,
        templatePath: `templates/${primitive.id}/${file}.template`,
      })),
    );
}

export function hasLaunchTemplate(id: PrimitiveId): boolean {
  return launchTemplatePrimitiveIdSet.has(id);
}

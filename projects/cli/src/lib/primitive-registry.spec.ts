import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  PrimitiveTemplateValidationError,
  validatePrimitiveTemplates,
  type PrimitiveTemplateSource,
} from './primitive-template-validation.js';
import { listPrimitiveTemplates } from './primitive-templates.js';
import {
  listPrimitives,
  normalizePrimitiveInput,
  type PrimitivePackageDependency,
  type PrimitiveRegistryEntry,
  PrimitiveRegistryError,
  resolvePrimitivePlan,
  validatePrimitiveRegistry,
} from './primitive-registry.js';

describe('primitive registry', () => {
  it('validates the bundled primitive catalog', () => {
    expect(listPrimitives().map((primitive) => primitive.id)).toEqual([
      'conversation',
      'message',
      'prompt-input',
      'reasoning',
      'tool',
      'code-block',
      'markdown',
      'attachment',
      'chain-of-thought',
      'checkpoint',
      'confirmation',
      'context',
      'model-selector',
      'queue',
      'shimmer',
      'sources',
      'task',
    ]);
  });

  it('normalizes exact ids and documented aliases only', () => {
    expect(normalizePrimitiveInput('message')).toBe('message');
    expect(normalizePrimitiveInput('Message')).toBe('message');
    expect(normalizePrimitiveInput('prompt-input')).toBe('prompt-input');
    expect(normalizePrimitiveInput('Prompt Input')).toBe('prompt-input');
    expect(normalizePrimitiveInput('prompt')).toBe('prompt-input');
    expect(normalizePrimitiveInput('cot')).toBe('chain-of-thought');
    expect(normalizePrimitiveInput('promptInput')).toBe('prompt-input');
    expect(() => normalizePrimitiveInput('mesage')).toThrow(/Did you mean "message"/);
  });

  it('resolves primitive dependencies before dependents without duplicating user requests', () => {
    const plan = resolvePrimitivePlan(['message', 'code-block', 'prompt']);

    expect(plan.requested.map((primitive) => primitive.id)).toEqual([
      'message',
      'code-block',
      'prompt-input',
    ]);
    expect(plan.included.map((primitive) => primitive.id)).toEqual(['markdown']);
    expect(plan.ordered.map((primitive) => primitive.id)).toEqual([
      'markdown',
      'code-block',
      'message',
      'prompt-input',
    ]);
    expect(plan.dependencyGroups).toEqual([
      'angular',
      'styling',
      'markdown',
      'icons',
      'ai-runtime',
    ]);
  });

  it('rejects invalid registry records', () => {
    const [first] = listPrimitives();

    if (first === undefined) {
      throw new Error('Expected bundled registry to contain primitives.');
    }

    expect(() =>
      validatePrimitiveRegistry([
        {
          ...first,
          aliases: ['message'],
        },
      ]),
    ).toThrow(PrimitiveRegistryError);

    expect(() =>
      validatePrimitiveRegistry([
        {
          ...first,
          files: ['../unsafe.ts'],
        },
      ]),
    ).toThrow(PrimitiveRegistryError);

    expect(() =>
      validatePrimitiveRegistry([
        {
          ...first,
          primitiveDependencies: ['message'],
        },
      ]),
    ).toThrow(PrimitiveRegistryError);
  });

  it('bundles launch primitive templates matching registry file metadata', async () => {
    const templates = await loadPrimitiveTemplates();

    expect(templates.map((template) => `${template.primitiveId}/${template.file}`)).toEqual([
      'conversation/conversation.ts',
      'conversation/conversation-content.ts',
      'conversation/conversation-scroll-anchor.ts',
      'conversation/index.ts',
      'message/message.ts',
      'message/message-action-classes.ts',
      'message/message-actions.ts',
      'message/message-content.ts',
      'message/message-copy.ts',
      'message/message-thumbs-down.ts',
      'message/message-thumbs-up.ts',
      'message/index.ts',
      'prompt-input/prompt-input-attachments.ts',
      'prompt-input/prompt-input-button.ts',
      'prompt-input/prompt-input-layout.ts',
      'prompt-input/prompt-input-root.ts',
      'prompt-input/prompt-input-submit.ts',
      'prompt-input/prompt-input-textarea.ts',
      'prompt-input/prompt-input.types.ts',
      'prompt-input/index.ts',
      'reasoning/reasoning.ts',
      'reasoning/reasoning-content.ts',
      'reasoning/reasoning-trigger.ts',
      'reasoning/index.ts',
      'tool/tool.ts',
      'tool/tool-content.ts',
      'tool/tool-status.ts',
      'tool/tool-trigger.ts',
      'tool/index.ts',
      'code-block/code-block.ts',
      'code-block/index.ts',
      'markdown/markdown.ts',
      'markdown/markdown.scss',
      'markdown/index.ts',
    ]);

    validatePrimitiveTemplates(listPrimitives(), templates);
  });

  it('keeps generated primitive imports relative', async () => {
    const templates = await loadPrimitiveTemplates();

    for (const template of templates) {
      expect(template.content, `${template.primitiveId}/${template.file}`).not.toMatch(
        /from\s+['"]@duxkit(?:\/|-)/,
      );
    }
  });

  it('rejects templates importing packages missing from registry dependency metadata', async () => {
    const templates = await loadPrimitiveTemplates();

    expect(() =>
      validatePrimitiveTemplates(
        removePackageFromPrimitive('conversation', 'tailwind-merge'),
        templates,
      ),
    ).toThrow(PrimitiveTemplateValidationError);
  });

  it('rejects stale registry dependency metadata not used by templates', async () => {
    const templates = await loadPrimitiveTemplates();
    const staleDependency: PrimitivePackageDependency = {
      group: 'markdown',
      name: 'marked',
      section: 'dependencies',
      version: '^18.0.5',
    };

    expect(() =>
      validatePrimitiveTemplates(
        addDependencyToPrimitive('conversation', staleDependency),
        templates,
      ),
    ).toThrow(PrimitiveTemplateValidationError);
  });
});

async function loadPrimitiveTemplates(): Promise<readonly PrimitiveTemplateSource[]> {
  return Promise.all(
    listPrimitiveTemplates().map(async (template) => ({
      ...template,
      content: await readFile(
        fileURLToPath(new URL(template.templatePath, import.meta.url)),
        'utf8',
      ),
    })),
  );
}

function removePackageFromPrimitive(
  primitiveId: PrimitiveRegistryEntry['id'],
  packageName: string,
): readonly PrimitiveRegistryEntry[] {
  return listPrimitives().map((primitive) =>
    primitive.id === primitiveId
      ? {
          ...primitive,
          dependencies: primitive.dependencies.filter(
            (dependency) => dependency.name !== packageName,
          ),
          peerAssumptions: primitive.peerAssumptions.filter(
            (dependency) => dependency.name !== packageName,
          ),
        }
      : primitive,
  );
}

function addDependencyToPrimitive(
  primitiveId: PrimitiveRegistryEntry['id'],
  dependency: PrimitivePackageDependency,
): readonly PrimitiveRegistryEntry[] {
  return listPrimitives().map((primitive) =>
    primitive.id === primitiveId
      ? {
          ...primitive,
          dependencies: [...primitive.dependencies, dependency],
        }
      : primitive,
  );
}

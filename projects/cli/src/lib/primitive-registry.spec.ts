import { describe, expect, it } from 'vitest';
import {
  PrimitiveTemplateValidationError,
  validatePrimitiveTemplates,
  type PrimitiveTemplateSource,
} from './primitive-template-validation.js';
import { listPrimitiveTemplates, readPrimitiveTemplateSource } from './primitive-templates.js';
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
    const primitives = listPrimitives();

    expect(primitives.map((primitive) => primitive.id)).toEqual([
      'conversation',
      'message',
      'prompt-input',
      'reasoning',
      'reasoning-effort',
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
    expect(primitives.every((primitive) => primitive.status === 'available')).toBe(true);
  });

  it('normalizes exact ids and documented aliases only', () => {
    expect(normalizePrimitiveInput('message')).toBe('message');
    expect(normalizePrimitiveInput('Message')).toBe('message');
    expect(normalizePrimitiveInput('prompt-input')).toBe('prompt-input');
    expect(normalizePrimitiveInput('Prompt Input')).toBe('prompt-input');
    expect(normalizePrimitiveInput('prompt')).toBe('prompt-input');
    expect(normalizePrimitiveInput('cot')).toBe('chain-of-thought');
    expect(normalizePrimitiveInput('effort')).toBe('reasoning-effort');
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
    expect(plan.included.map((primitive) => primitive.id)).toEqual(['markdown', 'attachment']);
    expect(plan.ordered.map((primitive) => primitive.id)).toEqual([
      'markdown',
      'code-block',
      'message',
      'attachment',
      'prompt-input',
    ]);
    expect(plan.dependencyGroups).toEqual([
      'angular',
      'styling',
      'markdown',
      'icons',
      'ai-runtime',
      'spartan',
    ]);
  });

  it('includes dependencies for CDK-backed and command-input primitives', () => {
    const attachment = resolvePrimitivePlan(['attachment']);
    const context = resolvePrimitivePlan(['context']);
    const modelSelector = resolvePrimitivePlan(['model-selector']);
    const reasoningEffort = resolvePrimitivePlan(['reasoning-effort']);

    expect(attachment.dependencies).toContainEqual(
      expect.objectContaining({ name: '@angular/cdk' }),
    );
    expect(context.dependencies).toContainEqual(expect.objectContaining({ name: '@angular/cdk' }));
    expect(modelSelector.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '@angular/cdk' }),
        expect.objectContaining({ name: '@angular/forms' }),
      ]),
    );
    expect(reasoningEffort.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: '@angular/cdk' }),
        expect.objectContaining({ name: '@spartan-ng/brain' }),
      ]),
    );
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

  it('bundles every available primitive template matching registry file metadata', async () => {
    const templates = await loadPrimitiveTemplates();

    expect(templates.map((template) => `${template.primitiveId}/${template.file}`)).toEqual(
      listPrimitives().flatMap((primitive) =>
        primitive.files.map((file) => `${primitive.id}/${file}`),
      ),
    );

    validatePrimitiveTemplates(listPrimitives(), templates);
  });

  it('keeps generated primitive imports relative', async () => {
    const templates = await loadPrimitiveTemplates();

    for (const template of templates) {
      expect(template.content, `${template.primitiveId}/${template.file}`).not.toMatch(
        /from\s+['"](?:@duxkit-private|duxkit-ai(?:\/|['"]))/,
      );
    }
  });

  it('keeps generated source links accessibly named when title is omitted', async () => {
    const templates = await loadPrimitiveTemplates();
    const source = templates.find(
      (template) => template.primitiveId === 'sources' && template.file === 'source.ts',
    );

    expect(source?.content).toContain("title() || href() || 'Source'");
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
      content: await readPrimitiveTemplateSource(template),
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

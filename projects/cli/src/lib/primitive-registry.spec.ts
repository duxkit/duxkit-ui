import { describe, expect, it } from 'vitest';
import {
  listPrimitives,
  normalizePrimitiveInput,
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
    expect(normalizePrimitiveInput('prompt')).toBe('prompt-input');
    expect(normalizePrimitiveInput('cot')).toBe('chain-of-thought');
    expect(() => normalizePrimitiveInput('Message')).toThrow(PrimitiveRegistryError);
    expect(() => normalizePrimitiveInput('promptInput')).toThrow(PrimitiveRegistryError);
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
});

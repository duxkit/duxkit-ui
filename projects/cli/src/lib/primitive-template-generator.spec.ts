import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { renderConsumerSource } from '../../scripts/lib/primitive-template-generator.mjs';
import { synchronizePrimitiveTemplates } from '../../scripts/sync-templates.mjs';

describe('primitive template generator', () => {
  it('rewrites canonical primitive imports and shared stylesheet paths for consumers', () => {
    const content = [
      "import { CodeBlock } from 'duxkit-ai/code-block';",
      "export { Markdown } from 'duxkit-ai/markdown';",
      '@Component({',
      "  styleUrl: '../markdown.scss',",
      '})',
      'class Example {}',
    ].join('\n');

    expect(
      renderConsumerSource({
        content,
        sourcePath: 'message/message-content.ts',
        targetPath: 'message/message-content.ts',
        sourceTargets: new Map([
          ['code-block/index.ts', 'code-block/index.ts'],
          ['markdown/index.ts', 'markdown/index.ts'],
          ['markdown.scss', 'markdown/markdown.scss'],
        ]),
      }),
    ).toBe(
      [
        "import { CodeBlock } from '../code-block';",
        "export { Markdown } from '../markdown';",
        '@Component({',
        "  styleUrl: '../markdown/markdown.scss',",
        '})',
        'class Example {}',
      ].join('\n'),
    );
  });

  it('rejects canonical package imports that have no consumer primitive target', () => {
    expect(() =>
      renderConsumerSource({
        content: "import { Missing } from 'duxkit-ai/missing';\n",
        sourcePath: 'message/message-content.ts',
        targetPath: 'message/message-content.ts',
        sourceTargets: new Map(),
      }),
    ).toThrow(/no generated consumer target/i);
  });

  it('rejects unsupported package subpaths instead of guessing a consumer import', () => {
    expect(() =>
      renderConsumerSource({
        content: "import { Internal } from 'duxkit-ai/markdown/internal';\n",
        sourcePath: 'message/message-content.ts',
        targetPath: 'message/message-content.ts',
        sourceTargets: new Map([['markdown/index.ts', 'markdown/index.ts']]),
      }),
    ).toThrow(/unsupported DuxKit subpath/i);
  });

  it('synchronizes derived metadata idempotently and detects stale output', async () => {
    const workspaceRoot = await createFixtureWorkspace({ metadata: true });

    await expect(synchronizePrimitiveTemplates({ check: true, workspaceRoot })).rejects.toThrow(
      /templates are stale/i,
    );

    const first = await synchronizePrimitiveTemplates({ workspaceRoot });
    const second = await synchronizePrimitiveTemplates({ workspaceRoot });

    expect(first.changed).toEqual(['projects/cli/src/lib/primitive-files.generated.ts']);
    expect(second.changed).toEqual([]);
    await expect(synchronizePrimitiveTemplates({ check: true, workspaceRoot })).resolves.toEqual({
      changed: [],
      templates: 0,
    });
    expect(
      await readFile(
        join(workspaceRoot, 'projects/cli/src/lib/primitive-files.generated.ts'),
        'utf8',
      ),
    ).toContain("'example': [\n    'example.ts',\n    'index.ts',");
  });

  it('fails clearly when public primitive source has no registry metadata', async () => {
    const workspaceRoot = await createFixtureWorkspace({ metadata: false });

    await expect(synchronizePrimitiveTemplates({ workspaceRoot })).rejects.toThrow(
      /registry metadata.*missing example/i,
    );
  });

  it('rejects registry entries missing required author metadata', async () => {
    const workspaceRoot = await createFixtureWorkspace({
      incompleteMetadata: true,
      metadata: true,
    });

    await expect(synchronizePrimitiveTemplates({ workspaceRoot })).rejects.toThrow(
      /example registry metadata is missing required title/i,
    );
  });

  it('rejects stale primitive dependency metadata discovered from canonical imports', async () => {
    const workspaceRoot = await createFixtureWorkspace({ crossImport: true, metadata: true });

    await expect(synchronizePrimitiveTemplates({ workspaceRoot })).rejects.toThrow(
      /example primitiveDependencies are stale.*imports \[dependency\].*declares \[\]/i,
    );
  });

  it('rejects external package imports missing from registry dependency metadata', async () => {
    const workspaceRoot = await createFixtureWorkspace({ externalImport: true, metadata: true });

    await expect(synchronizePrimitiveTemplates({ workspaceRoot })).rejects.toThrow(
      /example imports external-package but registry metadata does not declare it/i,
    );
  });
});

async function createFixtureWorkspace({
  crossImport = false,
  externalImport = false,
  incompleteMetadata = false,
  metadata,
}: {
  readonly crossImport?: boolean;
  readonly externalImport?: boolean;
  readonly incompleteMetadata?: boolean;
  readonly metadata: boolean;
}) {
  const workspaceRoot = await mkdtemp(join(tmpdir(), 'duxkit-cli-template-'));
  const libraryRoot = join(workspaceRoot, 'projects/duxkit-ai/src/lib');
  const registryRoot = join(workspaceRoot, 'projects/cli/src/lib');

  await mkdir(join(libraryRoot, 'example'), { recursive: true });
  await mkdir(registryRoot, { recursive: true });
  await writeFile(
    join(registryRoot, 'primitive-template-validation.ts'),
    await readFile(new URL('./primitive-template-validation.ts', import.meta.url), 'utf8'),
  );
  await writeFile(join(libraryRoot, 'example.entrypoint.ts'), "export * from './example';\n");
  await writeFile(
    join(libraryRoot, 'example/example.ts'),
    `${crossImport ? "import { Dependency } from 'duxkit-ai/dependency';\n" : ''}${externalImport ? "import 'external-package';\n" : ''}export class Example {}\n`,
  );
  await writeFile(join(libraryRoot, 'example/index.ts'), "export * from './example';\n");
  if (crossImport) {
    await mkdir(join(libraryRoot, 'dependency'), { recursive: true });
    await writeFile(
      join(libraryRoot, 'dependency.entrypoint.ts'),
      "export * from './dependency';\n",
    );
    await writeFile(join(libraryRoot, 'dependency/dependency.ts'), 'export class Dependency {}\n');
    await writeFile(join(libraryRoot, 'dependency/index.ts'), "export * from './dependency';\n");
  }
  await writeFile(
    join(registryRoot, 'primitive-registry.ts'),
    [
      "import { primitiveFiles } from './primitive-files.generated.js';",
      `const primitiveIds = ['example'${crossImport ? ", 'dependency'" : ''}] as const;`,
      'function primitive(entry) {',
      "  return { aliases: [], dependencies: [], files: primitiveFiles[entry.id], optionalRelationships: [], peerAssumptions: [], primitiveDependencies: [], relationships: [], status: 'available', version: '0.1.0', ...entry };",
      '}',
      `const registryEntries = [${metadata ? `${incompleteMetadata ? "primitive({ id: 'example' })" : "primitive({ id: 'example', title: 'Example', description: 'Example primitive.', tokens: [] })"}${crossImport ? ", primitive({ id: 'dependency', title: 'Dependency', description: 'Dependency primitive.', tokens: [] })" : ''}` : ''}];`,
      'export function listPrimitives() { return registryEntries; }',
      '',
    ].join('\n'),
  );

  return workspaceRoot;
}

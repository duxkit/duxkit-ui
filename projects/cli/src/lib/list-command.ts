import { access, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { CliIo } from './cli.js';
import {
  dependencyGroupLabel,
  listPrimitives,
  resolvePrimitivePlan,
  type DependencyGroup,
  type PrimitiveId,
  type PrimitiveRegistryEntry,
} from './primitive-registry.js';

export interface ListCommandOptions {
  readonly cwd?: string;
  readonly json?: boolean;
}

interface InstalledPrimitive {
  readonly id: PrimitiveId;
  readonly source: 'config' | 'files';
}

interface DuxkitConfig {
  readonly componentsPath?: string;
  readonly primitives: readonly PrimitiveId[];
}

interface ListPrimitiveOutput {
  readonly id: PrimitiveId;
  readonly title: string;
  readonly version: string;
  readonly status: PrimitiveRegistryEntry['status'];
  readonly aliases: readonly string[];
  readonly primitiveDependencies: readonly PrimitiveId[];
  readonly dependencyGroups: readonly DependencyGroup[];
  readonly installed: boolean;
}

interface ListJsonOutput {
  readonly primitives: readonly ListPrimitiveOutput[];
  readonly installed: readonly InstalledPrimitive[];
  readonly dependencyGroups: readonly {
    readonly group: DependencyGroup;
    readonly label: string;
    readonly primitives: readonly PrimitiveId[];
  }[];
}

export async function runListCommand(options: ListCommandOptions, io: CliIo): Promise<void> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const config = await readDuxkitConfig(cwd);
  const installed = await detectInstalledPrimitives(cwd, config);
  const output = buildListOutput(installed);

  if (options.json === true) {
    io.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    return;
  }

  io.stdout.write(renderHumanList(output));
}

function buildListOutput(installed: readonly InstalledPrimitive[]): ListJsonOutput {
  const installedIds = new Set(installed.map((primitive) => primitive.id));
  const primitives = listPrimitives()
    .filter((primitive) => primitive.status === 'available')
    .map((primitive) => {
      const plan = resolvePrimitivePlan([primitive.id]);

      return {
        aliases: primitive.aliases,
        dependencyGroups: plan.dependencyGroups,
        id: primitive.id,
        installed: installedIds.has(primitive.id),
        primitiveDependencies: primitive.primitiveDependencies,
        status: primitive.status,
        title: primitive.title,
        version: primitive.version,
      };
    });
  const dependencyGroups = buildDependencyGroups(primitives);

  return {
    dependencyGroups,
    installed,
    primitives,
  };
}

function renderHumanList(output: ListJsonOutput): string {
  const available = output.primitives.filter((primitive) => primitive.status === 'available');
  const installed =
    output.installed.length === 0
      ? '  None detected'
      : output.installed.map((primitive) => `  - ${primitive.id} (${primitive.source})`).join('\n');

  return [
    'Available primitives',
    ...available.map((primitive) => renderPrimitiveLine(primitive)),
    '',
    'Installed primitives',
    installed,
    '',
    'Dependency groups',
    ...output.dependencyGroups.map((group) => `  - ${group.label}: ${group.primitives.join(', ')}`),
    '',
  ].join('\n');
}

function renderPrimitiveLine(primitive: ListPrimitiveOutput): string {
  const aliases = primitive.aliases.length > 0 ? ` aliases: ${primitive.aliases.join(', ')}` : '';
  const groups =
    primitive.dependencyGroups.length > 0
      ? ` groups: ${primitive.dependencyGroups.map(dependencyGroupLabel).join(', ')}`
      : '';
  const dependencies =
    primitive.primitiveDependencies.length > 0
      ? ` deps: ${primitive.primitiveDependencies.join(', ')}`
      : '';
  const installed = primitive.installed ? ' installed' : '';

  return `  - ${primitive.id} (${primitive.title})${aliases}${groups}${dependencies}${installed}`;
}

function buildDependencyGroups(
  primitives: readonly ListPrimitiveOutput[],
): ListJsonOutput['dependencyGroups'] {
  const groupMap = new Map<DependencyGroup, PrimitiveId[]>();

  for (const primitive of primitives) {
    for (const group of primitive.dependencyGroups) {
      const groupPrimitives = groupMap.get(group) ?? [];
      groupPrimitives.push(primitive.id);
      groupMap.set(group, groupPrimitives);
    }
  }

  return [...groupMap.entries()].map(([group, groupPrimitives]) => ({
    group,
    label: dependencyGroupLabel(group),
    primitives: groupPrimitives,
  }));
}

async function readDuxkitConfig(cwd: string): Promise<DuxkitConfig | null> {
  const configPath = join(cwd, 'duxkit-ai.json');

  try {
    const text = await readFile(configPath, 'utf8');

    return parseDuxkitConfig(text);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }

    if (error instanceof SyntaxError) {
      return null;
    }

    throw error;
  }
}

function parseDuxkitConfig(text: string): DuxkitConfig {
  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed)) {
    return { primitives: [] };
  }

  return {
    componentsPath: readOptionalString(parsed, 'componentsPath'),
    primitives: readPrimitiveIds(parsed['primitives']),
  };
}

function readPrimitiveIds(value: unknown): readonly PrimitiveId[] {
  if (Array.isArray(value)) {
    return value.filter(isPrimitiveId);
  }

  if (isRecord(value)) {
    return Object.keys(value).filter(isPrimitiveId);
  }

  return [];
}

async function detectInstalledPrimitives(
  cwd: string,
  config: DuxkitConfig | null,
): Promise<readonly InstalledPrimitive[]> {
  const installed = new Map<PrimitiveId, InstalledPrimitive>();
  const componentsPaths = await detectComponentsPaths(cwd, config);

  for (const id of config?.primitives ?? []) {
    installed.set(id, { id, source: 'config' });
  }

  for (const primitive of listPrimitives()) {
    if (installed.has(primitive.id)) {
      continue;
    }

    if (await hasPrimitiveFiles(cwd, componentsPaths, primitive)) {
      installed.set(primitive.id, { id: primitive.id, source: 'files' });
    }
  }

  return [...installed.values()];
}

async function detectComponentsPaths(
  cwd: string,
  config: DuxkitConfig | null,
): Promise<readonly string[]> {
  const paths = new Set<string>();

  if (config?.componentsPath !== undefined) {
    paths.add(config.componentsPath);
  }

  paths.add('src/app/components/ai');

  for (const root of ['apps', 'projects']) {
    for (const child of await readDirectoryNames(join(cwd, root))) {
      paths.add(`${root}/${child}/src/app/components/ai`);
    }
  }

  return [...paths];
}

async function readDirectoryNames(path: string): Promise<readonly string[]> {
  try {
    const entries = await readdir(path, { withFileTypes: true });

    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function hasPrimitiveFiles(
  cwd: string,
  componentsPaths: readonly string[],
  primitive: PrimitiveRegistryEntry,
): Promise<boolean> {
  for (const componentsPath of componentsPaths) {
    for (const file of primitive.files) {
      if (await pathExists(join(cwd, componentsPath, primitive.id, file))) {
        return true;
      }
    }
  }

  return false;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);

    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

function readOptionalString(
  source: Readonly<Record<string, unknown>>,
  key: string,
): string | undefined {
  const value = source[key];

  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function isPrimitiveId(value: unknown): value is PrimitiveId {
  return typeof value === 'string' && listPrimitives().some((primitive) => primitive.id === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

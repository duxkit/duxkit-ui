import { resolve } from 'node:path';
import type { CliIo } from './cli.js';
import {
  dependencyGroupLabel,
  listPrimitives,
  resolvePrimitivePlan,
  type DependencyGroup,
  type PrimitiveId,
  type PrimitiveRegistryEntry,
} from './primitive-registry.js';
import {
  detectInstalledPrimitives,
  readDuxkitInstallConfig,
  type InstalledPrimitive,
} from './workspace-state.js';

export interface ListCommandOptions {
  readonly cwd?: string;
  readonly json?: boolean;
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
  const config = await readDuxkitInstallConfig(cwd);
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
      : output.installed.map(renderInstalledPrimitive).join('\n');

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

function renderInstalledPrimitive(primitive: InstalledPrimitive): string {
  const version = primitive.version === undefined ? '' : `@${primitive.version}`;

  return `  - ${primitive.id}${version} (${primitive.source})`;
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

import { resolve } from 'node:path';
import type { CliIo } from './cli.js';
import { inspectWorkspace, type WorkspaceInspection } from './workspace-state.js';

export interface InspectCommandOptions {
  readonly cwd?: string;
  readonly json?: boolean;
}

export async function runInspectCommand(options: InspectCommandOptions, io: CliIo): Promise<void> {
  const inspection = await inspectWorkspace(resolve(options.cwd ?? process.cwd()));

  if (options.json === true) {
    io.stdout.write(`${JSON.stringify(inspection, null, 2)}\n`);
    return;
  }

  io.stdout.write(renderHumanInspect(inspection));
}

function renderHumanInspect(inspection: WorkspaceInspection): string {
  return [
    'Workspace',
    `  root: ${inspection.root}`,
    `  type: ${inspection.type}`,
    `  package manager: ${inspection.packageManager.name} (${inspection.packageManager.source})`,
    '',
    'Project',
    `  selected: ${inspection.project?.name ?? 'None inferred'}`,
    `  candidates: ${inspection.projects.length === 0 ? 'None detected' : inspection.projects.map((project) => project.name).join(', ')}`,
    `  source root: ${inspection.project?.sourceRoot ?? 'Unknown'}`,
    `  stylesheet: ${inspection.stylesheet ?? 'None inferred'}`,
    `  style language: ${inspection.styleLanguage}`,
    `  component destination: ${inspection.componentDestination ?? 'None inferred'}`,
    '',
    'Duxkit config',
    `  path: ${inspection.config.path}`,
    `  exists: ${inspection.config.exists ? 'yes' : 'no'}`,
    `  valid: ${inspection.config.valid ? 'yes' : 'no'}`,
    ...inspection.config.errors.map((error) => `  error: ${error}`),
    '',
    'Tailwind',
    `  v4 imports: ${inspection.tailwind.v4Imports ? 'yes' : 'no'}`,
    `  source coverage: ${inspection.tailwind.sourceCoverage}`,
    `  required source path: ${inspection.tailwind.sourcePath ?? 'Unknown'}`,
    '',
    'Tokens',
    `  present: ${inspection.tokens.present.length === 0 ? 'None detected' : inspection.tokens.present.join(', ')}`,
    `  missing: ${inspection.tokens.missing.length === 0 ? 'None' : inspection.tokens.missing.join(', ')}`,
    '',
    'Installed primitives',
    ...renderInstalledPrimitives(inspection),
    '',
    'Missing dependencies',
    ...renderMissingDependencies(inspection),
    '',
  ].join('\n');
}

function renderInstalledPrimitives(inspection: WorkspaceInspection): readonly string[] {
  if (inspection.installedPrimitives.length === 0) {
    return ['  None detected'];
  }

  return inspection.installedPrimitives.map((primitive) => {
    const version = primitive.version === undefined ? '' : `@${primitive.version}`;

    return `  - ${primitive.id}${version} (${primitive.source})`;
  });
}

function renderMissingDependencies(inspection: WorkspaceInspection): readonly string[] {
  if (inspection.missingDependencies.length === 0) {
    return ['  None'];
  }

  return inspection.missingDependencies.map(
    (dependency) =>
      `  - ${dependency.name}@${dependency.version} (${dependency.section}, ${dependency.group})`,
  );
}

import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { DEFAULT_LIBRARY_PATH } from './library-path.js';
import {
  hasPrimitiveTemplate,
  listPrimitiveTemplates,
  readPrimitiveTemplateSource,
  type PrimitiveTemplateFile,
} from './primitive-templates.js';
import {
  listPrimitives,
  resolvePrimitivePlan,
  validatePrimitiveRegistry,
  type DependencySection,
  type DependencyGroup,
  type PrimitiveId,
  type PrimitivePackageDependency,
  type PrimitiveRegistryEntry,
} from './primitive-registry.js';
import {
  inspectWorkspace,
  type AngularApplicationProject,
  type PackageManagerName,
  type WorkspaceInspection,
} from './workspace-state.js';
import { checksumText } from './text-checksum.js';
import { createPackageInstallCommands } from './package-install-commands.js';

export interface AddPlannerOptions {
  readonly all?: boolean;
  readonly componentsPath?: string;
  readonly cwd?: string;
  readonly force?: boolean;
  readonly noInstall?: boolean;
  readonly packageManager?: Exclude<PackageManagerName, 'unknown'>;
  readonly project?: string;
  readonly yes?: boolean;
}

export type AddFileStatus = 'blocked' | 'create' | 'customized' | 'foreign' | 'unchanged';

export interface AddFilePlan {
  readonly checksum?: string;
  readonly file: string;
  readonly primitive: PrimitiveId;
  readonly status: AddFileStatus;
  readonly path: string;
  readonly reason?: string;
}

export interface AddPackagePlan {
  readonly group: DependencyGroup;
  readonly name: string;
  readonly section: DependencySection;
  readonly status: 'install' | 'unchanged';
  readonly version: string;
}

export interface AddConfigPlan {
  readonly action: 'create' | 'unchanged' | 'update';
  readonly after: Readonly<Record<string, unknown>>;
  readonly path: string;
}

export interface AddStylesheetPlan {
  readonly action: 'add' | 'blocked' | 'unchanged';
  readonly path: string | null;
  readonly reason?: string;
  readonly sourcePath: string | null;
}

export interface AddPlannedChange {
  readonly action: 'add' | 'create' | 'install' | 'update';
  readonly category: 'config' | 'file' | 'package' | 'stylesheet';
  readonly detail: string;
  readonly path?: string;
}

export interface AddPlan {
  readonly ambiguities: readonly string[];
  readonly command: 'add';
  readonly componentDestination: string | null;
  readonly config: AddConfigPlan | null;
  readonly conflicts: readonly AddFilePlan[];
  readonly errors: readonly string[];
  readonly files: readonly AddFilePlan[];
  readonly force: boolean;
  readonly included: readonly PrimitiveId[];
  readonly nextSteps: readonly string[];
  readonly packageManager: PackageManagerName;
  readonly packages: {
    readonly assumptions: readonly PrimitivePackageDependency[];
    readonly installCommands: readonly string[];
    readonly missing: readonly AddPackagePlan[];
    readonly required: readonly AddPackagePlan[];
  };
  readonly plannedChanges: readonly AddPlannedChange[];
  readonly project: AngularApplicationProject | null;
  readonly requested: readonly PrimitiveId[];
  readonly status: 'blocked' | 'ready';
  readonly stylesheet: string | null;
  readonly stylesheetPlan: AddStylesheetPlan | null;
  readonly stylesheetChanges: readonly AddFilePlan[];
  readonly warnings: readonly string[];
  readonly workspace: Pick<WorkspaceInspection, 'root' | 'type'>;
}

interface AddTemplate extends PrimitiveTemplateFile {
  readonly content: string;
}

interface ExistingTarget {
  readonly content: string;
  readonly file: string;
  readonly primitive: PrimitiveId;
  readonly path: string;
  readonly reason?: string;
  readonly status: AddFileStatus;
}

export async function createAddPlan(
  inputs: readonly string[],
  options: AddPlannerOptions = {},
  cwd = resolve(options.cwd ?? process.cwd()),
): Promise<AddPlan> {
  const inspection = await inspectWorkspace(cwd);
  const packageManager = options.packageManager ?? inspection.packageManager.name;
  const planContext = {
    command: 'add' as const,
    force: options.force === true,
    packageManager,
    project: selectProject(inspection, options.project),
    stylesheet: selectStylesheet(inspection, options.project),
    workspace: { root: inspection.root, type: inspection.type },
  };
  const ambiguities: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!inspection.config.valid) {
    errors.push(
      `Repair or remove the invalid duxkit-ai.json before adding primitives: ${inspection.config.errors.join(' ')}`,
    );
  }

  const project = planContext.project;

  if (options.project !== undefined && project === null) {
    ambiguities.push(`Project ${options.project} is not a detected Angular application project.`);
  } else if (project === null && inspection.projects.length > 1) {
    ambiguities.push(
      `Multiple Angular application projects were detected (${inspection.projects.map((candidate) => candidate.name).join(', ')}). Pass --project <name>.`,
    );
  } else if (project === null && inspection.projects.length === 0) {
    ambiguities.push('No Angular application project was detected. Pass --project <name>.');
  }

  const componentDestination = selectComponentDestination(
    inspection,
    project,
    options.componentsPath,
  );

  if (componentDestination === null) {
    ambiguities.push('A library path cannot be inferred. Pass --library-path <path>.');
  } else if (!isSafeWorkspacePath(componentDestination)) {
    errors.push(
      `The library path is unsafe: ${componentDestination}. It must be a relative path inside the workspace.`,
    );
  }

  if (
    options.project !== undefined &&
    inspection.config.value?.project !== undefined &&
    options.project !== inspection.config.value.project
  ) {
    ambiguities.push(
      'The explicit --project conflicts with duxkit-ai.json. Use the configured project or update the config with init.',
    );
  }

  const requestedInputs = options.all === true ? availablePrimitiveIds() : inputs;

  if (options.all === true && inputs.length > 0) {
    ambiguities.push('Do not combine --all with explicit primitive names.');
  }

  if (requestedInputs.length === 0) {
    ambiguities.push('No primitives were selected. Provide primitive names or pass --all.');
  }

  let requested: readonly PrimitiveRegistryEntry[] = [];
  let included: readonly PrimitiveRegistryEntry[] = [];
  let ordered: readonly PrimitiveRegistryEntry[] = [];

  try {
    validatePrimitiveRegistry(listPrimitives());
    const resolved = resolvePrimitivePlan(requestedInputs);
    requested = resolved.requested;
    included = resolved.included;
    ordered = resolved.ordered;

    for (const primitive of ordered) {
      if (primitive.status !== 'available') {
        errors.push(
          `Primitive ${primitive.id} is not available in this CLI release. Run "duxkit-ui list" for available primitives.`,
        );
      } else if (!hasPrimitiveTemplate(primitive.id)) {
        errors.push(`Primitive ${primitive.id} has no bundled template and cannot be added yet.`);
      }
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Primitive registry resolution failed.');
  }

  const requiredDependencies = resolveRequiredPackages(ordered);
  const installedPackages = await readInstalledPackageNames(inspection.root);
  const requiredPackages = requiredDependencies.map((dependency) => ({
    ...dependency,
    status: installedPackages.has(dependency.name) ? ('unchanged' as const) : ('install' as const),
  }));
  const missingPackages = requiredPackages.filter((dependency) => dependency.status === 'install');
  const skipInstall = options.noInstall === true;

  if (missingPackages.length > 0 && !skipInstall && packageManager === 'unknown') {
    ambiguities.push(
      'The workspace package manager could not be inferred. Pass --package-manager <npm|pnpm|yarn|bun>, or use --no-install.',
    );
  }

  const templates = await loadTemplates(ordered, errors);
  const files =
    componentDestination === null
      ? []
      : await classifyTargets(
          inspection.root,
          componentDestination,
          ordered,
          templates,
          inspection,
        );
  const conflicts = files.filter(
    (file) =>
      file.status === 'customized' || file.status === 'foreign' || file.status === 'blocked',
  );
  const unresolvedConflicts = conflicts.filter(
    (file) => !(options.force === true && file.status === 'customized'),
  );

  if (unresolvedConflicts.length > 0) {
    errors.push(
      `${unresolvedConflicts.length} generated file target(s) need attention. Customized files require --force and foreign files are never overwritten.`,
    );
  }

  const config =
    inspection.config.valid && componentDestination !== null && ordered.length > 0
      ? await createConfigPlan(inspection, project, componentDestination, ordered)
      : null;
  const stylesheetPlan =
    componentDestination === null
      ? null
      : await createStylesheetPlan(inspection, project, componentDestination, ambiguities, errors);
  const installCommands = createPackageInstallCommands(packageManager, missingPackages);
  const stylesheetChanges = files.filter((file) => isStylesheet(file.file));
  const plannedChanges = createPlannedChanges(
    config,
    requiredPackages,
    files,
    stylesheetChanges,
    stylesheetPlan,
    options.force === true,
  );

  if (skipInstall && missingPackages.length > 0) {
    warnings.push('Dependency installation was skipped by --no-install.');
  }

  const status = ambiguities.length === 0 && errors.length === 0 ? 'ready' : 'blocked';
  const nextSteps = createNextSteps(status, ambiguities, errors, installCommands);

  return {
    ...planContext,
    ambiguities,
    componentDestination,
    config,
    conflicts,
    errors,
    files,
    included: included.map((primitive) => primitive.id),
    nextSteps,
    packages: {
      assumptions: resolvePackageAssumptions(ordered),
      installCommands,
      missing: missingPackages,
      required: requiredPackages,
    },
    plannedChanges,
    project,
    requested: requested.map((primitive) => primitive.id),
    status,
    stylesheetPlan,
    stylesheetChanges,
    warnings,
  };
}

function availablePrimitiveIds(): readonly string[] {
  return listPrimitives()
    .filter((primitive) => primitive.status === 'available')
    .map((primitive) => primitive.id);
}

function selectProject(
  inspection: WorkspaceInspection,
  explicitProject: string | undefined,
): AngularApplicationProject | null {
  if (explicitProject !== undefined) {
    return inspection.projects.find((project) => project.name === explicitProject) ?? null;
  }

  return inspection.project;
}

function selectStylesheet(
  inspection: WorkspaceInspection,
  explicitProject: string | undefined,
): string | null {
  if (inspection.config.value?.stylesheet !== undefined) {
    return normalizePath(inspection.config.value.stylesheet);
  }

  const project = selectProject(inspection, explicitProject);

  return project?.stylesheets.length === 1 ? project.stylesheets[0] : null;
}

function selectComponentDestination(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject | null,
  explicitPath: string | undefined,
): string | null {
  if (explicitPath !== undefined) {
    return normalizePath(explicitPath);
  }

  if (inspection.config.value?.componentsPath !== undefined) {
    return normalizePath(inspection.config.value.componentsPath);
  }

  return project === null ? inspection.componentDestination : DEFAULT_LIBRARY_PATH;
}

async function loadTemplates(
  primitives: readonly PrimitiveRegistryEntry[],
  errors: string[],
): Promise<ReadonlyMap<string, AddTemplate>> {
  const templateByKey = new Map(
    listPrimitiveTemplates().map((template) => [
      templateKey(template.primitiveId, template.file),
      template,
    ]),
  );
  const loaded = new Map<string, AddTemplate>();

  for (const primitive of primitives) {
    if (!hasPrimitiveTemplate(primitive.id)) {
      continue;
    }

    for (const file of primitive.files) {
      const metadata = templateByKey.get(templateKey(primitive.id, file));

      if (metadata === undefined) {
        errors.push(`Primitive ${primitive.id} registry file has no bundled template: ${file}.`);
        continue;
      }

      try {
        const content = await readPrimitiveTemplateSource(metadata);
        loaded.set(templateKey(primitive.id, file), { ...metadata, content });
      } catch (error) {
        errors.push(
          `Unable to read the bundled template for ${primitive.id}/${file}: ${formatError(error)}.`,
        );
      }
    }
  }

  return loaded;
}

async function createStylesheetPlan(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject | null,
  componentDestination: string,
  ambiguities: string[],
  errors: string[],
): Promise<AddStylesheetPlan> {
  const sourceRequired =
    project === null ||
    project.sourceRoot === null ||
    project.sourceRoot === undefined ||
    !isInsidePath(project.sourceRoot, componentDestination);

  if (!sourceRequired) {
    return { action: 'unchanged', path: inspection.stylesheet, sourcePath: null };
  }

  if (inspection.stylesheet === null) {
    const reason =
      'The generated component path is outside the selected app source root, but no global stylesheet was inferred. Pass --stylesheet through init first.';
    ambiguities.push(reason);
    return { action: 'blocked', path: null, reason, sourcePath: null };
  }

  const sourcePath = formatRelativeCssPath(dirname(inspection.stylesheet), componentDestination);
  const stylesheetPath = join(inspection.root, inspection.stylesheet);
  let stylesheetText: string;

  try {
    stylesheetText = await readFile(stylesheetPath, 'utf8');
  } catch (error) {
    const reason = `The selected stylesheet could not be read: ${formatError(error)}.`;
    errors.push(reason);
    return { action: 'blocked', path: inspection.stylesheet, reason, sourcePath };
  }

  if (stylesheetHasSource(stylesheetText, sourcePath)) {
    return { action: 'unchanged', path: inspection.stylesheet, sourcePath };
  }

  return { action: 'add', path: inspection.stylesheet, sourcePath };
}

async function classifyTargets(
  workspaceRoot: string,
  componentDestination: string,
  primitives: readonly PrimitiveRegistryEntry[],
  templates: ReadonlyMap<string, AddTemplate>,
  inspection: WorkspaceInspection,
): Promise<readonly AddFilePlan[]> {
  const configuredIds = new Set(
    inspection.config.value?.primitives.map((primitive) => primitive.id),
  );
  const targets: ExistingTarget[] = [];

  for (const primitive of primitives) {
    for (const file of primitive.files) {
      const template = templates.get(templateKey(primitive.id, file));
      const targetPath = normalizePath(join(componentDestination, primitive.id, file));

      if (template === undefined) {
        targets.push({
          content: '',
          file,
          path: targetPath,
          primitive: primitive.id,
          reason: 'The bundled template is missing.',
          status: 'blocked',
        });
        continue;
      }

      if (!isSafeWorkspacePath(targetPath) || !isInsideWorkspace(workspaceRoot, targetPath)) {
        targets.push({
          content: '',
          file,
          path: targetPath,
          primitive: primitive.id,
          reason: 'The generated target escapes the workspace.',
          status: 'blocked',
        });
        continue;
      }

      const target = join(workspaceRoot, targetPath);
      const safetyError = await checkRealPathSafety(workspaceRoot, target);

      if (safetyError !== null) {
        targets.push({
          content: '',
          file,
          path: targetPath,
          primitive: primitive.id,
          reason: safetyError,
          status: 'blocked',
        });
        continue;
      }

      try {
        const targetStat = await stat(target);

        if (targetStat.isDirectory()) {
          targets.push({
            content: '',
            file,
            path: targetPath,
            primitive: primitive.id,
            reason: 'The target exists as a directory.',
            status: 'blocked',
          });
          continue;
        }

        const content = await readFile(target, 'utf8');
        targets.push({
          content,
          file,
          path: targetPath,
          primitive: primitive.id,
          status:
            canonicalizeGeneratedText(content) === canonicalizeGeneratedText(template.content)
              ? 'unchanged'
              : 'foreign',
        });
      } catch (error) {
        if (isNodeError(error) && error.code === 'ENOENT') {
          targets.push({
            content: template.content,
            file,
            path: targetPath,
            primitive: primitive.id,
            status: 'create',
          });
        } else {
          targets.push({
            content: '',
            file,
            path: targetPath,
            primitive: primitive.id,
            reason: `The target could not be read: ${formatError(error)}.`,
            status: 'blocked',
          });
        }
      }
    }
  }

  const exactGeneratedIds = new Set(
    targets.filter((target) => target.status === 'unchanged').map((target) => target.primitive),
  );
  const ownedIds = new Set([...configuredIds, ...exactGeneratedIds]);

  return targets.map((target) => ({
    checksum:
      target.status === 'unchanged' || target.status === 'foreign'
        ? checksumText(target.content)
        : undefined,
    file: target.file,
    path: target.path,
    primitive: target.primitive,
    reason: target.reason,
    status:
      target.status === 'foreign' && ownedIds.has(target.primitive) ? 'customized' : target.status,
  }));
}

async function checkRealPathSafety(workspaceRoot: string, target: string): Promise<string | null> {
  let candidate = target;

  while (true) {
    try {
      const resolved = await realpath(candidate);

      return isInsideResolvedPath(workspaceRoot, resolved)
        ? null
        : 'The target resolves through a symlink outside the workspace.';
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        const parent = resolve(candidate, '..');

        if (parent === candidate) {
          return 'The target has no existing workspace ancestor.';
        }

        candidate = parent;
        continue;
      }

      return `The target path could not be checked safely: ${formatError(error)}.`;
    }
  }
}

function resolveRequiredPackages(
  primitives: readonly PrimitiveRegistryEntry[],
): readonly AddPackagePlan[] {
  const dependencies: PrimitivePackageDependency[] = [];
  const seen = new Set<string>();

  for (const primitive of primitives) {
    for (const dependency of primitive.dependencies) {
      const key = `${dependency.section}:${dependency.name}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      dependencies.push(dependency);
    }
  }

  return dependencies.map((dependency) => ({ ...dependency, status: 'install' }));
}

function resolvePackageAssumptions(
  primitives: readonly PrimitiveRegistryEntry[],
): readonly PrimitivePackageDependency[] {
  const assumptions: PrimitivePackageDependency[] = [];
  const seen = new Set<string>();

  for (const primitive of primitives) {
    for (const assumption of primitive.peerAssumptions) {
      const key = `${assumption.section}:${assumption.name}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      assumptions.push(assumption);
    }
  }

  return assumptions;
}

async function readInstalledPackageNames(workspaceRoot: string): Promise<ReadonlySet<string>> {
  try {
    const parsed: unknown = JSON.parse(await readFile(join(workspaceRoot, 'package.json'), 'utf8'));

    if (!isRecord(parsed)) {
      return new Set();
    }

    const names = new Set<string>();

    for (const section of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ]) {
      const dependencies = parsed[section];

      if (!isRecord(dependencies)) {
        continue;
      }

      for (const name of Object.keys(dependencies)) {
        names.add(name);
      }
    }

    return names;
  } catch {
    return new Set();
  }
}

async function createConfigPlan(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject | null,
  componentDestination: string,
  primitives: readonly PrimitiveRegistryEntry[],
): Promise<AddConfigPlan> {
  const existing = await readJsonRecord(inspection.config.path);
  const after: Record<string, unknown> = { ...(existing ?? {}) };

  if (existing === null) {
    after['$schema'] = 'https://duxkit.com/schemas/duxkit-ai.json';
    if (project !== null) after['project'] = project.name;
    if (inspection.styleLanguage !== 'unknown') after['style'] = inspection.styleLanguage;
    if (inspection.stylesheet !== null) after['stylesheet'] = inspection.stylesheet;
  }

  after['componentsPath'] = componentDestination;

  if (isRecord(after['tailwind'])) {
    after['tailwind'] = {
      ...after['tailwind'],
      sourcePath: `./${componentDestination}`,
    };
  }

  const primitiveList = Array.isArray(after['primitives'])
    ? after['primitives'].filter((primitive): primitive is string => typeof primitive === 'string')
    : null;

  if (primitiveList !== null) {
    for (const primitive of primitives) {
      if (!primitiveList.includes(primitive.id)) {
        primitiveList.push(primitive.id);
      }
    }

    after['primitives'] = primitiveList;
  } else {
    const configuredPrimitives = isRecord(after['primitives']) ? { ...after['primitives'] } : {};

    for (const primitive of primitives) {
      configuredPrimitives[primitive.id] = primitive.version;
    }

    after['primitives'] = configuredPrimitives;
  }

  const beforeText = existing === null ? null : JSON.stringify(existing);
  const afterText = JSON.stringify(after);

  return {
    action: beforeText === afterText ? 'unchanged' : existing === null ? 'create' : 'update',
    after,
    path: 'duxkit-ai.json',
  };
}

function createPlannedChanges(
  config: AddConfigPlan | null,
  packages: readonly AddPackagePlan[],
  files: readonly AddFilePlan[],
  stylesheetChanges: readonly AddFilePlan[],
  stylesheetPlan: AddStylesheetPlan | null,
  force: boolean,
): readonly AddPlannedChange[] {
  const changes: AddPlannedChange[] = [];

  if (config !== null && config.action !== 'unchanged') {
    changes.push({
      action: config.action,
      category: 'config',
      detail: `${config.action === 'create' ? 'Create' : 'Update'} Duxkit AI primitive configuration.`,
      path: config.path,
    });
  }

  changes.push(
    ...packages
      .filter((dependency) => dependency.status === 'install')
      .map((dependency) => ({
        action: 'install' as const,
        category: 'package' as const,
        detail: `Install ${dependency.name}@${dependency.version} in ${dependency.section}.`,
      })),
  );

  changes.push(
    ...files
      .filter((file) => isWritableAddFile(force, file))
      .map((file) => ({
        action: file.status === 'create' ? ('create' as const) : ('update' as const),
        category: 'file' as const,
        detail: `${file.status === 'create' ? 'Create' : 'Update'} ${file.primitive}/${file.file}.`,
        path: file.path,
      })),
  );

  changes.push(
    ...stylesheetChanges
      .filter((file) => isWritableAddFile(force, file))
      .map((file) => ({
        action: file.status === 'create' ? ('create' as const) : ('update' as const),
        category: 'stylesheet' as const,
        detail: `${file.status === 'create' ? 'Create' : 'Update'} generated stylesheet ${file.path}.`,
        path: file.path,
      })),
  );

  if (stylesheetPlan?.action === 'add' && stylesheetPlan.path !== null) {
    changes.push({
      action: 'add',
      category: 'stylesheet',
      detail: `Add @source '${stylesheetPlan.sourcePath}' to ${stylesheetPlan.path}.`,
      path: stylesheetPlan.path,
    });
  }

  return changes;
}

function createNextSteps(
  status: AddPlan['status'],
  ambiguities: readonly string[],
  errors: readonly string[],
  installCommands: readonly string[],
): readonly string[] {
  if (status === 'ready') {
    return installCommands;
  }

  return [
    ...ambiguities,
    ...errors,
    ...(installCommands.length > 0
      ? [`Planned install command: ${installCommands.join(' && ')}`]
      : []),
  ];
}

function templateKey(primitive: PrimitiveId, file: string): string {
  return `${primitive}/${file}`;
}

function isStylesheet(file: string): boolean {
  return ['.css', '.less', '.sass', '.scss'].includes(extname(file));
}

function canonicalizeGeneratedText(text: string): string {
  return `${text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .trimEnd()}\n`;
}

function formatRelativeCssPath(fromDirectory: string, toPath: string): string {
  const path = normalizePath(relative(fromDirectory, toPath));

  return path.startsWith('.') ? path : `./${path}`;
}

export function isWritableAddFile(force: boolean, file: AddFilePlan): boolean {
  return file.status === 'create' || (force && file.status === 'customized');
}

export function stylesheetHasSource(stylesheetText: string, sourcePath: string): boolean {
  const normalizedSourcePath = normalizeCssPath(sourcePath);

  return [...stylesheetText.matchAll(/@source\s+["']([^"']+)["']/g)].some((match) =>
    isCssPathCovered(normalizeCssPath(match[1]), normalizedSourcePath),
  );
}

function normalizeCssPath(path: string): string {
  const normalized = normalizePath(path);

  return normalized.startsWith('./') ? normalized.slice(2) : normalized;
}

function isCssPathCovered(sourcePath: string, targetPath: string): boolean {
  return sourcePath === targetPath || targetPath.startsWith(`${sourcePath}/`);
}

function isInsidePath(parent: string, child: string): boolean {
  const relativePath = relative(parent, child);

  return (
    relativePath === '' || (!relativePath.startsWith('..') && !relativePath.includes(`..${sep}`))
  );
}

function isInsideWorkspace(workspaceRoot: string, path: string): boolean {
  return isInsideResolvedPath(resolve(workspaceRoot), resolve(workspaceRoot, path));
}

function isInsideResolvedPath(workspaceRoot: string, path: string): boolean {
  const relativePath = relative(workspaceRoot, path);

  return (
    relativePath === '' || (!relativePath.startsWith('..') && !relativePath.includes(`..${sep}`))
  );
}

function isSafeWorkspacePath(path: string): boolean {
  const normalized = normalizePath(path);
  const segments = normalized.split('/');

  return (
    normalized.length > 0 && !isAbsolute(path) && !segments.includes('') && !segments.includes('..')
  );
}

function normalizePath(path: string): string {
  return path.replace(/[\\/]+/g, '/');
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function readJsonRecord(path: string): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

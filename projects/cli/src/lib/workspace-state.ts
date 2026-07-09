import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import {
  listPrimitives,
  resolvePrimitivePlan,
  type PrimitiveId,
  type PrimitivePackageDependency,
  type PrimitiveRegistryEntry,
} from './primitive-registry.js';

export type WorkspaceType = 'angular-cli' | 'nx' | 'unknown';
export type PackageManagerName = 'bun' | 'npm' | 'pnpm' | 'yarn' | 'unknown';
export type StyleLanguage = 'css' | 'less' | 'sass' | 'scss' | 'unknown';

export interface DuxkitConfig {
  readonly aliases?: {
    readonly components?: string;
  };
  readonly componentsPath?: string;
  readonly path: string;
  readonly primitives: readonly ConfigPrimitive[];
  readonly project?: string;
  readonly style?: string;
  readonly stylesheet?: string;
  readonly tailwind?: {
    readonly sourcePath?: string;
    readonly version?: number;
  };
}

type PrimitiveInstallConfig = Pick<DuxkitConfig, 'componentsPath' | 'primitives'> &
  Partial<Pick<DuxkitConfig, 'project'>>;

export interface ConfigPrimitive {
  readonly id: PrimitiveId;
  readonly version?: string;
}

export interface ConfigInspection {
  readonly exists: boolean;
  readonly path: string;
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly value: DuxkitConfig | null;
}

export interface AngularApplicationProject {
  readonly name: string;
  readonly root: string;
  readonly sourceRoot: string | null;
  readonly stylesheets: readonly string[];
  readonly styleLanguage: StyleLanguage;
}

export interface PackageManagerInspection {
  readonly name: PackageManagerName;
  readonly source: 'lockfile' | 'packageManager' | 'unknown' | 'userAgent';
}

export interface InstalledPrimitive {
  readonly id: PrimitiveId;
  readonly source: 'config' | 'files';
  readonly version?: string;
}

export interface MissingDependency {
  readonly group: PrimitivePackageDependency['group'];
  readonly name: string;
  readonly section: PrimitivePackageDependency['section'];
  readonly version: string;
}

export interface TailwindInspection {
  readonly stylesheet: string | null;
  readonly sourceCoverage: 'covered-by-source-root' | 'explicit-source' | 'missing' | 'unknown';
  readonly sourcePath: string | null;
  readonly v4Imports: boolean;
}

export interface TokenInspection {
  readonly missing: readonly string[];
  readonly present: readonly string[];
}

export interface WorkspaceInspection {
  readonly componentDestination: string | null;
  readonly config: ConfigInspection;
  readonly installedPrimitives: readonly InstalledPrimitive[];
  readonly missingDependencies: readonly MissingDependency[];
  readonly packageManager: PackageManagerInspection;
  readonly project: AngularApplicationProject | null;
  readonly projects: readonly AngularApplicationProject[];
  readonly root: string;
  readonly stylesheet: string | null;
  readonly styleLanguage: StyleLanguage;
  readonly tailwind: TailwindInspection;
  readonly tokens: TokenInspection;
  readonly type: WorkspaceType;
}

interface WorkspaceMetadata {
  readonly root: string;
  readonly type: WorkspaceType;
}

const coreTokens = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--border',
  '--input',
  '--ring',
  '--radius',
] as const;

export async function inspectWorkspace(cwd = process.cwd()): Promise<WorkspaceInspection> {
  const workspace = await detectWorkspaceRoot(resolve(cwd));
  const parsedConfig = await readDuxkitConfig(workspace.root);
  const projects = await detectAngularApplicationProjects(workspace.root);
  const config = await validateConfigForWorkspace(parsedConfig, workspace.root, projects);
  const project = selectProject(projects, config.value);
  const stylesheet = selectStylesheet(project, config.value);
  const styleLanguage = inferStyleLanguage(stylesheet, project, config.value);
  const componentDestination = selectComponentDestination(project, config.value);
  const packageManager = await detectPackageManager(workspace.root);
  const installedPrimitives = await detectInstalledPrimitives(workspace.root, config.value);
  const missingDependencies = await detectMissingDependencies(workspace.root, installedPrimitives);
  const tailwind = await inspectTailwind(workspace.root, project, stylesheet, componentDestination);
  const tokens = await inspectTokens(workspace.root, stylesheet);

  return {
    componentDestination,
    config,
    installedPrimitives,
    missingDependencies,
    packageManager,
    project,
    projects,
    root: workspace.root,
    stylesheet,
    styleLanguage,
    tailwind,
    tokens,
    type: workspace.type,
  };
}

export async function readDuxkitConfig(workspaceRoot: string): Promise<ConfigInspection> {
  const path = join(workspaceRoot, 'duxkit-ai.json');

  try {
    const text = await readFile(path, 'utf8');

    return parseDuxkitConfig(path, text);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return {
        errors: [],
        exists: false,
        path,
        valid: true,
        value: null,
      };
    }

    throw error;
  }
}

export async function readDuxkitInstallConfig(
  workspaceRoot: string,
): Promise<PrimitiveInstallConfig | null> {
  const text = await readOptionalText(join(workspaceRoot, 'duxkit-ai.json'));

  if (text === null) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }

  return {
    componentsPath:
      typeof parsed['componentsPath'] === 'string' && parsed['componentsPath'].trim().length > 0
        ? parsed['componentsPath']
        : undefined,
    primitives: readConfigPrimitives(parsed['primitives'], []),
  };
}

export async function detectInstalledPrimitives(
  workspaceRoot: string,
  config: PrimitiveInstallConfig | null,
): Promise<readonly InstalledPrimitive[]> {
  const installed = new Map<PrimitiveId, InstalledPrimitive>();
  const componentsPaths = await detectComponentsPaths(workspaceRoot, config);

  for (const primitive of config?.primitives ?? []) {
    installed.set(primitive.id, { id: primitive.id, source: 'config', version: primitive.version });
  }

  for (const primitive of listPrimitives()) {
    if (installed.has(primitive.id)) {
      continue;
    }

    if (await hasPrimitiveFiles(workspaceRoot, componentsPaths, primitive)) {
      installed.set(primitive.id, { id: primitive.id, source: 'files' });
    }
  }

  return [...installed.values()];
}

async function detectWorkspaceRoot(cwd: string): Promise<WorkspaceMetadata> {
  let current = cwd;
  let projectJsonFallback: string | null = null;

  while (true) {
    if (
      (await pathExists(join(current, 'nx.json'))) ||
      (await pathExists(join(current, 'workspace.json')))
    ) {
      return { root: current, type: 'nx' };
    }

    if (await pathExists(join(current, 'angular.json'))) {
      return { root: current, type: 'angular-cli' };
    }

    if (projectJsonFallback === null && (await pathExists(join(current, 'project.json')))) {
      projectJsonFallback = current;
    }

    const parent = dirname(current);

    if (parent === current) {
      return {
        root: projectJsonFallback ?? cwd,
        type: projectJsonFallback === null ? 'unknown' : 'nx',
      };
    }

    current = parent;
  }
}

function parseDuxkitConfig(path: string, text: string): ConfigInspection {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'duxkit-ai.json is invalid JSON.'],
      exists: true,
      path,
      valid: false,
      value: null,
    };
  }

  if (!isRecord(parsed)) {
    return {
      errors: ['duxkit-ai.json must contain an object.'],
      exists: true,
      path,
      valid: false,
      value: null,
    };
  }

  const config: DuxkitConfig = {
    aliases: readAliases(parsed, errors),
    componentsPath: readOptionalString(parsed, 'componentsPath', errors),
    path,
    primitives: readConfigPrimitives(parsed['primitives'], errors),
    project: readOptionalString(parsed, 'project', errors),
    style: readOptionalString(parsed, 'style', errors),
    stylesheet: readOptionalString(parsed, 'stylesheet', errors),
    tailwind: readTailwindConfig(parsed['tailwind'], errors),
  };

  return {
    errors,
    exists: true,
    path,
    valid: errors.length === 0,
    value: errors.length === 0 ? config : null,
  };
}

async function validateConfigForWorkspace(
  config: ConfigInspection,
  workspaceRoot: string,
  projects: readonly AngularApplicationProject[],
): Promise<ConfigInspection> {
  if (!config.valid || config.value === null) {
    return config;
  }

  const errors: string[] = [];

  if (
    config.value.project !== undefined &&
    !projects.some((project) => project.name === config.value?.project)
  ) {
    errors.push(`duxkit-ai.json project does not match an application project: ${config.value.project}.`);
  }

  if (config.value.style !== undefined && toStyleLanguage(config.value.style) === 'unknown') {
    errors.push(`duxkit-ai.json style is not supported: ${config.value.style}.`);
  }

  for (const [label, path] of [
    ['componentsPath', config.value.componentsPath],
    ['stylesheet', config.value.stylesheet],
  ] as const) {
    if (path !== undefined && !isSafeWorkspacePath(path)) {
      errors.push(`duxkit-ai.json ${label} must be a relative path inside the workspace.`);
    }
  }

  if (
    config.value.stylesheet !== undefined &&
    isSafeWorkspacePath(config.value.stylesheet) &&
    !(await pathExists(join(workspaceRoot, config.value.stylesheet)))
  ) {
    errors.push(`duxkit-ai.json stylesheet does not exist: ${config.value.stylesheet}.`);
  }

  return {
    ...config,
    errors: [...config.errors, ...errors],
    valid: errors.length === 0,
    value: errors.length === 0 ? config.value : null,
  };
}

function readAliases(
  source: Readonly<Record<string, unknown>>,
  errors: string[],
): DuxkitConfig['aliases'] {
  const value = source['aliases'];

  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    errors.push('duxkit-ai.json aliases must be an object.');
    return undefined;
  }

  return {
    components: readOptionalString(value, 'components', errors, 'aliases.components'),
  };
}

function readTailwindConfig(
  value: unknown,
  errors: string[],
): DuxkitConfig['tailwind'] {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    errors.push('duxkit-ai.json tailwind must be an object.');
    return undefined;
  }

  const version = value['version'];

  if (version !== undefined && typeof version !== 'number') {
    errors.push('duxkit-ai.json tailwind.version must be a number.');
  }

  return {
    sourcePath: readOptionalString(value, 'sourcePath', errors, 'tailwind.sourcePath'),
    version: typeof version === 'number' ? version : undefined,
  };
}

function readConfigPrimitives(value: unknown, errors: string[]): readonly ConfigPrimitive[] {
  if (value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => readPrimitiveArrayEntry(entry, index, errors));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([id, version]) =>
      readPrimitiveRecordEntry(id, version, errors),
    );
  }

  errors.push('duxkit-ai.json primitives must be an object or array.');
  return [];
}

function readPrimitiveArrayEntry(
  value: unknown,
  index: number,
  errors: string[],
): readonly ConfigPrimitive[] {
  if (typeof value !== 'string') {
    errors.push(`duxkit-ai.json primitives[${index}] must be a string.`);
    return [];
  }

  if (!isPrimitiveId(value)) {
    errors.push(`duxkit-ai.json primitives[${index}] has unknown primitive id: ${value}.`);
    return [];
  }

  return [{ id: value }];
}

function readPrimitiveRecordEntry(
  id: string,
  value: unknown,
  errors: string[],
): readonly ConfigPrimitive[] {
  if (!isPrimitiveId(id)) {
    errors.push(`duxkit-ai.json primitives has unknown primitive id: ${id}.`);
    return [];
  }

  if (typeof value === 'string') {
    return [{ id, version: value }];
  }

  if (isRecord(value)) {
    const version = value['version'];

    if (version !== undefined && typeof version !== 'string') {
      errors.push(`duxkit-ai.json primitives.${id}.version must be a string.`);
      return [];
    }

    return [{ id, version }];
  }

  errors.push(`duxkit-ai.json primitives.${id} must be a string or object.`);
  return [];
}

async function detectAngularApplicationProjects(
  workspaceRoot: string,
): Promise<readonly AngularApplicationProject[]> {
  const byName = new Map<string, AngularApplicationProject>();

  for (const project of [
    ...(await readWorkspaceProjects(workspaceRoot, 'angular.json')),
    ...(await readWorkspaceProjects(workspaceRoot, 'workspace.json')),
    ...(await readProjectJsonProjects(workspaceRoot)),
  ]) {
    byName.set(project.name, project);
  }

  return [...byName.values()].sort((left, right) => left.name.localeCompare(right.name));
}

async function readWorkspaceProjects(
  workspaceRoot: string,
  workspaceFile: string,
): Promise<readonly AngularApplicationProject[]> {
  const parsed = await readJsonObject(join(workspaceRoot, workspaceFile));

  if (parsed === null) {
    return [];
  }

  const projects = parsed['projects'];

  if (!isRecord(projects)) {
    return [];
  }

  const results: AngularApplicationProject[] = [];
  const defaultStyleLanguage = readWorkspaceStyleDefault(parsed);

  for (const [name, value] of Object.entries(projects)) {
    results.push(
      ...(await readWorkspaceProjectEntry(name, value, workspaceRoot, defaultStyleLanguage)),
    );
  }

  return results;
}

async function readWorkspaceProjectEntry(
  name: string,
  value: unknown,
  workspaceRoot: string,
  defaultStyleLanguage: StyleLanguage,
): Promise<readonly AngularApplicationProject[]> {
  if (typeof value === 'string') {
    const projectJson = await readJsonObject(join(workspaceRoot, value, 'project.json'));

    return projectJson === null
      ? []
      : readProjectDefinition(name, projectJson, workspaceRoot, defaultStyleLanguage);
  }

  return readProjectDefinition(name, value, workspaceRoot, defaultStyleLanguage);
}

async function readProjectJsonProjects(
  workspaceRoot: string,
): Promise<readonly AngularApplicationProject[]> {
  const paths = await findProjectJsonFiles(workspaceRoot);
  const projects: AngularApplicationProject[] = [];

  for (const path of paths) {
    const parsed = await readJsonObject(path);

    if (parsed === null || typeof parsed['name'] !== 'string') {
      continue;
    }

    projects.push(...(await readProjectDefinition(parsed['name'], parsed, workspaceRoot)));
  }

  return projects;
}

async function readProjectDefinition(
  name: string,
  value: unknown,
  workspaceRoot: string,
  defaultStyleLanguage: StyleLanguage = 'unknown',
): Promise<readonly AngularApplicationProject[]> {
  if (!isRecord(value) || value['projectType'] !== 'application') {
    return [];
  }

  const root = readProjectString(value, 'root') ?? '';
  const explicitSourceRoot = readProjectString(value, 'sourceRoot');
  const fallbackSourceRoot = root.length === 0 ? 'src' : `${root}/src`;
  const sourceRoot =
    explicitSourceRoot ??
    ((await pathExists(join(workspaceRoot, fallbackSourceRoot))) ? fallbackSourceRoot : null);
  const buildTarget = readBuildTarget(value);
  const stylesheets = readStylesheets(buildTarget);

  return [
    {
      name,
      root: normalizeWorkspacePath(root),
      sourceRoot: sourceRoot === null ? null : normalizeWorkspacePath(sourceRoot),
      styleLanguage: firstKnownStyleLanguage(
        inferStyleLanguageFromStylesheet(stylesheets[0]),
        defaultStyleLanguage,
      ),
      stylesheets,
    },
  ];
}

function readWorkspaceStyleDefault(source: Readonly<Record<string, unknown>>): StyleLanguage {
  for (const section of ['schematics', 'generators']) {
    const value = source[section];

    if (!isRecord(value)) {
      continue;
    }

    for (const key of ['@schematics/angular:component', '@nx/angular:component']) {
      const componentConfig = value[key];

      if (!isRecord(componentConfig) || typeof componentConfig['style'] !== 'string') {
        continue;
      }

      const language = toStyleLanguage(componentConfig['style']);

      if (language !== 'unknown') {
        return language;
      }
    }
  }

  return 'unknown';
}

function readBuildTarget(
  value: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> | null {
  const targets = isRecord(value['targets']) ? value['targets'] : value['architect'];

  if (!isRecord(targets)) {
    return null;
  }

  const build = targets['build'];

  return isRecord(build) ? build : null;
}

function readStylesheets(
  buildTarget: Readonly<Record<string, unknown>> | null,
): readonly string[] {
  const options =
    buildTarget === null || !isRecord(buildTarget['options']) ? null : buildTarget['options'];

  if (options === null || !Array.isArray(options['styles'])) {
    return [];
  }

  return options['styles'].flatMap((style) => {
    if (typeof style === 'string') {
      return [normalizeWorkspacePath(style)];
    }

    if (!isRecord(style) || style['inject'] === false || typeof style['input'] !== 'string') {
      return [];
    }

    return [normalizeWorkspacePath(style['input'])];
  });
}

async function findProjectJsonFiles(workspaceRoot: string): Promise<readonly string[]> {
  const results: string[] = [];
  await collectProjectJsonFiles(workspaceRoot, results);
  return results;
}

async function collectProjectJsonFiles(directory: string, results: string[]): Promise<void> {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
      continue;
    }

    const path = join(directory, entry.name);

    if (entry.isFile() && entry.name === 'project.json') {
      results.push(path);
      continue;
    }

    if (entry.isDirectory()) {
      await collectProjectJsonFiles(path, results);
    }
  }
}

async function readJsonObject(path: string): Promise<Readonly<Record<string, unknown>> | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));

    return isRecord(parsed) ? parsed : null;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function selectProject(
  projects: readonly AngularApplicationProject[],
  config: Pick<DuxkitConfig, 'project'> | null,
): AngularApplicationProject | null {
  const configuredProject =
    config?.project === undefined
      ? undefined
      : projects.find((project) => project.name === config.project);

  if (configuredProject !== undefined) {
    return configuredProject;
  }

  return projects.length === 1 ? projects[0] : null;
}

function selectStylesheet(
  project: AngularApplicationProject | null,
  config: DuxkitConfig | null,
): string | null {
  if (config?.stylesheet !== undefined) {
    return normalizeWorkspacePath(config.stylesheet);
  }

  if (project?.stylesheets.length === 1) {
    return project.stylesheets[0];
  }

  return null;
}

function inferStyleLanguage(
  stylesheet: string | null,
  project: AngularApplicationProject | null,
  config: DuxkitConfig | null,
): StyleLanguage {
  if (config?.style !== undefined) {
    return toStyleLanguage(config.style);
  }

  return firstKnownStyleLanguage(
    inferStyleLanguageFromStylesheet(stylesheet),
    project?.styleLanguage ?? 'unknown',
  );
}

function inferStyleLanguageFromStylesheet(stylesheet: string | null | undefined): StyleLanguage {
  if (stylesheet === null || stylesheet === undefined) {
    return 'unknown';
  }

  return toStyleLanguage(extname(stylesheet).slice(1));
}

function toStyleLanguage(value: string): StyleLanguage {
  if (value === 'css' || value === 'less' || value === 'sass' || value === 'scss') {
    return value;
  }

  return 'unknown';
}

function firstKnownStyleLanguage(
  preferred: StyleLanguage,
  fallback: StyleLanguage,
): StyleLanguage {
  return preferred === 'unknown' ? fallback : preferred;
}

function selectComponentDestination(
  project: AngularApplicationProject | null,
  config: Pick<DuxkitConfig, 'componentsPath'> | null,
): string | null {
  if (config?.componentsPath !== undefined) {
    return normalizeWorkspacePath(config.componentsPath);
  }

  if (project?.sourceRoot !== null && project?.sourceRoot !== undefined) {
    return normalizeWorkspacePath(join(project.sourceRoot, 'app/components/ai'));
  }

  return null;
}

async function detectPackageManager(workspaceRoot: string): Promise<PackageManagerInspection> {
  for (const [file, name] of [
    ['pnpm-lock.yaml', 'pnpm'],
    ['package-lock.json', 'npm'],
    ['npm-shrinkwrap.json', 'npm'],
    ['yarn.lock', 'yarn'],
    ['bun.lockb', 'bun'],
    ['bun.lock', 'bun'],
  ] as const) {
    if (await pathExists(join(workspaceRoot, file))) {
      return { name, source: 'lockfile' };
    }
  }

  const packageJson = await readJsonObject(join(workspaceRoot, 'package.json'));
  const packageManager = packageJson?.['packageManager'];

  if (typeof packageManager === 'string') {
    const name = packageManager.split('@')[0];

    if (name === 'bun' || name === 'npm' || name === 'pnpm' || name === 'yarn') {
      return { name, source: 'packageManager' };
    }
  }

  const userAgent = process.env['npm_config_user_agent'] ?? '';
  const userAgentName = userAgent.split('/')[0];

  if (
    userAgentName === 'bun' ||
    userAgentName === 'npm' ||
    userAgentName === 'pnpm' ||
    userAgentName === 'yarn'
  ) {
    return { name: userAgentName, source: 'userAgent' };
  }

  return { name: 'unknown', source: 'unknown' };
}

async function detectMissingDependencies(
  workspaceRoot: string,
  installedPrimitives: readonly InstalledPrimitive[],
): Promise<readonly MissingDependency[]> {
  if (installedPrimitives.length === 0) {
    return [];
  }

  const packageJson = await readJsonObject(join(workspaceRoot, 'package.json'));
  const packageNames = new Set<string>();

  for (const section of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    const dependencies = packageJson?.[section];

    if (!isRecord(dependencies)) {
      continue;
    }

    for (const name of Object.keys(dependencies)) {
      packageNames.add(name);
    }
  }

  const plan = resolvePrimitivePlan(installedPrimitives.map((primitive) => primitive.id));

  return plan.dependencies
    .filter((dependency) => !packageNames.has(dependency.name))
    .map((dependency) => ({
      group: dependency.group,
      name: dependency.name,
      section: dependency.section,
      version: dependency.version,
    }));
}

async function inspectTailwind(
  workspaceRoot: string,
  project: AngularApplicationProject | null,
  stylesheet: string | null,
  componentDestination: string | null,
): Promise<TailwindInspection> {
  if (stylesheet === null || componentDestination === null) {
    return {
      sourceCoverage: 'unknown',
      sourcePath: null,
      stylesheet,
      v4Imports: false,
    };
  }

  const stylesheetText = await readOptionalText(join(workspaceRoot, stylesheet));
  const v4Imports = stylesheetText?.includes('tailwindcss') ?? false;
  const sourcePath = formatRelativeCssPath(dirname(stylesheet), componentDestination);
  const sourceCoverage = detectTailwindSourceCoverage(
    v4Imports,
    stylesheetText,
    project,
    componentDestination,
    sourcePath,
  );

  return {
    sourceCoverage,
    sourcePath,
    stylesheet,
    v4Imports,
  };
}

async function inspectTokens(
  workspaceRoot: string,
  stylesheet: string | null,
): Promise<TokenInspection> {
  const stylesheetText =
    stylesheet === null ? null : await readOptionalText(join(workspaceRoot, stylesheet));
  const present =
    stylesheetText === null
      ? []
      : coreTokens.filter((token) =>
          new RegExp(`${escapeRegExp(token)}\\s*:`).test(stylesheetText),
        );
  const presentSet = new Set(present);

  return {
    missing: coreTokens.filter((token) => !presentSet.has(token)),
    present,
  };
}

function detectTailwindSourceCoverage(
  v4Imports: boolean,
  stylesheetText: string | null,
  project: AngularApplicationProject | null,
  componentDestination: string,
  sourcePath: string,
): TailwindInspection['sourceCoverage'] {
  if (!v4Imports) {
    return 'missing';
  }

  if (
    project?.sourceRoot !== null &&
    project?.sourceRoot !== undefined &&
    isInsideOrEqual(project.sourceRoot, componentDestination)
  ) {
    return 'covered-by-source-root';
  }

  return stylesheetText !== null && stylesheetHasSource(stylesheetText, sourcePath)
    ? 'explicit-source'
    : 'missing';
}

async function detectComponentsPaths(
  workspaceRoot: string,
  config: PrimitiveInstallConfig | null,
): Promise<readonly string[]> {
  const paths = new Set<string>();
  const inspection = await inspectWorkspaceForComponentDefaults(workspaceRoot, config);

  if (config?.componentsPath !== undefined) {
    paths.add(config.componentsPath);
  }

  if (inspection.componentDestination !== null) {
    paths.add(inspection.componentDestination);
  }

  paths.add('src/app/components/ai');

  for (const root of ['apps', 'projects']) {
    for (const child of await readDirectoryNames(join(workspaceRoot, root))) {
      paths.add(`${root}/${child}/src/app/components/ai`);
    }
  }

  return [...paths];
}

async function inspectWorkspaceForComponentDefaults(
  workspaceRoot: string,
  config: PrimitiveInstallConfig | null,
): Promise<Pick<WorkspaceInspection, 'componentDestination'>> {
  const projects = await detectAngularApplicationProjects(workspaceRoot);
  const project = selectProject(projects, config);

  return {
    componentDestination: selectComponentDestination(project, config),
  };
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
  workspaceRoot: string,
  componentsPaths: readonly string[],
  primitive: PrimitiveRegistryEntry,
): Promise<boolean> {
  for (const componentsPath of componentsPaths) {
    for (const file of primitive.files) {
      if (await pathExists(join(workspaceRoot, componentsPath, primitive.id, file))) {
        return true;
      }
    }
  }

  return false;
}

async function readOptionalText(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function readOptionalString(
  source: Readonly<Record<string, unknown>>,
  key: string,
  errors: string[],
  label = key,
): string | undefined {
  const value = source[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0 ? value : undefined;
  }

  errors.push(`duxkit-ai.json ${label} must be a string.`);
  return undefined;
}

function readProjectString(
  source: Readonly<Record<string, unknown>>,
  key: string,
): string | undefined {
  const value = source[key];

  return typeof value === 'string' ? value : undefined;
}

function stylesheetHasSource(stylesheetText: string, sourcePath: string): boolean {
  const sourcePaths = [...stylesheetText.matchAll(/@source\s+["']([^"']+)["']/g)].map((match) =>
    normalizeCssSourcePath(match[1]),
  );
  const normalizedSourcePath = normalizeCssSourcePath(sourcePath);

  return sourcePaths.some(
    (path) => path === normalizedSourcePath || isInsideOrEqual(path, normalizedSourcePath),
  );
}

function formatRelativeCssPath(fromDirectory: string, toPath: string): string {
  const relativePath = normalizeWorkspacePath(relative(fromDirectory, toPath));

  if (relativePath.startsWith('.')) {
    return relativePath;
  }

  return `./${relativePath}`;
}

function isInsideOrEqual(parent: string, child: string): boolean {
  const relativePath = relative(parent, child);

  return (
    relativePath === '' || (!relativePath.startsWith('..') && !relativePath.includes(`..${sep}`))
  );
}

function normalizeWorkspacePath(path: string): string {
  return path.replace(/[\\/]+/g, '/');
}

function normalizeCssSourcePath(path: string): string {
  const normalizedPath = normalizeWorkspacePath(path);

  return normalizedPath.startsWith('./') ? normalizedPath.slice(2) : normalizedPath;
}

function isSafeWorkspacePath(path: string): boolean {
  const normalizedPath = normalizeWorkspacePath(path);
  const segments = normalizedPath.split('/');

  return (
    normalizedPath.length > 0 &&
    !isAbsolute(path) &&
    !segments.includes('..') &&
    !segments.includes('')
  );
}

function isPrimitiveId(value: string): value is PrimitiveId {
  return listPrimitives().some((primitive) => primitive.id === value);
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

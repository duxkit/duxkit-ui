import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import {
  inspectWorkspace,
  type AngularApplicationProject,
  type PackageManagerName,
  type StyleLanguage,
  type WorkspaceInspection,
} from './workspace-state.js';

export type InitMode = 'add' | 'skip' | 'require-existing';

export interface InitPlannerOptions {
  readonly componentsPath?: string;
  readonly cwd?: string;
  readonly force?: boolean;
  readonly packageManager?: Exclude<PackageManagerName, 'unknown'>;
  readonly postcss?: InitMode;
  readonly project?: string;
  readonly style?: string;
  readonly stylesheet?: string;
  readonly tailwind?: InitMode;
  readonly tokens?: InitMode;
  readonly yes?: boolean;
}

export interface InitPackageChange {
  readonly name: string;
  readonly reason: string;
  readonly section: 'dependencies' | 'devDependencies';
  readonly version: string;
}

export interface InitPlannedChange {
  readonly action: 'add' | 'create' | 'install' | 'update';
  readonly category: 'config' | 'directory' | 'package' | 'postcss' | 'tailwind' | 'tokens';
  readonly detail: string;
  readonly path?: string;
}

export interface InitAmbiguity {
  readonly flag: string;
  readonly message: string;
}

export interface InitConfigPlan {
  readonly action: 'create' | 'update' | 'unchanged';
  readonly after: Readonly<Record<string, unknown>>;
  readonly path: string;
}

export interface InitPostCssPlan {
  readonly action: 'create' | 'manual' | 'skip' | 'unchanged' | 'update';
  readonly after: Readonly<Record<string, unknown>> | null;
  readonly path: string | null;
  readonly plugin: '@tailwindcss/postcss';
}

export interface InitTailwindPlan {
  readonly action: 'add' | 'manual' | 'skip' | 'unchanged';
  readonly imports: readonly string[];
  readonly sourceCoverage: 'covered-by-source-root' | 'explicit-source' | 'missing';
  readonly sourcePath: string;
  readonly sourceRequired: boolean;
}

export interface InitTokenPlan {
  readonly action: 'add' | 'skip' | 'unchanged';
  readonly missing: readonly string[];
  readonly declarations: readonly string[];
}

export interface InitDirectoryPlan {
  readonly action: 'create' | 'unchanged';
  readonly path: string;
}

export interface InitPlan {
  readonly ambiguities: readonly InitAmbiguity[];
  readonly command: 'init';
  readonly config: InitConfigPlan | null;
  readonly directory: InitDirectoryPlan | null;
  readonly packageManager: PackageManagerName;
  readonly packages: {
    readonly installCommands: readonly string[];
    readonly missing: readonly InitPackageChange[];
    readonly required: readonly InitPackageChange[];
  };
  readonly plannedChanges: readonly InitPlannedChange[];
  readonly postcss: InitPostCssPlan | null;
  readonly project: AngularApplicationProject | null;
  readonly nextSteps: readonly string[];
  readonly status: 'blocked' | 'ready';
  readonly stylesheet: string | null;
  readonly tailwind: InitTailwindPlan | null;
  readonly tokens: InitTokenPlan | null;
  readonly warnings: readonly string[];
  readonly workspace: Pick<WorkspaceInspection, 'root' | 'type'>;
}

const themeTokens = [
  ['--background', 'oklch(1 0 0)'],
  ['--foreground', 'oklch(0.145 0 0)'],
  ['--card', 'oklch(1 0 0)'],
  ['--card-foreground', 'oklch(0.145 0 0)'],
  ['--popover', 'oklch(1 0 0)'],
  ['--popover-foreground', 'oklch(0.145 0 0)'],
  ['--primary', 'oklch(0.205 0 0)'],
  ['--primary-foreground', 'oklch(0.985 0 0)'],
  ['--secondary', 'oklch(0.97 0 0)'],
  ['--secondary-foreground', 'oklch(0.205 0 0)'],
  ['--muted', 'oklch(0.97 0 0)'],
  ['--muted-foreground', 'oklch(0.556 0 0)'],
  ['--accent', 'oklch(0.97 0 0)'],
  ['--accent-foreground', 'oklch(0.205 0 0)'],
  ['--destructive', 'oklch(0.577 0.245 27.325)'],
  ['--border', 'oklch(0.922 0 0)'],
  ['--input', 'oklch(0.922 0 0)'],
  ['--ring', 'oklch(0.708 0 0)'],
  ['--radius', '0.625rem'],
] as const;

const requiredTailwindImports = [
  "@import 'tailwindcss/theme.css' layer(theme);",
  "@import 'tailwindcss/preflight.css' layer(base);",
  "@import 'tailwindcss/utilities.css';",
  "@import '@spartan-ng/brain/hlm-tailwind-preset.css';",
] as const;

const packageRequirements = {
  brain: {
    name: '@spartan-ng/brain',
    reason: 'Duxkit AI generated components use Spartan Brain primitives.',
    section: 'dependencies',
    version: '^1.0.2',
  },
  twAnimate: {
    name: 'tw-animate-css',
    reason: 'Duxkit AI theme utilities use the Tailwind animation package.',
    section: 'dependencies',
    version: '^1.4.0',
  },
  tailwind: {
    name: 'tailwindcss',
    reason: 'Tailwind CSS v4 is required for the generated component styles.',
    section: 'devDependencies',
    version: '^4.3.1',
  },
  postcss: {
    name: '@tailwindcss/postcss',
    reason: 'PostCSS must load the Tailwind CSS v4 plugin.',
    section: 'devDependencies',
    version: '^4.3.1',
  },
} as const satisfies Record<string, InitPackageChange>;

export async function createInitPlan(
  options: InitPlannerOptions = {},
  cwd = resolve(options.cwd ?? process.cwd()),
): Promise<InitPlan> {
  const inspection = await inspectWorkspace(cwd);
  const ambiguities: InitAmbiguity[] = [];
  const warnings: string[] = [];
  if (!inspection.config.valid) {
    ambiguities.push({
      flag: 'duxkit-ai.json',
      message: `Repair or remove the invalid duxkit-ai.json before initializing: ${inspection.config.errors.join(' ')}`,
    });
  }

  addConfigConflicts(inspection, options, ambiguities);

  const project = selectInitProject(inspection, options.project);

  if (project === null) {
    ambiguities.push({
      flag: '--project <name>',
      message:
        inspection.projects.length === 0
          ? 'No Angular application project was detected. Pass --project with a valid application project.'
          : `Multiple Angular application projects were detected (${inspection.projects.map((candidate) => candidate.name).join(', ')}). Pass --project <name>.`,
    });
  }

  const stylesheet = selectInitStylesheet(inspection, project, options.stylesheet);

  if (stylesheet === null) {
    ambiguities.push({
      flag: '--stylesheet <path>',
      message:
        project === null
          ? 'A stylesheet cannot be inferred until an application project is selected. Pass --project and --stylesheet.'
          : project.stylesheets.length === 0
            ? `Project ${project.name} has no injected global stylesheet. Pass --stylesheet <path>.`
            : `Project ${project.name} has multiple injected global stylesheets (${project.stylesheets.join(', ')}). Pass --stylesheet <path>.`,
    });
  }

  const componentsPath = selectInitComponentsPath(inspection, project, options.componentsPath);
  const style = selectInitStyle(inspection, project, stylesheet, options.style);

  if (componentsPath === null) {
    ambiguities.push({
      flag: '--components-path <path>',
      message: 'A component destination cannot be inferred. Pass --components-path <path>.',
    });
  }

  if (style === 'unknown') {
    ambiguities.push({
      flag: '--style <language>',
      message:
        'The component style language could not be inferred. Pass --style css, scss, sass, or less.',
    });
  }

  const packageManager = options.packageManager ?? inspection.packageManager.name;

  if (project === null || stylesheet === null || componentsPath === null || style === 'unknown') {
    return blockedPlan(inspection, ambiguities, packageManager, project, stylesheet);
  }

  if (!isSafeWorkspacePath(stylesheet) || !isSafeWorkspacePath(componentsPath)) {
    ambiguities.push({
      flag: '--stylesheet <path> and --components-path <path>',
      message: 'Init paths must be relative paths inside the workspace.',
    });

    return blockedPlan(inspection, ambiguities, packageManager, project, stylesheet);
  }

  const stylesheetText = await readOptionalText(join(inspection.root, stylesheet));

  if (stylesheetText === null) {
    ambiguities.push({
      flag: '--stylesheet <path>',
      message: `The selected stylesheet does not exist: ${stylesheet}. Pass an existing stylesheet path.`,
    });

    return blockedPlan(inspection, ambiguities, packageManager, project, stylesheet);
  }

  const tailwind = await createTailwindPlan(
    inspection,
    project,
    stylesheet,
    componentsPath,
    stylesheetText,
    options.tailwind ?? 'add',
    ambiguities,
    warnings,
  );
  const installedPackageNames = await readPackageNames(inspection.root);
  const tailwindConfigured =
    (inspection.tailwind.v4Imports || stylesheetText.includes('tailwindcss')) &&
    installedPackageNames.has('tailwindcss') &&
    installedPackageNames.has('@tailwindcss/postcss');
  const requiredPackages = getRequiredPackages(inspection, options, tailwindConfigured);
  const missingPackages = requiredPackages.filter(
    (dependency) => !installedPackageNames.has(dependency.name),
  );

  if (missingPackages.length > 0 && packageManager === 'unknown') {
    ambiguities.push({
      flag: '--package-manager <npm|pnpm|yarn|bun>',
      message:
        'The workspace package manager could not be inferred. Pass --package-manager so the planned install command is unambiguous.',
    });
  }

  const postcss = await createPostCssPlan(
    inspection.root,
    options.postcss ?? 'add',
    ambiguities,
    warnings,
  );
  const tokens = createTokenPlan(stylesheetText, options.tokens, options.yes === true, ambiguities);
  const directory = await createDirectoryPlan(inspection.root, componentsPath, ambiguities);
  const config = await createConfigPlan(inspection, project, stylesheet, componentsPath, style);

  if (tailwind.action === 'manual' || postcss.action === 'manual') {
    warnings.push(
      'A manual Tailwind or PostCSS step is required; the planner will not migrate it automatically.',
    );
  }

  const plannedChanges = createPlannedChanges(
    config,
    missingPackages,
    postcss,
    tailwind,
    tokens,
    directory,
  );
  const installCommands = createInstallCommands(packageManager, missingPackages);
  const nextSteps = createNextSteps(installCommands, plannedChanges.length > 0);

  return {
    ambiguities,
    command: 'init',
    config,
    directory,
    packageManager,
    packages: {
      installCommands,
      missing: missingPackages,
      required: requiredPackages,
    },
    plannedChanges,
    postcss,
    project,
    nextSteps,
    status: ambiguities.length === 0 ? 'ready' : 'blocked',
    stylesheet,
    tailwind,
    tokens,
    warnings,
    workspace: { root: inspection.root, type: inspection.type },
  };
}

function blockedPlan(
  inspection: WorkspaceInspection,
  ambiguities: readonly InitAmbiguity[],
  packageManager: PackageManagerName,
  project: AngularApplicationProject | null,
  stylesheet: string | null,
): InitPlan {
  return {
    ambiguities,
    command: 'init',
    config: null,
    directory: null,
    packageManager,
    packages: { installCommands: [], missing: [], required: [] },
    plannedChanges: [],
    postcss: null,
    project,
    nextSteps: ambiguities.map((ambiguity) => `Provide ${ambiguity.flag}: ${ambiguity.message}`),
    status: 'blocked',
    stylesheet,
    tailwind: null,
    tokens: null,
    warnings: [],
    workspace: { root: inspection.root, type: inspection.type },
  };
}

function addConfigConflicts(
  inspection: WorkspaceInspection,
  options: InitPlannerOptions,
  ambiguities: InitAmbiguity[],
): void {
  const config = inspection.config.value;

  if (config === null) {
    return;
  }

  const conflicts = [
    ['--project', options.project, config.project],
    ['--stylesheet', options.stylesheet, config.stylesheet],
    ['--components-path', options.componentsPath, config.componentsPath],
    ['--style', options.style, config.style],
  ] as const;

  for (const [flag, explicit, configured] of conflicts) {
    if (
      options.force !== true &&
      explicit !== undefined &&
      configured !== undefined &&
      normalizePath(explicit) !== normalizePath(configured)
    ) {
      ambiguities.push({
        flag: `${flag} (or --force)`,
        message: `The explicit ${flag} value conflicts with duxkit-ai.json. Pass --force to plan updating the config, or remove the flag to keep the configured value.`,
      });
    }
  }
}

function selectInitProject(
  inspection: WorkspaceInspection,
  explicitProject: string | undefined,
): AngularApplicationProject | null {
  if (explicitProject !== undefined) {
    return inspection.projects.find((project) => project.name === explicitProject) ?? null;
  }

  return inspection.project ?? (inspection.projects.length === 1 ? inspection.projects[0] : null);
}

function selectInitStylesheet(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject | null,
  explicitStylesheet: string | undefined,
): string | null {
  if (explicitStylesheet !== undefined) {
    return normalizePath(explicitStylesheet);
  }

  if (inspection.config.value?.stylesheet !== undefined) {
    return normalizePath(inspection.config.value.stylesheet);
  }

  return project?.stylesheets.length === 1 ? project.stylesheets[0] : null;
}

function selectInitComponentsPath(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject | null,
  explicitComponentsPath: string | undefined,
): string | null {
  if (explicitComponentsPath !== undefined) {
    return normalizePath(explicitComponentsPath);
  }

  if (inspection.config.value?.componentsPath !== undefined) {
    return normalizePath(inspection.config.value.componentsPath);
  }

  return project?.sourceRoot === null || project?.sourceRoot === undefined
    ? null
    : normalizePath(join(project.sourceRoot, 'app/components/ai'));
}

function selectInitStyle(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject | null,
  stylesheet: string | null,
  explicitStyle: string | undefined,
): StyleLanguage {
  if (explicitStyle !== undefined) {
    return toStyleLanguage(explicitStyle);
  }

  if (inspection.config.value?.style !== undefined) {
    return toStyleLanguage(inspection.config.value.style);
  }

  const stylesheetStyle = toStyleLanguage(extname(stylesheet ?? '').slice(1));

  return stylesheetStyle === 'unknown' ? (project?.styleLanguage ?? 'unknown') : stylesheetStyle;
}

async function createConfigPlan(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject,
  stylesheet: string,
  componentsPath: string,
  style: StyleLanguage,
): Promise<InitConfigPlan> {
  const existing = await readJsonRecord(inspection.config.path);
  const after: Record<string, unknown> = { ...(existing ?? {}) };

  after['$schema'] = 'https://duxkit.com/schemas/duxkit-ai.json';
  after['project'] = project.name;
  after['style'] = style;
  after['componentsPath'] = componentsPath;
  after['stylesheet'] = stylesheet;
  after['tailwind'] = {
    ...(isRecord(after['tailwind']) ? after['tailwind'] : {}),
    sourcePath: `./${componentsPath}`,
    version: 4,
  };

  if (after['primitives'] === undefined) {
    after['primitives'] = {};
  }

  const beforeText = existing === null ? null : JSON.stringify(existing);
  const afterText = JSON.stringify(after);

  return {
    action: beforeText === afterText ? 'unchanged' : inspection.config.exists ? 'update' : 'create',
    after,
    path: 'duxkit-ai.json',
  };
}

async function createTailwindPlan(
  inspection: WorkspaceInspection,
  project: AngularApplicationProject,
  stylesheet: string,
  componentsPath: string,
  stylesheetText: string,
  mode: InitMode,
  ambiguities: InitAmbiguity[],
  warnings: string[],
): Promise<InitTailwindPlan> {
  const sourcePath = formatRelativeCssPath(dirname(stylesheet), componentsPath);
  const sourceRequired =
    project.sourceRoot === null ||
    project.sourceRoot === undefined ||
    !isInsideOrEqual(project.sourceRoot, componentsPath);
  const sourceCovered = !sourceRequired || stylesheetHasSource(stylesheetText, sourcePath);
  const legacyConfig = await hasLegacyTailwindConfig(inspection.root);
  const v4Imports = stylesheetText.includes('tailwindcss');

  if (mode === 'skip') {
    warnings.push('Tailwind setup was skipped by --tailwind skip.');

    return {
      action: 'skip',
      imports: [],
      sourceCoverage: sourceRequired
        ? sourceCovered
          ? 'explicit-source'
          : 'missing'
        : 'covered-by-source-root',
      sourcePath,
      sourceRequired,
    };
  }

  if (legacyConfig && !v4Imports) {
    ambiguities.push({
      flag: '--tailwind skip (or migrate manually)',
      message:
        'A legacy tailwind.config file was found without Tailwind v4 CSS imports. Automatic migration is unsafe.',
    });

    return {
      action: 'manual',
      imports: [],
      sourceCoverage: sourceRequired
        ? sourceCovered
          ? 'explicit-source'
          : 'missing'
        : 'covered-by-source-root',
      sourcePath,
      sourceRequired,
    };
  }

  const hasBroadTailwindImport = /@import\s+["']tailwindcss["']/.test(stylesheetText);
  const imports = v4Imports
    ? [
        ...(stylesheetText.includes('@layer theme, base, components, utilities;')
          ? []
          : ['@layer theme, base, components, utilities;']),
        ...requiredTailwindImports,
      ]
        .filter(
          (statement) =>
            statement.startsWith('@layer') ||
            !hasBroadTailwindImport ||
            statement.includes('@spartan-ng/brain'),
        )
        .filter((statement) => !hasCssImport(stylesheetText, statement))
    : ['@layer theme, base, components, utilities;', ...requiredTailwindImports];
  const needsChange = imports.length > 0 || (sourceRequired && !sourceCovered);

  if (mode === 'require-existing' && needsChange) {
    ambiguities.push({
      flag: '--tailwind add',
      message: `Tailwind v4 setup is incomplete in ${stylesheet}. Pass --tailwind add to plan the missing imports and source coverage.`,
    });

    return {
      action: 'manual',
      imports,
      sourceCoverage: sourceRequired
        ? sourceCovered
          ? 'explicit-source'
          : 'missing'
        : 'covered-by-source-root',
      sourcePath,
      sourceRequired,
    };
  }

  return {
    action: needsChange ? 'add' : 'unchanged',
    imports,
    sourceCoverage: sourceRequired
      ? sourceCovered
        ? 'explicit-source'
        : 'missing'
      : 'covered-by-source-root',
    sourcePath,
    sourceRequired,
  };
}

async function createPostCssPlan(
  workspaceRoot: string,
  mode: InitMode,
  ambiguities: InitAmbiguity[],
  warnings: string[],
): Promise<InitPostCssPlan> {
  const jsonPath = await firstExistingPath(workspaceRoot, [
    '.postcssrc',
    '.postcssrc.json',
    'postcss.config.json',
  ]);
  const riskyPath = await firstExistingPath(workspaceRoot, [
    '.postcssrc.js',
    '.postcssrc.cjs',
    '.postcssrc.mjs',
    '.postcssrc.ts',
    'postcss.config.js',
    'postcss.config.cjs',
    'postcss.config.mjs',
    'postcss.config.ts',
  ]);

  if (mode === 'skip') {
    warnings.push('PostCSS setup was skipped by --postcss skip.');

    return {
      action: 'skip',
      after: null,
      path: jsonPath ?? riskyPath,
      plugin: '@tailwindcss/postcss',
    };
  }

  if (jsonPath === null && riskyPath !== null) {
    ambiguities.push({
      flag: '--postcss skip (or edit manually)',
      message: `PostCSS config ${riskyPath} is JavaScript or TypeScript and is not safe to edit automatically.`,
    });

    return { action: 'manual', after: null, path: riskyPath, plugin: '@tailwindcss/postcss' };
  }

  if (mode === 'require-existing' && jsonPath === null) {
    ambiguities.push({
      flag: '--postcss add',
      message:
        'No safe JSON PostCSS config was found. Pass --postcss add to plan a new .postcssrc.json, or configure PostCSS manually.',
    });

    return { action: 'manual', after: null, path: null, plugin: '@tailwindcss/postcss' };
  }

  if (jsonPath === null) {
    return {
      action: 'create',
      after: { plugins: { '@tailwindcss/postcss': {} } },
      path: '.postcssrc.json',
      plugin: '@tailwindcss/postcss',
    };
  }

  const existing = await readJsonRecord(join(workspaceRoot, jsonPath));

  if (existing === null) {
    ambiguities.push({
      flag: '--postcss skip (or repair config)',
      message: `PostCSS config ${jsonPath} is not parseable JSON and cannot be edited safely.`,
    });

    return { action: 'manual', after: null, path: jsonPath, plugin: '@tailwindcss/postcss' };
  }

  if (hasPostCssPlugin(existing)) {
    return { action: 'unchanged', after: existing, path: jsonPath, plugin: '@tailwindcss/postcss' };
  }

  if (mode === 'require-existing') {
    ambiguities.push({
      flag: '--postcss add',
      message: `PostCSS config ${jsonPath} does not load ${'@tailwindcss/postcss'}. Pass --postcss add to plan the missing plugin, or configure it manually.`,
    });

    return { action: 'manual', after: existing, path: jsonPath, plugin: '@tailwindcss/postcss' };
  }

  const after = addPostCssPlugin(existing);

  if (after === null) {
    ambiguities.push({
      flag: '--postcss skip (or edit manually)',
      message: `PostCSS config ${jsonPath} has an unsupported plugins shape and cannot be edited safely.`,
    });

    return { action: 'manual', after: null, path: jsonPath, plugin: '@tailwindcss/postcss' };
  }

  return { action: 'update', after, path: jsonPath, plugin: '@tailwindcss/postcss' };
}

function createTokenPlan(
  stylesheetText: string,
  mode: InitMode | undefined,
  yes: boolean,
  ambiguities: InitAmbiguity[],
): InitTokenPlan {
  const missing = themeTokens
    .map(([name]) => name)
    .filter((name) => !new RegExp(`${escapeRegExp(name)}\\s*:`).test(stylesheetText));

  if (missing.length === 0) {
    return { action: 'unchanged', declarations: [], missing };
  }

  if (mode === 'skip') {
    return { action: 'skip', declarations: [], missing };
  }

  if (mode === 'require-existing') {
    ambiguities.push({
      flag: '--tokens add',
      message: `The stylesheet is missing ${missing.length} core theme tokens. Pass --tokens add to plan them, or add them manually.`,
    });

    return { action: 'skip', declarations: [], missing };
  }

  if (mode !== 'add' && !yes) {
    ambiguities.push({
      flag: '--tokens add|skip',
      message: `The stylesheet is missing ${missing.length} core theme tokens. Choose whether to add them with --tokens add or leave them out with --tokens skip.`,
    });

    return { action: 'skip', declarations: [], missing };
  }

  return {
    action: 'add',
    declarations: themeTokens
      .filter(([name]) => missing.includes(name))
      .map(([name, value]) => `  ${name}: ${value};`),
    missing,
  };
}

async function createDirectoryPlan(
  workspaceRoot: string,
  componentsPath: string,
  ambiguities: InitAmbiguity[],
): Promise<InitDirectoryPlan | null> {
  const target = join(workspaceRoot, componentsPath);

  try {
    const targetStat = await stat(target);

    if (!targetStat.isDirectory()) {
      ambiguities.push({
        flag: '--components-path <path>',
        message: `The component destination exists but is not a directory: ${componentsPath}.`,
      });

      return null;
    }

    return { action: 'unchanged', path: componentsPath };
  } catch (error) {
    if (!isNodeError(error) || error.code !== 'ENOENT') {
      throw error;
    }

    return { action: 'create', path: componentsPath };
  }
}

function createPlannedChanges(
  config: InitConfigPlan,
  packages: readonly InitPackageChange[],
  postcss: InitPostCssPlan,
  tailwind: InitTailwindPlan,
  tokens: InitTokenPlan,
  directory: InitDirectoryPlan | null,
): readonly InitPlannedChange[] {
  const changes: InitPlannedChange[] = [];

  if (config.action !== 'unchanged') {
    changes.push({
      action: config.action,
      category: 'config',
      detail: `${config.action === 'create' ? 'Create' : 'Update'} Duxkit AI workspace configuration.`,
      path: config.path,
    });
  }

  changes.push(
    ...packages.map((dependency) => ({
      action: 'install' as const,
      category: 'package' as const,
      detail: `Install ${dependency.name}@${dependency.version} in ${dependency.section}. ${dependency.reason}`,
    })),
  );

  if (postcss.action === 'create' || postcss.action === 'update') {
    changes.push({
      action: postcss.action,
      category: 'postcss',
      detail: `Configure ${postcss.plugin} in ${postcss.path}.`,
      path: postcss.path ?? undefined,
    });
  }

  if (tailwind.action === 'add') {
    changes.push({
      action: 'add',
      category: 'tailwind',
      detail: `Add ${tailwind.imports.length} missing Tailwind import(s)${tailwind.sourceRequired ? ` and @source ${tailwind.sourcePath}` : ''}.`,
    });
  }

  if (tokens.action === 'add') {
    changes.push({
      action: 'add',
      category: 'tokens',
      detail: `Add ${tokens.missing.length} missing core theme token(s) without changing existing values.`,
    });
  }

  if (directory?.action === 'create') {
    changes.push({
      action: 'create',
      category: 'directory',
      detail: 'Create the generated Duxkit AI component directory.',
      path: directory.path,
    });
  }

  return changes;
}

function getRequiredPackages(
  inspection: WorkspaceInspection,
  options: InitPlannerOptions,
  tailwindConfigured = inspection.tailwind.v4Imports,
): readonly InitPackageChange[] {
  const required: InitPackageChange[] = [packageRequirements.brain, packageRequirements.twAnimate];
  const tailwindMode = options.tailwind ?? 'add';
  const postcssMode = options.postcss ?? 'add';

  if (!tailwindConfigured && tailwindMode === 'add') {
    required.push(packageRequirements.tailwind);
  }

  if (!tailwindConfigured && postcssMode === 'add') {
    required.push(packageRequirements.postcss);
  }

  return required;
}

async function readPackageNames(workspaceRoot: string): Promise<Set<string>> {
  const manifest = await readJsonRecord(join(workspaceRoot, 'package.json'));
  const names = new Set<string>();

  for (const section of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    const values = manifest?.[section];

    if (!isRecord(values)) {
      continue;
    }

    for (const name of Object.keys(values)) {
      names.add(name);
    }
  }

  return names;
}

function createInstallCommands(
  packageManager: PackageManagerName,
  packages: readonly InitPackageChange[],
): readonly string[] {
  if (packages.length === 0 || packageManager === 'unknown') {
    return [];
  }

  const runtime = packages.filter((dependency) => dependency.section === 'dependencies');
  const dev = packages.filter((dependency) => dependency.section === 'devDependencies');
  const commands: string[] = [];

  if (runtime.length > 0) {
    commands.push(
      `${packageManager} ${packageManager === 'npm' ? 'install' : 'add'} ${runtime.map(formatPackage).join(' ')}`,
    );
  }

  if (dev.length > 0) {
    const install = packageManager === 'npm' ? 'install -D' : 'add -D';
    commands.push(`${packageManager} ${install} ${dev.map(formatPackage).join(' ')}`);
  }

  return commands;
}

function formatPackage(dependency: InitPackageChange): string {
  return `${dependency.name}@${dependency.version}`;
}

function createNextSteps(commands: readonly string[], hasChanges: boolean): readonly string[] {
  const nextSteps = [...commands];

  if (hasChanges) {
    nextSteps.push(
      'Rerun without --dry-run to apply the accepted initialization plan once init mutations are available.',
    );
  }

  return nextSteps;
}

async function hasLegacyTailwindConfig(workspaceRoot: string): Promise<boolean> {
  return (
    (await firstExistingPath(workspaceRoot, [
      'tailwind.config.js',
      'tailwind.config.cjs',
      'tailwind.config.mjs',
      'tailwind.config.ts',
    ])) !== null
  );
}

async function firstExistingPath(
  workspaceRoot: string,
  paths: readonly string[],
): Promise<string | null> {
  for (const path of paths) {
    try {
      await stat(join(workspaceRoot, path));
      return path;
    } catch (error) {
      if (!isNodeError(error) || error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  return null;
}

async function readJsonRecord(path: string): Promise<Record<string, unknown> | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
    return isRecord(parsed) ? parsed : null;
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

function hasPostCssPlugin(config: Readonly<Record<string, unknown>>): boolean {
  const plugins = config['plugins'];

  if (Array.isArray(plugins)) {
    return plugins.some(
      (plugin) =>
        plugin === '@tailwindcss/postcss' || (isRecord(plugin) && '@tailwindcss/postcss' in plugin),
    );
  }

  return isRecord(plugins) && '@tailwindcss/postcss' in plugins;
}

function addPostCssPlugin(
  config: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> | null {
  const after: Record<string, unknown> = { ...config };
  const plugins = config['plugins'];

  if (plugins === undefined) {
    after['plugins'] = { '@tailwindcss/postcss': {} };
    return after;
  }

  if (Array.isArray(plugins)) {
    after['plugins'] = [...plugins, '@tailwindcss/postcss'];
    return after;
  }

  if (isRecord(plugins)) {
    after['plugins'] = { ...plugins, '@tailwindcss/postcss': {} };
    return after;
  }

  return null;
}

function stylesheetHasSource(stylesheetText: string, sourcePath: string): boolean {
  const sourcePaths = [...stylesheetText.matchAll(/@source\s+["']([^"']+)["']/g)].map((match) =>
    normalizeCssPath(match[1]),
  );
  const normalizedSource = normalizeCssPath(sourcePath);

  return sourcePaths.some(
    (path) => path === normalizedSource || isInsideOrEqual(path, normalizedSource),
  );
}

function hasCssImport(stylesheetText: string, statement: string): boolean {
  return (
    stylesheetText.includes(statement) || stylesheetText.includes(statement.replaceAll("'", '"'))
  );
}

function formatRelativeCssPath(fromDirectory: string, toPath: string): string {
  const path = normalizePath(relative(fromDirectory, toPath));
  return path.startsWith('.') ? path : `./${path}`;
}

function isInsideOrEqual(parent: string, child: string): boolean {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith('..') && !path.includes(`..${sep}`));
}

function normalizeCssPath(path: string): string {
  const normalized = normalizePath(path);
  return normalized.startsWith('./') ? normalized.slice(2) : normalized;
}

function normalizePath(path: string): string {
  return path.replace(/[\\/]+/g, '/');
}

function isSafeWorkspacePath(path: string): boolean {
  const normalized = normalizePath(path);
  return normalized.length > 0 && !isAbsolute(path) && !normalized.split('/').includes('..');
}

function toStyleLanguage(value: string): StyleLanguage {
  return value === 'css' || value === 'less' || value === 'sass' || value === 'scss'
    ? value
    : 'unknown';
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

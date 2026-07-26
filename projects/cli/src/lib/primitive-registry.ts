import { primitiveFiles } from './primitive-files.generated.js';

export type PrimitiveStatus = 'available' | 'planned';
export type DependencyGroup =
  | 'ai-runtime'
  | 'angular'
  | 'icons'
  | 'markdown'
  | 'spartan'
  | 'styling';
export type DependencySection = 'dependencies' | 'devDependencies' | 'peerDependencies';
export type PrimitiveRelationshipKind = 'composes' | 'pairs-with' | 'uses';

export interface PrimitivePackageDependency {
  readonly name: string;
  readonly version: string;
  readonly section: DependencySection;
  readonly group: DependencyGroup;
}

export interface PrimitiveRelationship {
  readonly id: PrimitiveId;
  readonly kind: PrimitiveRelationshipKind;
}

export interface PrimitiveRegistryEntry {
  readonly id: PrimitiveId;
  readonly aliases: readonly string[];
  readonly title: string;
  readonly version: string;
  readonly status: PrimitiveStatus;
  readonly description: string;
  readonly files: readonly string[];
  readonly dependencies: readonly PrimitivePackageDependency[];
  readonly peerAssumptions: readonly PrimitivePackageDependency[];
  readonly tokens: readonly string[];
  readonly primitiveDependencies: readonly PrimitiveId[];
  readonly relationships: readonly PrimitiveRelationship[];
  readonly optionalRelationships: readonly PrimitiveRelationship[];
}

export interface ResolvedPrimitivePlan {
  readonly requested: readonly PrimitiveRegistryEntry[];
  readonly included: readonly PrimitiveRegistryEntry[];
  readonly ordered: readonly PrimitiveRegistryEntry[];
  readonly dependencies: readonly PrimitivePackageDependency[];
  readonly dependencyGroups: readonly DependencyGroup[];
}

export class PrimitiveRegistryError extends Error {}

const primitiveIds = [
  'attachment',
  'chain-of-thought',
  'checkpoint',
  'code-block',
  'confirmation',
  'context',
  'conversation',
  'markdown',
  'message',
  'model-selector',
  'prompt-input',
  'queue',
  'reasoning',
  'reasoning-effort',
  'shimmer',
  'sources',
  'task',
  'tool',
] as const;

export type PrimitiveId = (typeof primitiveIds)[number];

const primitiveIdSet = new Set<string>(primitiveIds);

const angularCore = dep('@angular/core', '^22.0.4', 'angular');
const angularCommon = dep('@angular/common', '^22.0.4', 'angular');
const angularForms = dep('@angular/forms', '^22.0.4', 'angular');
const angularCdk = dep('@angular/cdk', '>=22.0.2 <23.0.0', 'angular');
const ai = dep('ai', '^6.0.207', 'ai-runtime');
const ngIconsCore = dep('@ng-icons/core', '>=33.3.0 <34.0.0', 'icons');
const ngIconsLucide = dep('@ng-icons/lucide', '>=33.3.0 <34.0.0', 'icons');
const spartanBrain = dep('@spartan-ng/brain', '^1.0.2', 'spartan');
const cva = dep('class-variance-authority', '^0.7.1', 'styling');
const clsx = dep('clsx', '^2.1.1', 'styling');
const tailwindMerge = dep('tailwind-merge', '^3.6.0', 'styling');
const tailwindcss = dep('tailwindcss', '>=4.0.0', 'styling');
const twAnimate = dep('tw-animate-css', '>=1.0.0', 'styling');
const marked = dep('marked', '^18.0.5', 'markdown');
const highlightJs = dep('highlight.js', '^11.11.1', 'markdown');

const baselinePeers = [tailwindcss, twAnimate] as const;

const iconPeers = [ngIconsCore, ngIconsLucide] as const;
const markdownPeers = [marked, highlightJs] as const;
const collapsiblePeers = [spartanBrain] as const;
const hoverCardPeers = [angularCdk, spartanBrain] as const;
const commandDialogPeers = [angularCdk, spartanBrain] as const;
const aiRuntimePeers = [ai] as const;
const dependencyGroupOrder: readonly DependencyGroup[] = [
  'angular',
  'styling',
  'markdown',
  'icons',
  'ai-runtime',
  'spartan',
] as const;

const registryEntries = [
  primitive({
    id: 'conversation',
    title: 'Conversation',
    description: 'Scrollable chat transcript and streaming-message container.',
    dependencies: [angularCore, tailwindMerge],
    tokens: ['layout', 'scroll'],
    relationships: [{ id: 'message', kind: 'composes' }],
  }),
  primitive({
    id: 'message',
    title: 'Message',
    description: 'Role-aware user, assistant, and system message structure.',
    dependencies: [angularCore, cva, clsx, tailwindMerge, ...iconPeers, ...aiRuntimePeers],
    primitiveDependencies: ['markdown', 'code-block'],
    tokens: ['markdown', 'message-actions'],
  }),
  primitive({
    id: 'prompt-input',
    aliases: ['prompt'],
    title: 'Prompt Input',
    description: 'Prompt form with textarea, attachments, tools, and submit state.',
    dependencies: [angularCommon, angularCore, cva, tailwindMerge, ...iconPeers, ...aiRuntimePeers],
    primitiveDependencies: ['attachment'],
    tokens: ['prompt-input'],
    optionalRelationships: [{ id: 'model-selector', kind: 'pairs-with' }],
  }),
  primitive({
    id: 'reasoning',
    title: 'Reasoning',
    description: 'Collapsible summarized reasoning with markdown content.',
    dependencies: [angularCore, tailwindMerge, ...collapsiblePeers, ...iconPeers],
    primitiveDependencies: ['markdown', 'code-block'],
    tokens: ['markdown', 'disclosure'],
  }),
  primitive({
    id: 'reasoning-effort',
    aliases: ['effort'],
    title: 'Reasoning Effort',
    description: 'Composable popover controls for selecting an AI reasoning-effort level.',
    dependencies: [angularCdk, angularCore, tailwindMerge, ...iconPeers, spartanBrain],
    tokens: ['reasoning-effort', 'selection'],
    optionalRelationships: [{ id: 'prompt-input', kind: 'pairs-with' }],
  }),
  primitive({
    id: 'tool',
    title: 'Tool',
    description: 'AI SDK tool-call status, input, result, and state rendering.',
    dependencies: [
      angularCore,
      tailwindMerge,
      ...collapsiblePeers,
      ...iconPeers,
      ...aiRuntimePeers,
    ],
    tokens: ['tool-status', 'disclosure'],
    optionalRelationships: [{ id: 'confirmation', kind: 'pairs-with' }],
  }),
  primitive({
    id: 'code-block',
    aliases: ['code'],
    title: 'Code Block',
    description: 'Syntax-highlighted code block with copy and download controls.',
    dependencies: [angularCommon, angularCore, tailwindMerge, ...iconPeers],
    primitiveDependencies: ['markdown'],
    tokens: ['code'],
  }),
  primitive({
    id: 'markdown',
    title: 'Markdown',
    description: 'Markdown parsing, highlighting, and AI markdown content classes.',
    dependencies: [angularCore, ...markdownPeers],
    tokens: ['markdown', 'syntax-highlight'],
  }),
  primitive({
    id: 'attachment',
    aliases: ['attachments'],
    title: 'Attachment',
    description: 'File and source-document attachment preview primitives.',
    dependencies: [
      angularCore,
      cva,
      tailwindMerge,
      ...hoverCardPeers,
      ...iconPeers,
      ...aiRuntimePeers,
    ],
    tokens: ['attachment-preview'],
  }),
  primitive({
    id: 'chain-of-thought',
    aliases: ['chain', 'cot'],
    title: 'Chain of Thought',
    description: 'Expandable progress steps for reasoning, searches, and intermediate work.',
    dependencies: [angularCore, tailwindMerge, ...collapsiblePeers, ...iconPeers],
    primitiveDependencies: ['shimmer'],
    tokens: ['reasoning-steps'],
    optionalRelationships: [{ id: 'confirmation', kind: 'pairs-with' }],
  }),
  primitive({
    id: 'checkpoint',
    title: 'Checkpoint',
    description: 'Restore-point marker for earlier chat state.',
    dependencies: [angularCore, tailwindMerge, ...iconPeers],
    tokens: ['checkpoint'],
  }),
  primitive({
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Approval UI before an agent takes an action.',
    dependencies: [angularCore, tailwindMerge, ...aiRuntimePeers],
    tokens: ['confirmation'],
  }),
  primitive({
    id: 'context',
    title: 'Context',
    description: 'Context usage, token breakdowns, and estimated model cost.',
    dependencies: [angularCore, tailwindMerge, ...hoverCardPeers, ...aiRuntimePeers],
    tokens: ['context-cost', 'context-usage'],
  }),
  primitive({
    id: 'model-selector',
    aliases: ['model', 'models'],
    title: 'Model Selector',
    description: 'Searchable model picker grouped by provider.',
    dependencies: [angularCore, angularForms, tailwindMerge, ...commandDialogPeers, ...iconPeers],
    tokens: ['model-logo', 'command-list'],
  }),
  primitive({
    id: 'queue',
    title: 'Queue',
    description: 'Pending work list for messages, tasks, uploads, and file changes.',
    dependencies: [angularCore, tailwindMerge, ...collapsiblePeers, ...iconPeers],
    tokens: ['queue'],
  }),
  primitive({
    id: 'shimmer',
    title: 'Shimmer',
    description: 'Animated text for loading states and progressive output.',
    dependencies: [angularCore, tailwindMerge],
    tokens: ['motion'],
  }),
  primitive({
    id: 'sources',
    aliases: ['source'],
    title: 'Sources',
    description: 'Expandable grouped source links and references.',
    dependencies: [angularCore, tailwindMerge, ...collapsiblePeers, ...iconPeers],
    tokens: ['sources'],
  }),
  primitive({
    id: 'task',
    title: 'Task',
    description: 'Agent activity, checklist progress, and file updates.',
    dependencies: [angularCore, tailwindMerge, ...collapsiblePeers, ...iconPeers],
    tokens: ['task'],
  }),
] as const satisfies readonly PrimitiveRegistryEntry[];

export const primitiveRegistry = validatePrimitiveRegistry(registryEntries);

export function validatePrimitiveRegistry(
  entries: readonly PrimitiveRegistryEntry[],
): readonly PrimitiveRegistryEntry[] {
  const ids = new Set<string>();
  const aliases = new Map<string, PrimitiveId>();

  for (const entry of entries) {
    validatePrimitiveEntry(entry);

    if (ids.has(entry.id)) {
      throw new PrimitiveRegistryError(`Duplicate primitive id: ${entry.id}`);
    }

    ids.add(entry.id);
  }

  for (const entry of entries) {
    for (const alias of entry.aliases) {
      const previous = aliases.get(alias);

      if (primitiveIdSet.has(alias)) {
        throw new PrimitiveRegistryError(`Alias conflicts with primitive id: ${alias}`);
      }

      if (previous !== undefined) {
        throw new PrimitiveRegistryError(`Alias ${alias} is used by ${previous} and ${entry.id}`);
      }

      aliases.set(alias, entry.id);
    }

    validatePrimitiveReferences(entry, ids);
  }

  assertNoPrimitiveDependencyCycles(entries);

  return entries;
}

export function findPrimitive(id: PrimitiveId): PrimitiveRegistryEntry {
  return primitiveRegistryById.get(id) ?? fail(`Unknown primitive id: ${id}`);
}

export function listPrimitives(): readonly PrimitiveRegistryEntry[] {
  return primitiveRegistry;
}

export function normalizePrimitiveInput(input: string): PrimitiveId {
  const normalized = normalizePrimitiveName(input);
  const byAlias = primitiveAliasMap.get(normalized);

  if (byAlias !== undefined) {
    return byAlias;
  }

  if (primitiveIdSet.has(normalized)) {
    return normalized as PrimitiveId;
  }

  const suggestions = nearestPrimitiveSuggestions(normalized);
  const suggestionText =
    suggestions.length === 0
      ? ''
      : ` Did you mean ${suggestions.map((value) => `"${value}"`).join(', ')}?`;

  throw new PrimitiveRegistryError(
    `Unknown primitive "${input}".${suggestionText} Run "duxkit-ui list" to see available primitives.`,
  );
}

function normalizePrimitiveName(input: string): string {
  return input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function nearestPrimitiveSuggestions(input: string): readonly string[] {
  const candidates = [...new Set([...primitiveIds, ...primitiveAliasMap.keys()])];
  const threshold = Math.max(2, Math.floor(input.length / 2));

  return candidates
    .map((candidate) => ({ candidate, distance: editDistance(input, candidate) }))
    .filter(({ distance }) => distance <= threshold)
    .sort(
      (left, right) =>
        left.distance - right.distance || left.candidate.localeCompare(right.candidate),
    )
    .slice(0, 3)
    .map(({ candidate }) => candidate);
}

function editDistance(left: string, right: string): number {
  const distances = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = distances[0];
    distances[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const previous = distances[rightIndex];
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;

      distances[rightIndex] = Math.min(
        distances[rightIndex] + 1,
        distances[rightIndex - 1] + 1,
        diagonal + substitutionCost,
      );
      diagonal = previous;
    }
  }

  return distances[right.length] ?? left.length;
}

export function resolvePrimitivePlan(inputs: readonly string[]): ResolvedPrimitivePlan {
  const requestedIds = dedupe(inputs.map((input) => normalizePrimitiveInput(input)));
  const orderedIds: PrimitiveId[] = [];
  const seen = new Set<PrimitiveId>();

  for (const id of requestedIds) {
    appendPrimitiveWithDependencies(id, seen, orderedIds);
  }

  const requested = requestedIds.map((id) => findPrimitive(id));
  const ordered = orderedIds.map((id) => findPrimitive(id));
  const requestedSet = new Set<PrimitiveId>(requestedIds);
  const included = ordered.filter((entry) => !requestedSet.has(entry.id));
  const dependencies = resolvePackageDependencies(ordered);
  const dependencyGroups = sortDependencyGroups(
    dedupe(dependencies.map((dependency) => dependency.group)),
  );

  return {
    dependencyGroups,
    dependencies,
    included,
    ordered,
    requested,
  };
}

export function dependencyGroupLabel(group: DependencyGroup): string {
  switch (group) {
    case 'ai-runtime':
      return 'AI runtime';
    case 'angular':
      return 'Angular';
    case 'icons':
      return 'Icons';
    case 'markdown':
      return 'Markdown';
    case 'spartan':
      return 'Spartan';
    case 'styling':
      return 'Styling';
  }
}

function primitive(
  entry: Omit<
    PrimitiveRegistryEntry,
    | 'files'
    | 'aliases'
    | 'dependencies'
    | 'optionalRelationships'
    | 'peerAssumptions'
    | 'primitiveDependencies'
    | 'relationships'
    | 'status'
    | 'version'
  > &
    Partial<
      Pick<
        PrimitiveRegistryEntry,
        | 'aliases'
        | 'dependencies'
        | 'optionalRelationships'
        | 'peerAssumptions'
        | 'primitiveDependencies'
        | 'relationships'
        | 'status'
        | 'version'
      >
    >,
): PrimitiveRegistryEntry {
  const {
    aliases,
    dependencies,
    optionalRelationships,
    peerAssumptions: extraPeerAssumptions,
    primitiveDependencies,
    relationships,
    status,
    version,
    ...rest
  } = entry;
  const peerAssumptions = dedupeDependencies([...baselinePeers, ...(extraPeerAssumptions ?? [])]);

  return {
    aliases: aliases ?? [],
    dependencies: dependencies ?? [],
    files: primitiveFiles[entry.id],
    optionalRelationships: optionalRelationships ?? [],
    peerAssumptions,
    primitiveDependencies: primitiveDependencies ?? [],
    relationships: relationships ?? [],
    status: status ?? 'available',
    version: version ?? '0.1.0',
    ...rest,
  };
}

function dep(
  name: string,
  version: string,
  group: DependencyGroup,
  section: DependencySection = 'dependencies',
): PrimitivePackageDependency {
  return {
    group,
    name,
    section,
    version,
  };
}

const primitiveRegistryById = new Map<PrimitiveId, PrimitiveRegistryEntry>(
  primitiveRegistry.map((entry) => [entry.id, entry]),
);
const primitiveAliasMap = new Map<string, PrimitiveId>(
  primitiveRegistry.flatMap((entry) => entry.aliases.map((alias) => [alias, entry.id] as const)),
);

function validatePrimitiveEntry(entry: PrimitiveRegistryEntry): void {
  if (!primitiveIdSet.has(entry.id)) {
    throw new PrimitiveRegistryError(`Unknown primitive id in registry: ${entry.id}`);
  }

  validateKebab(entry.id, `primitive id ${entry.id}`);
  validateString(entry.title, `primitive ${entry.id} title`);
  validateString(entry.description, `primitive ${entry.id} description`);

  if (!/^\d+\.\d+\.\d+$/.test(entry.version)) {
    throw new PrimitiveRegistryError(`Primitive ${entry.id} version must be semver.`);
  }

  if (entry.status !== 'available' && entry.status !== 'planned') {
    throw new PrimitiveRegistryError(`Primitive ${entry.id} has invalid status.`);
  }

  validateUniqueStrings(entry.aliases, `primitive ${entry.id} aliases`);
  validateUniqueStrings(entry.files, `primitive ${entry.id} files`);
  validateUniqueStrings(entry.tokens, `primitive ${entry.id} tokens`);

  for (const alias of entry.aliases) {
    validateKebab(alias, `primitive ${entry.id} alias ${alias}`);
  }

  if (entry.files.length === 0) {
    throw new PrimitiveRegistryError(`Primitive ${entry.id} must declare files.`);
  }

  for (const file of entry.files) {
    validateFilePath(entry.id, file);
  }

  validateDependencies(entry.id, [...entry.dependencies, ...entry.peerAssumptions]);
}

function validatePrimitiveReferences(
  entry: PrimitiveRegistryEntry,
  ids: ReadonlySet<string>,
): void {
  for (const dependencyId of entry.primitiveDependencies) {
    validatePrimitiveReference(entry.id, dependencyId, ids, 'dependency');
  }

  for (const relationship of [...entry.relationships, ...entry.optionalRelationships]) {
    validatePrimitiveReference(entry.id, relationship.id, ids, relationship.kind);
  }
}

function validatePrimitiveReference(
  entryId: PrimitiveId,
  referencedId: PrimitiveId,
  ids: ReadonlySet<string>,
  kind: string,
): void {
  if (!ids.has(referencedId)) {
    throw new PrimitiveRegistryError(
      `Primitive ${entryId} references missing ${kind}: ${referencedId}`,
    );
  }

  if (entryId === referencedId) {
    throw new PrimitiveRegistryError(`Primitive ${entryId} cannot reference itself.`);
  }
}

function validateDependencies(
  primitiveId: PrimitiveId,
  dependencies: readonly PrimitivePackageDependency[],
): void {
  const seen = new Set<string>();

  for (const dependency of dependencies) {
    const key = `${dependency.section}:${dependency.name}`;

    if (seen.has(key)) {
      throw new PrimitiveRegistryError(`Primitive ${primitiveId} has duplicate dependency ${key}.`);
    }

    seen.add(key);
    validateString(dependency.name, `primitive ${primitiveId} dependency name`);
    validateString(
      dependency.version,
      `primitive ${primitiveId} dependency ${dependency.name} version`,
    );

    if (!['dependencies', 'devDependencies', 'peerDependencies'].includes(dependency.section)) {
      throw new PrimitiveRegistryError(
        `Primitive ${primitiveId} dependency ${dependency.name} has invalid section.`,
      );
    }

    if (
      !['ai-runtime', 'angular', 'icons', 'markdown', 'spartan', 'styling'].includes(
        dependency.group,
      )
    ) {
      throw new PrimitiveRegistryError(
        `Primitive ${primitiveId} dependency ${dependency.name} has invalid group.`,
      );
    }
  }
}

function validateFilePath(primitiveId: PrimitiveId, file: string): void {
  validateString(file, `primitive ${primitiveId} file`);

  if (
    file.startsWith('/') ||
    file.startsWith('../') ||
    file.includes('/../') ||
    file.endsWith('/') ||
    file.includes('\\')
  ) {
    throw new PrimitiveRegistryError(`Primitive ${primitiveId} has unsafe file path: ${file}`);
  }
}

function validateString(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new PrimitiveRegistryError(`${label} must not be empty.`);
  }
}

function validateKebab(value: string, label: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new PrimitiveRegistryError(`${label} must be kebab-case.`);
  }
}

function validateUniqueStrings(values: readonly string[], label: string): void {
  const unique = new Set(values);

  if (unique.size !== values.length) {
    throw new PrimitiveRegistryError(`${label} must be unique.`);
  }
}

function assertNoPrimitiveDependencyCycles(entries: readonly PrimitiveRegistryEntry[]): void {
  const visiting = new Set<PrimitiveId>();
  const visited = new Set<PrimitiveId>();
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  const visit = (id: PrimitiveId): void => {
    if (visited.has(id)) {
      return;
    }

    if (visiting.has(id)) {
      throw new PrimitiveRegistryError(`Primitive dependency cycle detected at ${id}.`);
    }

    visiting.add(id);

    for (const dependencyId of byId.get(id)?.primitiveDependencies ?? []) {
      visit(dependencyId);
    }

    visiting.delete(id);
    visited.add(id);
  };

  for (const entry of entries) {
    visit(entry.id);
  }
}

function appendPrimitiveWithDependencies(
  id: PrimitiveId,
  seen: Set<PrimitiveId>,
  orderedIds: PrimitiveId[],
): void {
  if (seen.has(id)) {
    return;
  }

  seen.add(id);

  for (const dependencyId of findPrimitive(id).primitiveDependencies) {
    appendPrimitiveWithDependencies(dependencyId, seen, orderedIds);
  }

  orderedIds.push(id);
}

function resolvePackageDependencies(
  primitives: readonly PrimitiveRegistryEntry[],
): readonly PrimitivePackageDependency[] {
  const dependencies: PrimitivePackageDependency[] = [];
  const seen = new Set<string>();

  for (const primitiveEntry of primitives) {
    for (const dependency of [...primitiveEntry.dependencies, ...primitiveEntry.peerAssumptions]) {
      const key = `${dependency.section}:${dependency.name}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      dependencies.push(dependency);
    }
  }

  return dependencies;
}

function dedupe<T>(values: readonly T[]): readonly T[] {
  return [...new Set(values)];
}

function dedupeDependencies(
  dependencies: readonly PrimitivePackageDependency[],
): readonly PrimitivePackageDependency[] {
  const result: PrimitivePackageDependency[] = [];
  const seen = new Set<string>();

  for (const dependency of dependencies) {
    const key = `${dependency.section}:${dependency.name}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(dependency);
  }

  return result;
}

function sortDependencyGroups(groups: readonly DependencyGroup[]): readonly DependencyGroup[] {
  return [...groups].sort(
    (left, right) => dependencyGroupOrder.indexOf(left) - dependencyGroupOrder.indexOf(right),
  );
}

function fail(message: string): never {
  throw new PrimitiveRegistryError(message);
}

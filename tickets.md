# Tickets: Duxkit UI CLI

Build the `@duxkit/ui` CLI from the updated Duxkit AI CLI design spec at `docs/superpowers/specs/2026-07-07-duxkit-ai-cli-design.md`.

Work the **frontier**: any ticket whose blockers are all done. For this set, start with the Helm namespace ticket, then follow the dependency edges below.

## Move private Helm imports off the public `@duxkit/ui` namespace

**What to build:** Free the public `@duxkit/ui` package name for the CLI while keeping the repo's private Helm UI primitives usable by the library, docs, playground, tests, and workspace tooling.

**Blocked by:** None — can start immediately.

- [x] The private Helm import alias no longer occupies the public `@duxkit/ui` root or package namespace.
- [x] Existing Duxkit AI, docs, playground, and private Helm references still compile through the new private alias.
- [x] Workspace convention checks, test aliases, and generation config agree on the new private Helm import surface.
- [x] The change does not expose private Helm primitives as part of the published Duxkit AI public API.

## Scaffold the `@duxkit/ui` CLI package and `duxkit-ui` binary

**What to build:** Add a buildable CLI project that publishes as `@duxkit/ui`, exposes a `duxkit-ui` binary, and provides strict command shells for `init`, `add`, `list`, and `inspect`.

**Blocked by:** Move private Helm imports off the public `@duxkit/ui` namespace.

- [ ] The workspace contains a new CLI project with package metadata for `@duxkit/ui`.
- [ ] The package builds as a Node ESM command-line package.
- [ ] The package exposes a `duxkit-ui` binary entrypoint.
- [ ] Command parsing supports `init`, `add`, `list`, and `inspect` with the flags from the spec.
- [ ] Unknown commands and unsupported options fail clearly.

## Add the CLI fixture and test harness

**What to build:** Create a test harness that runs CLI commands against temporary Angular CLI and Nx workspace fixtures without mutating source fixtures directly.

**Blocked by:** Scaffold the `@duxkit/ui` CLI package and `duxkit-ui` binary.

- [ ] Tests can copy an Angular CLI app fixture to a temporary workspace and run CLI commands inside it.
- [ ] Tests can copy an Nx workspace fixture to a temporary workspace and run CLI commands inside it.
- [ ] Fixture commands can assert file changes, package changes, stdout, stderr, and exit codes.
- [ ] The harness supports read-only assertions for dry-run scenarios.

## Implement the bundled primitive registry and `list` command

**What to build:** Provide a bundled local primitive registry that drives CLI prompts, dependency planning, primitive relationships, and the user-visible `list` command.

**Blocked by:** Scaffold the `@duxkit/ui` CLI package and `duxkit-ui` binary.

- [ ] The registry validates primitive ids, versions, titles, status, files, dependencies, peer assumptions, tokens, and primitive relationships.
- [ ] Primitive input normalization accepts exact ids and documented aliases only.
- [ ] Dependency and primitive dependency resolution deduplicates while preserving user intent.
- [ ] `duxkit-ui list` prints available primitives, installed primitives when detectable, and dependency groups.
- [ ] `duxkit-ui list --json` prints valid structured JSON.

## Add launch primitive templates with registry import validation

**What to build:** Add curated copied-source templates for the launch primitive subset and verify registry dependency metadata against the packages those templates import.

**Blocked by:** Implement the bundled primitive registry and `list` command.

- [ ] Templates exist for the launch subset: conversation, message, prompt-input, reasoning, tool, code-block, and markdown.
- [ ] Generated template code follows the repo's Angular and TypeScript rules.
- [ ] Template imports between generated primitives are relative and do not require consumer path aliases.
- [ ] A registry validation test catches package imports missing from registry dependency metadata.
- [ ] A registry validation test catches stale dependency metadata that is not used by generated templates unless it is explicitly baseline-only.

## Implement workspace detection, config parsing, and `inspect`

**What to build:** Detect Angular CLI and Nx workspace state, read Duxkit AI config, infer project/style/package details, and expose the result through `inspect`.

**Blocked by:** Add the CLI fixture and test harness.

- [ ] The CLI detects workspace root from the current directory or `--cwd`.
- [ ] Angular CLI and Nx application candidates are detected from their workspace metadata.
- [ ] A single app project, source root, stylesheet, style language, package manager, and default components path are inferred when safe.
- [ ] Existing `duxkit-ai.json` is parsed and validated.
- [ ] `duxkit-ui inspect` reports workspace, project, package manager, component destination, stylesheet, Tailwind source coverage, tokens, installed primitives, and missing dependencies.
- [ ] `duxkit-ui inspect --json` prints valid structured JSON.

## Implement `init` planning and dry-run output

**What to build:** Make `duxkit-ui init --dry-run` compute and render the complete initialization plan without installing packages or writing files.

**Blocked by:** Implement workspace detection, config parsing, and `inspect`.

- [ ] The init planner computes config, package, PostCSS, Tailwind, theme token, and directory changes.
- [ ] The planner prompts only for unsafe ambiguity in interactive mode.
- [ ] Non-interactive mode fails with actionable missing flags when ambiguity remains.
- [ ] `--dry-run` never writes files or runs a package manager.
- [ ] `--json --dry-run` prints valid structured JSON without human-only stdout noise.

## Apply safe `init` mutations

**What to build:** Apply the accepted init plan under the plan-first mutation contract, configuring Duxkit AI without overwriting user-owned values.

**Blocked by:** Implement `init` planning and dry-run output.

- [ ] `duxkit-ui init` creates or updates `duxkit-ai.json`.
- [ ] Missing baseline dependencies are installed unless `--no-install` is used.
- [ ] Safe JSON PostCSS config is created or updated when needed.
- [ ] Tailwind v4 imports, Duxkit preset imports, and generated component source coverage are added when needed.
- [ ] Missing theme tokens are appended without modifying existing token values.
- [ ] The configured components directory is created when absent.
- [ ] Risky Tailwind/PostCSS states produce prompts or manual steps instead of automatic migration.

## Implement `add` planning, primitive resolution, and conflict preflight

**What to build:** Make `duxkit-ui add --dry-run` resolve primitives, dependencies, file targets, and conflicts completely before any mutation can occur.

**Blocked by:** Add launch primitive templates with registry import validation; Implement workspace detection, config parsing, and `inspect`.

- [ ] Requested primitive names normalize to lowercase kebab-case and reject unknown or ambiguous input.
- [ ] Unknown-name errors show nearest valid suggestions and mention `duxkit-ui list`.
- [ ] Transitive hard primitive dependencies are resolved and displayed separately from requested primitives.
- [ ] Planned package, file, config, and stylesheet changes are rendered before mutation.
- [ ] Existing targets are classified as create, unchanged, customized, foreign, or blocked.
- [ ] Unresolved conflicts or unsafe paths abort before dependency installation or writes.
- [ ] `--dry-run` and `--json --dry-run` are read-only and deterministic.

## Apply `add` mutations for the launch subset

**What to build:** Generate the launch primitive subset into the configured component destination, install only required dependencies, and update config only for completed primitives.

**Blocked by:** Apply safe `init` mutations; Implement `add` planning, primitive resolution, and conflict preflight.

- [ ] `duxkit-ui add message` copies message files into the configured components directory.
- [ ] Adding multiple launch primitives installs only packages directly required by those generated templates.
- [ ] Dependency installation happens before source/config/style writes.
- [ ] Identical existing generated files count as success.
- [ ] Customized generated files are preserved unless an allowed overwrite path is chosen.
- [ ] `duxkit-ai.json.primitives` records only primitives whose writes completed.
- [ ] Import examples and generated-source ownership wording are printed after successful generation.

## Harden mutation flags and failure reporting

**What to build:** Finish the CLI safety contract for confirmation, non-interactive execution, forced overwrites, skipped installs, JSON output, and partial failure reporting.

**Blocked by:** Apply safe `init` mutations; Apply `add` mutations for the launch subset.

- [ ] Interactive commands print the plan and ask one final apply confirmation unless `--yes` is passed.
- [ ] Non-interactive writes require `--yes`.
- [ ] `--yes` accepts safe defaults but does not resolve ambiguity.
- [ ] `--no-install` never runs the package manager and prints the exact install command the user must run.
- [ ] `--force` can overwrite only Duxkit-owned generated files under the configured Duxkit components path.
- [ ] `--force` does not overwrite foreign files, unsafe paths, directories, existing token values, JS/TS PostCSS configs, Angular routing/bootstrap files, or unrelated app files.
- [ ] Install failure leaves source files and config unchanged.
- [ ] Later write failure after install prints `Partial changes were made`, completed steps, and pending steps.

## Expand registry/templates to the remaining V1 primitives

**What to build:** Extend the registry and copied-source templates from the launch subset to the full V1 primitive catalog.

**Blocked by:** Apply `add` mutations for the launch subset; Harden mutation flags and failure reporting.

- [ ] The registry supports conversation, message, prompt-input, reasoning, tool, task, sources, confirmation, attachment, queue, chain-of-thought, code-block, markdown, context, checkpoint, model-selector, and shimmer.
- [ ] Every primitive has dependency metadata that matches generated imports.
- [ ] Primitive relationships and optional relationships are represented accurately.
- [ ] Generated code for each primitive compiles in a fixture app.
- [ ] The CLI can plan and add any V1 primitive without requiring remote registries or custom templates.

## Update installation and component documentation for the CLI path

**What to build:** Update docs so the CLI is the recommended install path and every primitive page can show the relevant add command.

**Blocked by:** Harden mutation flags and failure reporting.

- [ ] The installation page leads with `pnpm dlx @duxkit/ui init`.
- [ ] The recommended first add command uses the CLI instead of the full peer-dependency install path.
- [ ] Manual install is retained as a secondary path for teams that do not want generated local component source.
- [ ] Component docs expose per-primitive `pnpm dlx @duxkit/ui add <primitive>` commands.
- [ ] Docs do not imply the CLI performs V1 non-goals such as backend route generation or provider SDK setup by default.

## Wire final build and release verification

**What to build:** Ensure the repo has reliable build and test coverage for the CLI package, generated output, docs, Angular CLI fixtures, and Nx fixtures.

**Blocked by:** Expand registry/templates to the remaining V1 primitives; Update installation and component documentation for the CLI path.

- [ ] The CLI package has a build target that runs in the workspace.
- [ ] Unit tests cover registry resolution, metadata validation, package-manager detection, workspace detection, stylesheet resolution, token detection, conflict detection, dry-run output, JSON output, `--no-install`, `--yes`, and narrow `--force`.
- [ ] Integration tests verify generated files, package changes, stylesheet changes, tokens, conflict safety, dry-run behavior, no-install behavior, and fixture compilation.
- [ ] Required verification commands include the library build, docs build, CLI tests, and CLI build target.
- [ ] The final verification path works for both Angular CLI and Nx fixture workspaces.

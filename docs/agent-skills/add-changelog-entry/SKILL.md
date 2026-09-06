---
name: add-changelog-entry
description: Select the correct Duxkit release bundle and record completed features without rewriting previous releases. Use after changes to WWW, @duxkit/ui CLI, or duxkit-ai primitives, and when preparing a new release.
---

# Add Changelog Entry

Keep release notes aligned with completed work and the user's intended release.

## Select the Release First

Read `projects/www/src/app/routes/docs/data/changelog.ts` and the user's release instructions.
Inspect branch names, tags and relevant Git history when needed to distinguish previous releases
from work in progress. The first array entry is the newest recorded bundle, **not automatically
the destination for new work**.

- **Explicit version:** use the user's version. An explicit new-release request takes precedence
  over instructions elsewhere to add entries to the "current bundle."
- **New release or update after the latest recorded release:** prepend a new bundle. Follow this
  repo's patch sequence by default: `v0.4.1` → `v0.4.2`. Do not choose `v0.5` because the feature
  is large or its APIs change; a different bundle increment needs the user's direction or an
  established release plan.
- **Continuing an established upcoming release:** add to that same upcoming bundle. Reuse a
  bundle already created for this work; do not increment again for each feature or follow-up.
- **Feature work without an established upcoming bundle:** create the next patch bundle rather
  than silently adding new work to a previous release. If user instructions and repository
  evidence conflict and do not resolve the destination, ask one concise version question.

Preserve earlier bundles' entries, groups, versions and dates. Date a newly created bundle with
the current date unless the user supplies a release date. If this task previously put entries in
the wrong bundle, move only this task's additions; use Git history to preserve the original.

## Keep Version Names Separate

- The WWW changelog bundle uses the site's release sequence, such as `v0.4.2`.
- When the user requests a release branch, inspect previous branch names and use the bundle
  version, such as `v0.4.2`. Never add a `codex/` prefix in this repo. Changelog work alone does
  not request branch creation or renaming.
- The npm package version in `projects/cli/package.json` and its `ui-v*` publishing tag are
  separate. Do not derive the bundle version from npm semver, or bump npm packages merely to
  match the bundle. Change npm versions only within requested package-release preparation.

Example: previous bundle `v0.4.1` plus "prepare a new release" means a new `v0.4.2` bundle.
The previous entry stays intact. A separately chosen npm version of `0.2.0` does not change that
bundle decision. "Add another fix to our upcoming v0.4.2 release" reuses `v0.4.2`.

## Workflow

1. Select or create the destination bundle using the rules above before writing any entries.
2. Summarize only the feature completed in the current task. Do not backfill unrelated work found in the worktree.
3. Add a concise, release-facing title to each affected group:
   - `WWW`: website pages, docs, navigation, search, SEO, demos, and site infrastructure.
   - `CLI`: `@duxkit/ui` commands, generation, configuration, registry, and package behavior.
   - `UI`: `duxkit-ai` primitives, public APIs, styling, accessibility, and interaction behavior.
4. Use one title per independently useful change. Prefer a user-visible outcome such as `CLI command reference page` over an implementation detail such as `Added cli.page.ts`.
5. Avoid duplicate entries. Keep unrelated work and previous releases unchanged.
6. Update `projects/www/src/app/routes/docs/changelog.page.spec.ts` for the new bundle order,
   date, affected groups and table-of-contents anchors. Retain assertions that previous bundles
   are preserved; do not just replace old expectations with the new entries.
7. When preparing a release, align related release notes and migration documents with the
   selected bundle. State the bundle and any separately prepared npm version explicitly.

## Breaking Changes Need a Migration Guide

Before publishing a release that removes an API or changes existing defaults, markup or
behaviour, add a release-specific guide under `/docs/migrations/<from>-to-<to>`. Extend
`projects/www/src/app/routes/docs/data/migrations.ts`; the migrations page, prerender routes
and SEO route inventory read that registry.

- Identify the affected installed source and state site-release and npm versions separately.
- Explain safe source regeneration, preserving local edits, and the difference between updating
  the CLI and replacing installed component source. Pin commands to the destination CLI version.
- Show before-and-after examples for each required change, including new imports and changes
  that still compile but alter behaviour or appearance. End with checks users can run.
- Associate affected components with the relevant guide sections. Link the guide from the
  release's changelog notice, component pages and CLI README. Existing guides remain available.
- Run WWW tests/build and keep the public sitemap aligned with the SEO route inventory.

This guide is part of release preparation, not optional follow-up documentation.

## Verification

Run:

```bash
pnpm exec vitest run projects/www/src/app/routes/docs/changelog.page.spec.ts
```

If the feature also changes routing, SEO, or rendering, include the relevant targeted tests and build from that feature's workflow.

## Finish Check

- The entry describes shipped behavior, not internal file edits.
- A new release has its own bundle; continuing work reuses the established upcoming bundle.
- The bundle follows the user's version or the next patch sequence, independently of npm.
- Previous bundles retain their original entries, groups, versions and dates.
- Every affected product group has an entry.
- Unaffected groups remain unchanged.
- No unrelated worktree changes were added to the changelog.
- The changelog test passes.

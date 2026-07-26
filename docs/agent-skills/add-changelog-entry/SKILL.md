---
name: add-changelog-entry
description: Record completed, release-facing features in the current Duxkit changelog bundle. Use after implementing a feature that changes the WWW app, @duxkit/ui CLI, or duxkit-ai UI primitives, and before handing the work back to the user.
---

# Add Changelog Entry

Keep the current release notes aligned with completed feature work.

## Workflow

1. Read `projects/www/src/app/routes/docs/data/changelog.ts` and identify the newest bundle.
2. Summarize only the feature completed in the current task. Do not backfill unrelated work found in the worktree.
3. Add a concise, release-facing title to each affected group:
   - `WWW`: website pages, docs, navigation, search, SEO, demos, and site infrastructure.
   - `CLI`: `@duxkit/ui` commands, generation, configuration, registry, and package behavior.
   - `UI`: `duxkit-ai` primitives, public APIs, styling, accessibility, and interaction behavior.
4. Use one title per independently useful change. Prefer a user-visible outcome such as `CLI command reference page` over an implementation detail such as `Added cli.page.ts`.
5. Avoid duplicate entries. Keep existing entries and bundle dates unchanged unless the task explicitly changes the release bundle.
6. Update exact changelog expectations in `projects/www/src/app/routes/docs/changelog.page.spec.ts`.

## Verification

Run:

```bash
pnpm exec vitest run projects/www/src/app/routes/docs/changelog.page.spec.ts
```

If the feature also changes routing, SEO, or rendering, include the relevant targeted tests and build from that feature's workflow.

## Finish Check

- The entry describes shipped behavior, not internal file edits.
- Every affected product group has an entry.
- Unaffected groups remain unchanged.
- No unrelated worktree changes were added to the changelog.
- The changelog test passes.

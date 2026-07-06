# WWW Docs And Components IA Design

## Goal

Restructure the `www` application so broader library documentation lives under `/docs` and component reference pages live under `/components`.

The site should regain a clear primary navigation model:

- `Docs` is the product and library documentation section.
- `Components` is the reference browser for individual UI primitives.

This change should improve information architecture without broadening into a full visual redesign.

## Scope

This design covers:

- Route restructuring in the `www` Angular app.
- Header navigation updates for desktop and mobile.
- Desktop and mobile navigation behavior for docs and components sections.
- A new introduction page under `/docs`.
- Sidebar structure for both sections.
- Search routing updates needed after component routes move.
- Use of Spartan-generated primitives for the mobile drawer and FAQ accordion.

This design does not cover:

- Additional docs pages beyond `Introduction`.
- Expanded docs search across non-component pages.
- Changes to component API metadata generation.
- A broader redesign of the marketing home page.

## Information Architecture

The `www` app should have three top-level content areas:

- `/` for the marketing/home page.
- `/docs` for broad library documentation.
- `/components` for component exploration and individual component reference pages.

The components section should move from the current `/docs/components/...` route family to `/components/...`.

The docs section should be reserved for broader documentation pages and start with a single entry page:

- `/docs` -> `Introduction`

The components section should keep its existing behavior:

- `/components` -> existing explore page.
- `/components/:slug` -> existing component reference pages.

## Routing

The `www` routes should become:

```text
/                       -> home page
/docs                   -> docs shell + introduction page
/components             -> components shell + explore page
/components/:slug       -> component doc page
```

The current component docs shell should no longer live under `/docs/components`.

There should be two section shells:

- a docs shell for `/docs`
- a components shell for `/components`

These shells may share layout patterns, but the route ownership should be explicit so each section can evolve independently.

## Header Navigation

The header should restore the Spartan navigation menu on desktop with two primary links:

- `Docs`
- `Components`

Requirements:

- The active top-level section must be visually highlighted.
- Existing brand, search, and theme controls remain in the header.
- Search stays component-focused for this pass.

Desktop header behavior:

- Show inline primary navigation.
- Keep the current search trigger and theme toggle.

Mobile header behavior:

- Replace inline section navigation with a drawer opened by a Lucide hamburger icon.
- The drawer is mobile-only.
- The drawer should be the only mobile navigation surface for section and local page navigation.

## Mobile Drawer Behavior

The mobile drawer should always include both top-level links first:

- `Docs`
- `Components`

The active top-level link must be visually highlighted.

Below the top-level links, the drawer should render local navigation for the current section only:

- On `/docs...`, show the docs sidebar content.
- On `/components...`, show the components sidebar content.

This keeps cross-section movement available from every page while keeping the lower portion of the drawer contextual.

The drawer should not try to present a full site map with both local nav trees expanded at once.

## Desktop Sidebars

Desktop sidebars should remain section-local and visible on section pages.

### Docs Sidebar

The docs sidebar should include a group heading:

- `Getting Started`

For this pass it should contain one real page:

- `Introduction`

The introduction page is the landing page for `/docs` and should appear as the active sidebar item when that route is selected.

### Components Sidebar

The components sidebar should retain the existing component navigation list, but add a group heading:

- `Components`

The `/components` explore page should remain the landing page for the section.

The sidebar should not add a synthetic `Explore` item for this pass.

When the user is on `/components`, the sidebar should have a neutral state with no active component item selected. The top-level `Components` header nav item remains highlighted.

## Search

Documentation search should remain narrow for now.

Scope for this pass:

- Search continues to index component docs only.
- Search result navigation must update to route to `/components/:slug`.
- The new docs introduction page is not included in search yet.

This avoids mixing a single general docs page into a search UI currently designed around component APIs and selectors.

## Introduction Page

The new `/docs` landing page should be a real page, not a placeholder.

Its purpose is first-run orientation for someone evaluating or adopting `duxkit-ai`.

The page should contain three main sections:

1. A concise product statement
2. A `How it works` section
3. An FAQ section

### Product Statement

The opening section should explain what `duxkit-ai` is at a high level.

It should position the library clearly as composable Angular UI primitives for AI chat and agent interfaces rather than a full hosted product or full application scaffold.

### How It Works

This section should explain the composable primitive model:

- consumers compose primitives rather than install a finished chatbot app
- primitives map to common AI interface patterns such as conversation, messages, reasoning, tools, confirmations, prompt input, and related UI
- consumers bring their own model/provider and application logic

This should stay conceptual and not drift into installation documentation.

### FAQ

The FAQ should be built with Spartan primitives rather than hand-rolled disclosure UI.

For this pass, the FAQ should use the Spartan `accordion` component generated through `@spartan-ng/cli:ui`.

The FAQ entries for this pass are fixed:

- `What is Duxkit AI?`
- `Is it a full chatbot app?`
- `Do I need the AI SDK?`
- `Is Duxkit inspired by Vercel AI Elements?`
- `How does styling work?`

The answers should stay direct, product-facing, and consistent with the current library positioning and README language.

## Reuse And Boundaries

This change should prefer reuse over inventing a second docs system.

Recommended approach:

- Reuse the current docs-shell layout patterns where practical.
- Split shared layout logic only if the duplication becomes meaningful.
- Keep docs-specific and components-specific route/data ownership separate.

A reasonable decomposition is:

- shared header behavior remains in `header.component.ts`
- one docs shell for docs routes
- one components shell for component routes
- one new introduction page component

This avoids over-abstraction while keeping each route family clear.

## Spartan Dependencies

The new UI added in this pass should come from Spartan-generated primitives rather than custom drawer or disclosure implementations.

Required additions:

- mobile navigation drawer should use the Spartan `drawer` component generated through `@spartan-ng/cli:ui`
- introduction FAQ should use the Spartan `accordion` component generated through `@spartan-ng/cli:ui`

Before implementation, use the workspace runner to confirm current Spartan context and installed components:

```bash
npx nx g @spartan-ng/cli:info --json
```

At the time of this design, `accordion` and `drawer` are available but not yet installed in this workspace.

## Accessibility

The navigation changes must preserve keyboard and screen reader usability.

Requirements:

- mobile drawer trigger has a clear accessible label
- active navigation state is visually apparent and reflected accessibly where the underlying primitives support it
- drawer navigation is keyboard reachable and focus-managed by the Spartan dialog/drawer primitive used
- section sidebars remain understandable as navigational landmarks

The introduction FAQ should also preserve accessible disclosure semantics through Spartan primitives rather than custom scripting.

## Open Questions Resolved

The following decisions are intentionally fixed by this design:

- Component docs move to `/components/...` rather than staying under `/docs/components/...`.
- `/docs` lands on `Introduction`.
- `/components` lands on the existing explore page.
- Search remains component-only for now.
- Mobile uses a hamburger-triggered drawer.
- The mobile drawer always includes both top-level links plus current-section local navigation.
- Desktop sidebars are section-local.
- The components landing page keeps a neutral sidebar state.
- The components sidebar gets a `Components` group heading.

## Success Criteria

This design is successful when:

- the `www` app has distinct `/docs` and `/components` sections
- header navigation makes that split immediately obvious
- mobile users can move between `Docs` and `Components` from the drawer
- `/docs` has a substantive introduction page
- `/components` preserves the existing component exploration and doc experience with updated URLs
- the resulting structure leaves clean room for future docs pages like installation, changelog, skills, and MCP

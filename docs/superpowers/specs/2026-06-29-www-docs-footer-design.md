# WWW Docs Footer Design

## Summary

Add a global footer to the `www` docs site. The footer should make the docs feel more complete and product-like while remaining primarily useful as navigation for the current component docs.

The selected direction is a hybrid footer:

- A standalone CTA row with the headline `Build your next Angular AI surface.`
- A compact call-to-action linking to `/docs/components`
- A separate link grid row below the CTA
- Component links grouped by use case rather than shown as one long flat list

## Placement

The footer should be global and render after routed page content.

The app shell should use clear page landmarks:

- `app-header` remains at the top.
- Routed content should sit inside the page `main` landmark.
- `app-footer` should render after `main`.

This avoids placing the site footer inside the current `main.site-shell` wrapper.

## CTA Row

The first footer row should carry the main visual weight.

Headline:

```text
Build your next Angular AI surface.
```

Primary action:

```text
Explore components
```

The action should link to `/docs/components`.

Desktop layout:

- Headline aligned left.
- CTA aligned right.
- Both sit on the same row with enough spacing that the title can breathe.

Mobile layout:

- Headline stacks above the CTA.
- CTA remains easy to tap and does not stretch awkwardly unless that matches the existing button pattern.

## Link Grid

The second footer row should contain practical navigation.

Use `componentDocs` from `projects/www/src/app/docs/component-docs.registry.ts` as the component source of truth where possible. This keeps the footer in sync with the docs registry and avoids duplicating component titles and slugs.

Recommended columns:

### Duxkit UI

Short brand summary:

```text
Angular primitives for AI SDK apps, agent workflows, and generated output.
```

### Chat

- Conversation
- Message
- Attachment
- Sources

### Agent

- Task
- Tool
- Confirmation
- Checkpoint

### Thinking

- Reasoning
- Chain of Thought
- Context

### Output

- Code Block
- Shimmer
- All components

### Project

Include only links with real target URLs. Good candidates are GitHub, npm, AI SDK, and SpartanNG. If real project URLs are not available during implementation, omit this column or keep it to internal docs links.

## Styling

The footer should match the current docs visual language:

- Neutral background using existing theme variables.
- Top border separating it from page content.
- Divider between the CTA row and link grid.
- Muted link color with foreground color on hover and focus.
- Large but responsive CTA headline.
- 8px radius on the CTA button, matching existing button conventions.
- No gradients, decorative blobs, or unrelated illustration.

The footer must support both light and dark themes through existing CSS variables rather than hard-coded light-only colors.

## Accessibility

The footer should provide:

- A semantic `footer` landmark.
- A labelled navigation region for footer links.
- Visible focus styles on every link and button.
- WCAG AA color contrast in light and dark themes.
- Link text that is meaningful without relying on surrounding layout.

The implementation should avoid duplicate hidden or ambiguous labels unless needed for clarity.

## Implementation Notes

Create a small `FooterComponent` under `projects/www/src/app`.

Use:

- Standalone Angular component defaults.
- `RouterLink` for internal links.
- Signals or computed values only if needed for deriving grouped links.
- No explicit `standalone: true`.
- No explicit `ChangeDetectionStrategy.OnPush`.
- No `ngClass` or `ngStyle`.

Keep the component focused on rendering footer content. Do not introduce broader navigation or docs registry refactors unless needed to generate the grouped links cleanly.

## Testing And Verification

After implementation:

- Build the `www` project.
- Verify the footer renders on the home page and docs pages.
- Check desktop and mobile layouts.
- Check light and dark theme appearances.
- Run available tests if the changed code affects existing specs.
- Perform an accessibility pass for focus order, landmark semantics, and contrast.

# Attachment Primitive Design

## Goal

Add an Angular-native `Attachment` primitive for rendering AI SDK file and source-document parts in grid, inline, and list layouts.

## Scope

The primitive supports:

- `FileUIPart` and `SourceDocumentUIPart` from the `ai` package.
- Grid thumbnails, inline badges, and list rows.
- Automatic media kind detection for image, video, audio, document, and source attachments.
- Composable content through root, preview, and remove primitives.
- Inline hover and focus preview cards.
- Accessible labels for attachment names, media types, previews, and remove actions.
- Light and dark mode styling through Tailwind theme tokens.

The primitive does not upload files, mutate AI SDK messages directly, or manage attachment collections. Consumers own list state and remove behavior.

## Public API

```html
<ai-attachments variant="grid">
  @for (attachment of attachments; track attachment.id) {
    <ai-attachment [data]="attachment" (removed)="removeAttachment(attachment.id)">
      <ai-attachment-preview />
      <button aiAttachmentRemove></button>
    </ai-attachment>
  }
</ai-attachments>
```

`Attachments` owns layout only. `Attachment` owns data derivation and provides the current attachment state to projected children. `AttachmentPreview` renders a default visual for the attachment. `AttachmentRemove` triggers the root remove output and can be styled or given custom content by consumers.

## Architecture

The implementation follows existing `duxkit-ai` primitive patterns:

- Create a folder under `projects/duxkit-ai/src/lib/attachment/`.
- Use small standalone Angular directives/components with `input()`, `output()`, `computed()`, and `inject()`.
- Merge default Tailwind classes with consumer classes using `twMerge`.
- Use host bindings in the decorator `host` object.
- Export everything from the folder barrel and `projects/duxkit-ai/src/public-api.ts`.

The root `Attachment` exposes computed fields:

- `name`: `filename`, `title`, URL filename, or a generic fallback.
- `mediaType`: source media type or `application/octet-stream`.
- `kind`: `image`, `video`, `audio`, `document`, or `source`.
- `url`: available only for `FileUIPart`.
- `removeLabel`, `previewLabel`, and `descriptionLabel` for accessible child labels.

`AttachmentPreview` uses the injected root and parent layout to render the correct default preview. Images use the actual `FileUIPart.url`; other kinds use lucide icons. Inline mode wraps the visible badge in a hover/focus group and renders a small preview card for images and metadata.

## Testing

Tests should cover:

- Element and attribute selectors for the root primitives.
- Variant classes on the attachment collection.
- Derived name, media type, kind, URL, and labels for file and source-document data.
- Preview rendering for image, video, audio, document, and source attachments.
- Inline hover-card markup and focusability.
- Remove button accessibility and emitted remove event.
- Consumer class merging.

## Docs

The docs addition follows `docs/agent-skills/add-primitive-docs/SKILL.md`:

- Add Storybook examples under the new primitive folder.
- Register the docs page in `projects/www/src/app/docs/component-docs.registry.ts`.
- Add import and anatomy snippets in `projects/www/src/app/docs/component-doc.page.ts`.
- Add the docs preview and code snippet in `projects/www/src/app/docs/component-doc-preview.component.ts`.
- Run `pnpm docs:generate-metadata` instead of editing generated API metadata by hand.

## Verification

Run:

```bash
pnpm exec vitest run projects/duxkit-ai/src/lib/attachment/attachment.spec.ts --environment jsdom
pnpm docs:generate-metadata
pnpm exec vitest run projects/www/src/app/docs/docs-search.spec.ts --environment jsdom
pnpm test:ci
pnpm build
pnpm build:storybook
```

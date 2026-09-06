# Composable component APIs

The September 2026 composability fixes preserve convenient presets and expose their state and presentation separately. The v0.4.2 bundle includes `@duxkit/ui` 0.2.0. CLI installations export the pieces from the generated family directories; repository examples use the private workspace's focused `duxkit-ai/<family>` entrypoints.

Every component page now includes searchable composition guidance, with migration notes and import/template examples where relevant. Start at the [component docs](https://duxkit.com/components) after deployment.

For an existing app, use the [v0.4.1 → v0.4.2 migration guide](https://duxkit.com/docs/migrations/v0-4-1-to-v0-4-2). It covers CLI 0.1.0 → 0.2.0, safe regeneration, before-and-after examples, and checks after updating. The [migrations index](https://duxkit.com/docs/migrations) lists guides by release.

## Migration

- Put `status` and submission `disabled` on `form[aiPromptInput]`. `PromptInputSubmit` reads the root status; its former `status` input was removed. Native button `disabled` still disables that button alone.
- `AttachmentPreview` projects all content in consumer order. An empty preview retains the default renderer. When combining the preset with removal or other content, include `AttachmentDefaultPreview` explicitly.
- `AttachmentRemove` defaults to visible normal flow. Set `placement="grid"`, `"list"`, or `"inline-preview"` when an explicitly positioned control is wanted. Visibility no longer depends on hover, variant, or nesting.
- `ChainOfThoughtImage` is a layout host. Wrap the image in `ChainOfThoughtImageFrame` to retain the previous framed appearance; captions can be placed anywhere.
- `TaskContent` styles its host directly. Consumer classes now control its padding and border without an internal wrapper.
- `Tool` no longer imposes styles on nested `Confirmation`. Apply the desired footer classes directly to the confirmation instance.
- Styling-only components are now directives with the same exports and selectors, so they can share a host with another component. Shimmer uses native animation and respects reduced motion.

## Code blocks

`CodeBlockRoot` holds code, language, highlighted output, copied state, `copy()` and `download()`. Its header, language, actions, content, copy and download pieces can be arranged independently. `CodeBlock` uses a default composition when empty; projected content replaces that composition.

```html
<section aiCodeBlockRoot [code]="source()" language="ts">
  <div aiCodeBlockHeader>
    <span aiCodeBlockLanguage></span>
    <button aiCodeBlockCopy>Copy source</button>
  </div>
  <ai-code-block-content />
  <button aiCodeBlockDownload>Download</button>
</section>
```

`CodeBlockContent` includes the shared highlighting stylesheet, so this composition works without also rendering the preset.

## Controlled prompt drafts

`text` and `files` are models. Use `addFiles()` for local uploads to retain accept, size and count validation. Object URLs created by the root are revoked when removed, replaced or destroyed. URLs supplied by a consumer remain consumer-owned.

```html
<form aiPromptInput #prompt="aiPromptInput"
      [(text)]="draft" [(files)]="attachments"
      [status]="status()" [disabled]="disabled()"
      [resetOnSubmit]="false" (promptSubmit)="send($event)">
  <textarea aiPromptInputTextarea aria-label="Message"></textarea>
  <ai-prompt-input-attachments>
    @for (file of attachments(); track file.id) {
      <button type="button" (click)="prompt.removeFile(file.id)">
        Remove {{ file.filename }}
      </button>
    }
  </ai-prompt-input-attachments>
  <button aiPromptInputSubmit (stop)="stopResponse()"></button>
</form>
```

Call `prompt.clear()` after async success when `resetOnSubmit` is false. Clearing affects only the draft, leaving other form controls intact. Automatic clearing preserves a draft replaced while file conversion is pending. The textarea binds to the root model; bind external form state at this root instead of attaching a second value owner to the textarea.

All submission paths respect root `disabled` and generation status. `allowSubmitWhileGenerating` explicitly enables additional prompts during generation. `canSubmit()` also prevents concurrent file conversion/submission.

## Attachments

```html
<ai-attachments variant="inline">
  <ai-attachment [data]="file" (removed)="removeFile()">
    <ai-attachment-preview>
      <ai-attachment-default-preview />
      <button aiAttachmentRemove>Remove</button>
    </ai-attachment-preview>
  </ai-attachment>
</ai-attachments>
```

Replace `AttachmentDefaultPreview` with any native markup, wrappers, thumbnail/name/media pieces or a separate Brain hover-card composition. Remove controls also work outside the preview.

## Markdown renderers

`MessageContent` and `ReasoningContent` accept `codeTemplate: TemplateRef<MarkdownCodeContext>`. `$implicit` contains the fence's `code` and `language`; parsing and surrounding markdown stay with the primitive.

```html
<ng-template #fence let-block>
  <ai-code-block [code]="block.code" [language]="block.language">
    <button aiCodeBlockCopy>Copy example</button>
    <ai-code-block-content />
  </ai-code-block>
</ng-template>
<ai-message from="assistant">
  <ai-message-content [markdown]="answer()" [codeTemplate]="fence" />
</ai-message>
```

## Clipped content and steps

`ReasoningContent` and `ChainOfThoughtStep` share the exported `ContentClamp` behavior. Both expose `[(expanded)]`, `hasOverflow()`, `expandContent()` and `collapseContent()`. Set `showControls=false` to place controls anywhere. `ContentClampDirective` is independently usable on a native element via `[aiContentClamp]` and `#clamp="aiContentClamp"` (from `duxkit-ai/reasoning`).

```html
<div aiContentClamp #clamp="aiContentClamp" [collapsedMaxHeight]="160"
     [(expanded)]="expanded">{{ longText() }}</div>
<button (click)="clamp.expanded.set(!clamp.expanded())" [attr.aria-expanded]="clamp.expanded()">
  Toggle details
</button>
```

`ChainOfThoughtStep.layout` accepts a template whose `$implicit` is the step instance, allowing a completely custom layout with shared status and expansion state. Initial root expansion is preserved; streaming transitions still auto-toggle unless `autoToggle=false` or a trigger establishes manual override.

## Search, effort and usage

- `ModelSelectorCommand` provides search, selection and filtering without a dialog. Apply `ModelSelectorNativeInput` as `input[aiModelSelectorInput]` to keep native attributes, directives and accessibility labels on the input itself. `ModelSelectorSearch` is an optional styled wrapper. Both the standalone command and dialog content expose `filter`, `search`, `searchChange`, `valueChange`, and disabled state. `ModelSelector.showOverlay=false` permits a projected Brain overlay; `overlayClass` customizes the default.
- `ModelSelectorLogo` accepts `src` without a provider. Project a fallback for load failures; changing the URL retries the image.
- `ReasoningEffortSliderState` maps the root effort model to `maxIndex()`, `sliderValue()`, `isDisabled()` and `selectSliderValue(values)`. Bind those to a Brain slider and arrange track, range, thumbs and labels yourself. `ReasoningEffortSlider` retains a preset, accepts projected replacement content and forwards `orientation`.
- `ContextData` provides usage and cost state without hover presentation. The existing `Context` retains the hover preset. `ContextTrigger.contentTarget` accepts a `BrnHoverCardContent`, including one exposed by a wrapper. Projected usage rows survive zero tokens; `showZero=true` also renders the default zero-value row.

## Smaller presentation pieces

`Checkpoint.showSeparator`, `QueueItemFile.showIcon`, and `QueueSectionLabel.showIcon` disable preset decorations. Queue file content has no imposed label wrapper. `ToolStatus` accepts replacement content, and `SourcesTrigger.count` is optional for custom labels.

## Conversation renderers

`ConversationContent` exposes `atBottom()`, `scrollToBottom(behavior?)` and `notifyMessageAdded(role?)`. Set `observeMessages=false` for custom or virtualized renderers and notify after rendering a new message. Automatic scrolling always respects `stickToBottom`; an explicit jump remains available even when automatic scrolling is disabled. A scroll anchor is optional.

## Verification

- 147 library tests pass, including 20 new composition regressions.
- 97 CLI tests pass, including installation and Angular type-checking of the complete generated catalog.
- 37 WWW tests pass. The full suite now participates in `pnpm test:ci`, including docs, search, navigation, routing, SEO, changelog and migration-guide coverage (281 tests across all projects).
- Library, CLI, WWW and Storybook production builds pass.
- The packaged CLI generates and type-checks all 151 registered source files. Smoke checks compare exact paths against the package registry rather than a fixed file count.
- Browser Axe scans exercised sample stories from all 17 families. Reported violations in search badges, completed queue text and an unnamed example control were fixed. The composed CodeBlock and all three attachment presets report zero violations and zero inconclusive checks.
- Some sample scans return inconclusive checks for closed dialog references, decorative single-character line numbers, or overlay/gradient contrast. These are not a blanket WCAG certification of arbitrary consumer compositions.

## Release details

- Branch and WWW release bundle: `v0.4.2`, following the existing `v0.4.1` release.
- npm package: `@duxkit/ui@0.2.0`; generated primitive versions also record `0.2.0`.
- `duxkit-ai` remains a private workspace library and is not an npm publish target.
- The existing publishing workflow runs on a `ui-v*` tag. The prepared package passes the version check for `ui-v0.2.0`; the branch and website bundle have independent version names.
- Local `npm pack --dry-run` verified 231 package files, including all 151 templates, README, license and executable. No development-only modules or test/story files are packaged.
- All 17 prerendered component pages include composition guidance and matching table-of-contents targets; affected pages include migration notes.
- The migrations index and v0.4.1 → v0.4.2 guide are prerendered and included in the sitemap. The guide is linked from the changelog, component pages and packaged CLI README.
- Code example tabs have unique IDs per instance. `pnpm build:www` now checks the generated HTML for duplicate IDs, including pages with multiple before/after examples.

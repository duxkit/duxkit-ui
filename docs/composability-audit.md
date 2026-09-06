# Component composability assessment

Implementation: all findings addressed in this workspace. See [composable APIs and migration notes](composable-components.md). The assessment below records the pre-change behavior.

Assessed 2026-09-05. Scope: all 17 reusable component families in `projects/duxkit-ai/src/lib`, supporting markdown rendering, public exports, and relevant tests. WWW application components and copied Spartan Helm implementation are outside this assessment.

**Verdict: good compound-component foundation, but not fully composable.** Most roots expose shared state, native triggers accept content, and consumer classes merge. The main restrictions are fixed internal markup, competing state owners, and behavior tied to particular DOM arrangements.

Here, composable means consumers can replace or rearrange presentation, supply their own state and actions, and combine supported primitives without rewriting their behavior. Useful default compositions should remain available.

## Highest-priority fixes

### 1. PromptInput: submission depends on the chosen button composition

[Textarea Enter handler](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/prompt-input/prompt-input-textarea.ts:65) checks only whether the first `button[type="submit"]` is disabled. During streaming, PromptInputSubmit becomes `type="button"`; the lookup finds nothing and Enter still calls `submit()`. The [root submission method](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/prompt-input/prompt-input-root.ts:168) has no generating-state guard.

**Verified:** a streaming form displaying only Stop still emits a new prompt on Enter.

**Improve:** centralize submission eligibility in the root and use it for keyboard, form, and imperative submission. If queuing during generation is supported, expose that policy explicitly. A replacement submit button must not change eligibility accidentally.

### 2. ConversationContent: consumer scroll policy is bypassed

The [user-message branch](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/conversation/conversation-content.ts:81) scrolls directly, bypassing the `stickToBottom` check. Message detection also depends on descendant `[data-ai-message-role]` elements and their count; custom message rendering and virtualization cannot reliably supply equivalent behavior through a public interface.

**Verified:** appending a user message scrolls even with `[stickToBottom]="false"`.

**Improve:** respect the root policy on every path; expose a deliberate message-added notification and public scroll action/state for custom rendering and jump-to-latest controls. Keep DOM inference as an optional convenience.

### 3. ChainOfThought: initialization overrides supplied expansion

Its [streaming effect](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/chain-of-thought/chain-of-thought.ts:68) writes `expanded = isStreaming` on initialization. Default `isStreaming=false` closes a consumer-expanded root. Reasoning already uses transition-based auto-toggle behavior and provides a useful local precedent.

**Verified:** `[expanded]="true"` renders a collapsed trigger with default inputs.

**Improve:** toggle only on actual streaming transitions, preserving supplied initial state. Define precedence between automatic and consumer-controlled expansion. `[autoToggle]="false"` is the current workaround.

## Structural and interface improvements

| Priority | Affected pieces | Restriction and concrete improvement |
| --- | --- | --- |
| High | **CodeBlock** | [Entire template is internal](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/code-block/code-block.ts:41): header, language, body, copy and download controls cannot be omitted, reordered or replaced through projection. Actions and copied state are protected. Introduce root/content/header/actions/copy/download pieces, keeping today's layout as a preset. |
| High | **AttachmentPreview / AttachmentRemove** | [Only named slots are projected](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/attachment/attachment-preview.ts:60), in a fixed order. Arbitrary preview markup disappears; projecting one recognized piece suppresses the entire default preview. Remove rendering and [visibility](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/attachment/attachment-remove.ts:80) depend on variant and nesting. **Verified:** an ordinary custom preview span is dropped. Allow arbitrary projected content in consumer order; separate default rendering, hover-card behavior and removal visibility. Test custom wrappers and all three variants. |
| High | **PromptInput draft, reset and attachment rendering** | [Text/files are writable internal signals](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/prompt-input/prompt-input-root.ts:66), without bindable models/change outputs. The textarea also writes its native value from that state. [Submission always clears](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/prompt-input/prompt-input-root.ts:181), including `form.reset()` on every consumer control; async submission success cannot control this. [Attachments have a fixed inline renderer](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/prompt-input/prompt-input-attachments.ts:60). Provide a controlled draft interface or form adapter, consumer-controlled reset timing, and projected attachment rendering. Preserve file validation and URL ownership behind that interface. Current imperative root methods permit custom integrations, but require extra synchronization. |
| Medium | **MessageContent / ReasoningContent markdown** | Both [MessageContent](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/message/message-content.ts:54) and [ReasoningContent](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/reasoning/reasoning-content.ts:48) directly instantiate CodeBlock for fences. Highlighting configuration cannot replace the Angular renderer. Add a typed code-block template/renderer seam so callers can provide custom toolbars or previews while retaining parsing. Omitting `markdown` permits fully custom content today, but also makes the caller own rendering. |
| Medium | **ReasoningContent / ChainOfThoughtStep** | Clamp expansion is [protected local state](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/reasoning/reasoning-content.ts:102); show-more/show-less controls and their placement are internal. [Step layout](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/chain-of-thought/chain-of-thought-step.ts:56) also fixes icon, label, description and connector positions. Extract reusable clamp behavior with controlled expansion and replaceable controls; provide step layout pieces or an unopinionated composition mode. |
| Medium | **ModelSelectorInput / root / content** | [Search wraps an inaccessible-to-bindings native input](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/model-selector/model-selector-input.ts:26); only ID and placeholder are forwarded. Applying input-specific attributes/directives to the wrapper does not apply them to its input. [The root always creates its overlay](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/model-selector/model-selector.ts:27), while content bundles command filtering with dialog rendering. Expose native-input behavior and a separate search wrapper; allow overlay and filtering configuration. Keep the dialog composition as a default. Search state itself is already exposed on ModelSelectorContent. |
| Medium | **ReasoningEffortSlider** | [Slider markup is closed](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/reasoning-effort/reasoning-effort-slider.ts:32). Track/range/thumb/labels class inputs offer styling, but no replacement markup, custom labels, or forwarded orientation. Expose effort-to-slider mapping as behavior plus composable slider parts. The root model, headless trigger, and replaceable list are already strong patterns. |
| Medium | **Tool / ToolStatus** | [ToolStatus has no projected fallback](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/tool/tool-status.ts:32), so custom status markup cannot retain its behavior on the same host. [Tool imposes descendant Confirmation styles](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/tool/tool.ts:37), coupling otherwise separate families. Make status content replaceable; move integrated confirmation styling into an explicit variant or example composition. |
| Medium | **Context** | Root [bundles hover-card behavior and discovers a concrete ContextContent child](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/context/context.ts:44). This makes alternate containers or wrapper components harder to substitute. [Usage rows hide all projected content when tokens are zero](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/context/context-usage.ts:41). Separate usage context from hover presentation; allow an explicit content target and zero-value visibility policy. The injectable cost calculator is already a good seam. |
| Low | **Checkpoint, Queue, Task, ChainOfThoughtImage** | Smaller fixed fragments remain: [checkpoint separator](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/checkpoint/checkpoint.ts:15), [queue file icon/label wrapper](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/queue/queue-item-file.ts:14), [queue section chevron](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/queue/queue-section-label.ts:14), [task content wrapper](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/task/task-content.ts:12), and [image frame](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/chain-of-thought/chain-of-thought-image.ts:11). Turn these into optional pieces or replaceable fallbacks; move layout onto consumer-controlled hosts where possible. |
| Low | **SourcesTrigger / ModelSelectorLogo** | [SourcesTrigger requires count](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/sources/sources-trigger.ts:30) even when consumers replace its whole label. Make fallback-only data optional. [ModelSelectorLogo fixes models.dev as its source](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/model-selector/model-selector-logo.ts:25); allow custom image source/fallback. Consumers can already compose their own image elsewhere in a model item. |

## Cross-cutting issue: attribute selectors do not guarantee same-element composition

Several styling-only pieces are `@Component` classes with an `<ng-content />` template. Angular permits only one component per element. For example, combining [Shimmer](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/shimmer/shimmer.ts:14) and [ChainOfThoughtStepLabel](/Users/liam/Code/angular-ai-sdk-kit/projects/duxkit-ai/src/lib/chain-of-thought/chain-of-thought-step-label.ts:4) as `<span aiChainOfThoughtStepLabel aiShimmer>` matches two components.

Prefer directives for pieces that only style their host or provide behavior. For pieces that genuinely render a template, retain the component and optionally extract a behavior directive. Apply this selectively across attachment labels, chain labels, queue layout pieces, context layout pieces, sources content and shimmer. Nesting remains a valid workaround. Existing `hlmBtn` composition tests pass because HlmButton is a directive; those tests do not establish arbitrary same-host composition.

## Family coverage

| Family | Assessment |
| --- | --- |
| Attachment | Preview projection and removal placement need improvement. |
| Chain of thought | Controlled expansion bug; fixed step/clamp/image layout. |
| Checkpoint | Mostly composable; mandatory separator remains. |
| Code block | Largest structural restriction; needs compound pieces. |
| Confirmation | No major family-specific blocker found; projected states/actions and externally supplied approval data are a sound basis. |
| Context | Good data/cost seams; hover presentation and row visibility need separation. |
| Conversation | Scroll policy bug and DOM coupling. |
| Message | Root/actions largely composable; markdown renderer needs a replacement seam. |
| Model selector | Items/trigger compose well; search input and dialog internals restrict customization. |
| Prompt input | Good layout directives; submission, controlled draft and attachment rendering need work. |
| Queue | Mostly composable; fixed decorative fragments and same-host component restrictions. |
| Reasoning | Root handles streaming transitions well; markdown/clamp presentation needs seams. |
| Reasoning effort | Strong model/trigger/list; slider remains a closed composition. |
| Shimmer | Fine as a nested leaf; component form prevents stacking with another component on the same host. |
| Sources | Mostly composable; required fallback count and same-host content restriction. |
| Task | Mostly composable; fixed content wrapper remains. |
| Tool | Replaceable trigger/body; status rendering and Confirmation styling need improvement. |

## Validation and implementation order

Uncached library test run: **127 existing tests passed**. Four temporary characterization probes also passed, reproducing streaming Enter submission, disabled-policy scrolling, expansion override and discarded custom preview content: **131 total tests across 24 files**. The probes assert observed restrictions, not desired behavior; they were removed after the assessment. No production code changed.

This is an interface/source assessment with focused DOM tests, not browser or AXE certification. Overlay wrapper scenarios, form adapters and replacement renderers need dedicated integration coverage during implementation.

Recommended order: fix the three state/behavior bugs; open CodeBlock, AttachmentPreview and PromptInput composition; add renderer/clamp/native-input seams; then remove smaller mandatory presentation fragments. Preserve default compositions and test consumer-owned state, replacement content, same-host directives, keyboard paths and nested wrappers.

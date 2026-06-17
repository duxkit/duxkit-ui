# Angular AI SDK UI Kit Learning Path

## Goal

Build a reusable Angular UI kit on top of the Vercel AI SDK. The kit should be headless-first, include optional default styles, and help Angular developers compose AI interfaces without depending on React-only AI Elements.

By the end of this path, the project should have at least three reusable Angular components:

- `AiConversation`
- `AiMessage`
- `AiPromptInput`

The first version should focus on chat. Chat teaches the hardest parts of AI UI: streaming, message roles, message parts, status states, errors, cancellation, and retry.

## Guiding Principle

Do not rebuild the AI SDK. Use `@ai-sdk/angular` as the state and transport layer, then build Angular-native UI primitives around it.

The kit should answer this question:

> What would AI Elements feel like if it were built for Angular developers?

## Phase 1: Understand The Existing AI SDK UI Surface

Start here:

- AI SDK UI reference: https://ai-sdk.dev/docs/reference/ai-sdk-ui
- `useChat`: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
- `useCompletion`: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-completion
- `useObject`: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-object

What to learn:

- What `@ai-sdk/angular` already provides.
- What state comes from `useChat`.
- How `messages`, `status`, `error`, `sendMessage`, `stop`, `regenerate`, and `resumeStream` fit together.
- Why messages should be rendered from `parts`, not treated as plain strings.
- Which features belong in your UI kit and which belong to the AI SDK itself.

Deliverable:

- Write a short map of the `useChat` return shape.
- Mark each field as either "state", "command", or "advanced".
- Identify the fields your first three components need.

## Phase 2: Learn The Chat Runtime Model

Read:

- Chatbot guide: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
- Transport guide: https://ai-sdk.dev/docs/ai-sdk-ui/transport
- Message Metadata: https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata
- Chatbot Tool Usage: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

What to learn:

- The difference between UI messages and model messages.
- How `DefaultChatTransport` talks to an API endpoint.
- How request headers, body, credentials, and metadata can be customized.
- How streaming changes the UI while the assistant response is still arriving.
- How tool calls and metadata show up in the message model.

Deliverable:

- Define the minimum chat contract your components will consume.
- Keep it small:

```ts
messages
status
error
sendMessage
stop
regenerate
clearError
```

## Phase 3: Study AI Elements For Product Shape

Read:

- AI Elements: https://elements.ai-sdk.dev/
- AI Elements setup: https://elements.ai-sdk.dev/docs/setup

Study the component categories:

- Conversation
- Message
- Prompt Input
- Reasoning
- Sources
- Tool
- Attachments
- Suggestions
- Model Selector

What to learn:

- How a component library breaks an AI interface into small primitives.
- Which primitives are essential for a chat experience.
- Which primitives should wait until later.
- How composability matters more than a single large chat component.

Deliverable:

- Create a v0 component list.
- The required list is:

```text
AiConversation
AiMessage
AiPromptInput
```

- The optional later list is:

```text
AiReasoning
AiSources
AiToolCall
AiAttachments
AiSuggestionList
AiModelSelector
```

## Phase 4: Learn Angular Library Packaging

Read:

- Creating Angular libraries: https://angular.dev/tools/libraries/creating-libraries
- Using libraries: https://angular.dev/tools/libraries/using-libraries
- Library typings: https://angular.dev/tools/libraries/using-libraries#library-typings
- Angular Package Format: https://angular.dev/tools/libraries/angular-package-format

What to learn:

- Angular libraries are built with `ng-packagr`.
- A library's public API is controlled by `public-api.ts`.
- Consumer-facing types must be exported intentionally.
- Angular dependencies should be peer dependencies.
- Production library builds should be used for npm distribution.
- Local testing should include both same-workspace usage and packed package usage.

Deliverable:

- Decide the package entry point.
- Decide what gets exported publicly.
- Decide what stays internal.

Example public surface:

```ts
export * from './lib/ai-conversation/ai-conversation.component';
export * from './lib/ai-message/ai-message.component';
export * from './lib/ai-prompt-input/ai-prompt-input.component';
export * from './lib/types';
```

## Phase 5: Learn Angular Component API Design

Read:

- Angular components: https://angular.dev/guide/components
- Component inputs: https://angular.dev/guide/components/inputs
- Component outputs: https://angular.dev/guide/components/outputs
- Signals: https://angular.dev/guide/signals
- Component styling: https://angular.dev/guide/components/styling
- Accessibility: https://angular.dev/best-practices/a11y

What to learn:

- How standalone Angular components are structured.
- How to design inputs and outputs cleanly.
- How to expose default styling without trapping users in your design.
- How to make components accessible by default.
- How to keep components stateless unless they truly own state.

Design rules:

- Prefer standalone components.
- Prefer small components with clear responsibilities.
- Use inputs for data.
- Use outputs for user actions.
- Use content projection where consumers need control.
- Do not depend on Angular Material in the core package.
- Use CSS custom properties for theming hooks.

Deliverable:

- Sketch the public API for each v0 component before implementing.

## Phase 6: Build The First Three Components

### 1. `AiConversation`

Responsibility:

- Layout the conversation transcript.
- Provide a scrollable region.
- Render projected message components.
- Show optional empty state.
- Offer default spacing and responsive behavior.

Learning focus:

- Content projection.
- Scroll containers.
- Accessible landmarks.
- Default styles with override hooks.

Possible API:

```html
<ai-conversation [status]="status">
  @for (message of messages; track message.id) {
    <ai-message [message]="message" />
  }
</ai-conversation>
```

### 2. `AiMessage`

Responsibility:

- Render one AI SDK `UIMessage`.
- Style messages differently by role.
- Render message parts.
- Leave extension points for future parts such as reasoning, sources, and tools.

Learning focus:

- Message role rendering.
- Multipart message rendering.
- Safe defaults for unknown parts.
- Public type exports.

Possible API:

```html
<ai-message [message]="message" />
```

### 3. `AiPromptInput`

Responsibility:

- Capture user text.
- Submit messages.
- Disable submit during invalid states.
- Show stop action while streaming.
- Provide keyboard behavior.

Learning focus:

- Angular outputs.
- Forms ergonomics.
- Keyboard accessibility.
- Loading and disabled states.

Possible API:

```html
<ai-prompt-input
  [status]="status"
  placeholder="Ask anything"
  (submitted)="sendMessage({ text: $event })"
  (stopped)="stop()"
/>
```

## Phase 7: Prove The Kit In A Playground App

The playground is not optional. It proves the package feels usable from the outside.

The playground should demonstrate:

- Basic chat.
- Streaming state.
- Error state.
- Empty state.
- Disabled submit behavior.
- Stop generation.
- Regenerate response.
- Default styling.
- Consumer style overrides.

Read:

- Angular library local usage: https://angular.dev/tools/libraries/creating-libraries#using-your-own-library-in-applications
- Library rebuilding: https://angular.dev/tools/libraries/creating-libraries#building-and-rebuilding-your-library
- Local linking: https://angular.dev/tools/libraries/creating-libraries#linking-libraries-for-local-development

Deliverable:

- A playground page using only public package exports.
- No imports from internal library paths.

## Phase 8: Test The Package Surface

Test in three ways:

1. Same workspace usage.
2. Production library build.
3. Packed package install using `npm pack`.

What to verify:

- The package builds.
- Type declarations are present.
- Public imports work.
- Deep internal imports are unnecessary.
- Default styles are included.
- Peer dependencies are correct.
- The playground does not rely on private files.

Deliverable:

- A package that can be installed into a separate Angular app and used with the three v0 components.

## Phase 9: Expand After V0

Add components only after the first chat flow works well.

Recommended order:

1. `AiReasoning`
2. `AiSources`
3. `AiToolCall`
4. `AiAttachments`
5. `AiSuggestionList`
6. `AiModelSelector`

Each new component should be justified by an AI SDK message part or a repeated UI need in the playground.

## Milestone Checklist

The learning path is complete when:

- You understand the role of `@ai-sdk/angular`.
- You can explain the `useChat` state model.
- You can render AI SDK `UIMessage` values.
- You can send a message from Angular UI into the AI SDK.
- You can package an Angular library.
- You can consume the package from a playground app.
- You have at least three reusable components:
  - `AiConversation`
  - `AiMessage`
  - `AiPromptInput`

## Main References

- AI SDK UI reference: https://ai-sdk.dev/docs/reference/ai-sdk-ui
- `useChat`: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
- `useCompletion`: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-completion
- `useObject`: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-object
- AI SDK Chatbot guide: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
- AI SDK Transport guide: https://ai-sdk.dev/docs/ai-sdk-ui/transport
- AI Elements: https://elements.ai-sdk.dev/
- Angular library creation: https://angular.dev/tools/libraries/creating-libraries
- Angular library typings: https://angular.dev/tools/libraries/using-libraries#library-typings
- Angular Package Format: https://angular.dev/tools/libraries/angular-package-format
- Angular components: https://angular.dev/guide/components
- Angular signals: https://angular.dev/guide/signals
- Angular accessibility: https://angular.dev/best-practices/a11y

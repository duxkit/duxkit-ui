# Changelog

All notable changes to DuxKit AI will be documented in this file.

This project is pre-1.0. Breaking changes may happen before a stable release and should be called out here with migration notes when practical.

## Unreleased

## v0.4.2 - 2026-09-06

### @duxkit/ui 0.2.0

- Arrange code blocks, attachment previews and reasoning panels to fit your app. Use your own
  layouts and controls while keeping the built-in behaviour.
- Keep prompt text and attachments in your app state, and choose when to clear them. Disabled
  and busy prompts now follow the same submission rules for Enter and the submit button.
- Turning off auto-scroll now keeps the chat in place as messages arrive. Thought panels keep
  the initial open or closed state you choose.
- The CLI now installs the new component parts along with their required dependencies.
- New docs examples show how to customise components and update your existing code.
- Follow the [v0.4.1 → v0.4.2 migration guide](https://duxkit.com/docs/migrations/v0-4-1-to-v0-4-2)
  for upgrade commands, before-and-after examples and checks for existing apps.
- **Migration:** move `PromptInputSubmit.status` to `form[aiPromptInput]`; explicitly compose
  `AttachmentDefaultPreview` when adding content to a preset preview and choose removal placement;
  use `ChainOfThoughtImageFrame` for framed images. Task padding/borders now live on the host, and
  nested confirmations need their own styles. See [the full migration guide](docs/composable-components.md).

## 0.0.1 - 2026-07-17

- Published the first public Duxkit AI component library and source installer.
- Added interactive CLI setup and primitive selection for Angular and Nx workspaces.
- Added shared-library generation under `libs/dux-ui` with configurable library paths.

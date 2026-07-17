# Publishing

`duxkit-ai` and `@duxkit/ui` are published independently to npm by GitHub Actions.

## Before release

1. Update the package version and `CHANGELOG.md`.
2. Run the release checks:

   ```bash
   pnpm check:conventions
   pnpm test:ci
   pnpm build
   pnpm check:package-entrypoints
   pnpm smoke:cli
   pnpm build:storybook
   ```

3. Inspect both packages:

   ```bash
   npm pack --dry-run ./dist/duxkit-ai
   npm pack --dry-run ./dist/cli
   ```

## Release

Push the matching tag for the package being released:

- `ai-v<version>` publishes `duxkit-ai`
- `ui-v<version>` publishes `@duxkit/ui`

The workflows reject tags that do not match the package version. npm publishing uses public access,
provenance, and the repository `NPM_TOKEN` secret.

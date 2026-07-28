# Publishing

`@duxkit/ui` is the only package published to npm.

`projects/duxkit-ai` is the canonical internal primitive source. It is marked private and must not
be published. Its source inventory is synchronized into the CLI package before release.

## Before release

1. Update the version in `projects/cli/package.json` and the current release bundle in
   `projects/www/src/app/routes/docs/data/changelog.ts`.
2. Synchronize and validate the packaged primitive templates:

   ```bash
   pnpm cli:sync-templates
   pnpm cli:check-templates
   ```

3. Run the release checks:

   ```bash
   pnpm check:conventions
   pnpm test:ci
   pnpm build
   pnpm check:package-entrypoints
   pnpm smoke:cli
   pnpm build:storybook
   ```

4. Inspect the package:

   ```bash
   npm pack --dry-run ./dist/cli
   ```

## Release

Push `ui-v<version>`, matching `projects/cli/package.json`, to run the
[`publish-cli.yml`](.github/workflows/publish-cli.yml) workflow.

The workflow validates the version, tests and builds the CLI, inspects the package contents, and
publishes `@duxkit/ui` with public access and npm provenance.

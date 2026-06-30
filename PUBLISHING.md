# Publishing Checklist

Use this checklist before publishing `duxkit-ai`.

1. Start from a clean install.

   ```bash
   nvm use
   pnpm install --frozen-lockfile
   ```

2. Run the required checks.

   ```bash
   pnpm build:lib
   pnpm test:ci
   pnpm build:www
   pnpm build:storybook
   ```

3. Inspect the package tarball.

   ```bash
   npm pack --dry-run ./dist/duxkit-ai
   ```

4. Confirm the package README, license, peer dependency ranges, and public API exports are intentional.

5. Publish with npm 2FA enabled. Use provenance publishing if the release workflow is configured for it.

6. Tag the release and update `CHANGELOG.md` with user-facing changes.

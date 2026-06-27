# duxkit-ai

Angular AI UI library using `@ai-sdk/angular`, `ai`, and Spartan.

Build from the workspace root:

```bash
pnpm build:lib
```

The package exposes the primary `duxkit-ai` entrypoint.

Generated Spartan HLM primitives are private workspace UI code and are not published by `duxkit-ai`.

Consumers must provide the peer dependencies listed in `package.json`, configure `@tailwindcss/postcss`, and include the Spartan Tailwind preset in their app styles.

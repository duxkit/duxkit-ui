# duxkit-ai

Angular AI UI library using `@ai-sdk/angular`, `ai`, and Spartan Helm.

Build from the workspace root:

```bash
pnpm build:lib
```

The package exposes the primary `duxkit-ai` entrypoint plus generated Helm secondary entrypoints:

- `duxkit-ai/helm/button`
- `duxkit-ai/helm/input`
- `duxkit-ai/helm/textarea`
- `duxkit-ai/helm/avatar`
- `duxkit-ai/helm/tooltip`
- `duxkit-ai/helm/utils`

Consumers must provide the peer dependencies listed in `package.json`, configure `@tailwindcss/postcss`, and include the Spartan Tailwind preset in their app styles.

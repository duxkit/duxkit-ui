# ai-sdk-angular

Angular AI UI library using `@ai-sdk/angular`, `ai`, and Spartan Helm.

Build from the workspace root:

```bash
pnpm build:lib
```

The package exposes the primary `ai-sdk-angular` entrypoint plus generated Helm secondary entrypoints:

- `ai-sdk-angular/helm/button`
- `ai-sdk-angular/helm/input`
- `ai-sdk-angular/helm/textarea`
- `ai-sdk-angular/helm/avatar`
- `ai-sdk-angular/helm/tooltip`
- `ai-sdk-angular/helm/utils`

Consumers must provide the peer dependencies listed in `package.json`, configure `@tailwindcss/postcss`, and include the Spartan Tailwind preset in their app styles.

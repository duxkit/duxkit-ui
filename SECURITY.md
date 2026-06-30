# Security Policy

## Supported Versions

DuxKit AI is currently pre-1.0. Security fixes are expected to target the latest published version only unless a broader fix is practical.

## Reporting A Vulnerability

Do not open a public issue with vulnerability details.

Use GitHub private vulnerability reporting for this repository when available. If it is not available, open a minimal public issue asking for a private security contact and omit exploit details.

Please include:

- affected package version or commit
- affected component or API
- reproduction steps
- expected impact
- any known workaround

## Response Expectations

This is a solo-maintained project. Expect a best-effort initial response within 7 days. Confirmed vulnerabilities will be fixed and disclosed in release notes when appropriate.

## Secrets

The library should not require provider secrets in browser code. Application servers or API routes should own provider credentials. The local playground server is for development and should not be treated as production infrastructure.

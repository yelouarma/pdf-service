# AGENTS.md — PDF Service (Node.js)

Instructions for coding agents working in the `pdf-service/` project.

## Scope

This file applies to `pdf-service/` only — a Node.js service for PDF generation.

## Guidelines

No stack-specific guideline files for this project. Follow the global rules:

- No mock data in production code.
- No hardcoded business values or user-facing text.
- No dead code.

## Key Facts

- Docker image: `ghcr.io/yelouarma/pdf-service:latest`
- Dockerfile must include `COPY assets` for fonts (NotoSans)
- Vercel deployment: `INTERNAL_API_KEY=dev-internal-key`
- CI: `.github/workflows/deploy-pdf-service.yml` (publish-docker job)

## Validation Commands

```bash
npm install
npm test
npm run dev   # Local dev server
```

# ResumeForge AI

AI-powered, ATS-friendly resume builder for software professionals.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL 16, Prisma 6 ORM |
| Auth | JWT + Passport.js + bcrypt |
| AI | Ollama / Gemini / OpenRouter (pluggable) |
| Monorepo | TurboRepo + pnpm 9 |

## Quick Start

```bash
pnpm install
docker compose -f docker/docker-compose.yml up -d
pnpm dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

## Build

```bash
pnpm build          # Build all packages
pnpm build:api      # Build only API
pnpm build:web      # Build only web
```

## Project Structure

```
apps/
  api/        NestJS backend
  web/        Next.js frontend
packages/
  prompts/    AI prompt templates (.md)
docs/         Sprint logs, plans, architecture
docker/       PostgreSQL container
```

## Sprints

| Sprint | Status |
|--------|--------|
| 0-1 Foundation | ✅ |
| 2 Auth | ✅ |
| 3 Career Profile | ✅ |
| 4 Resume Builder | ✅ |
| 5 PDF Generator | ⚠️ Partial |
| 6 AI Assistant | ✅ |
| 7 ATS Analyzer | ⬜ |
| 8 JD Matcher | ⬜ |
| 9 Testing & Polish | ⬜ |
| 10 Deployment | ⬜ |

# ResumeForge AI — Execution Plan

## Prerequisites — What You Need Installed

### Essential (required)
| Tool | Version | Why | Install Command |
|------|---------|-----|----------------|
| **Node.js** | >=18.x | Runtime for Next.js + NestJS | `winget install OpenJS.NodeJS.LTS` or `nvm install lts` |
| **pnpm** | >=9.x | Package manager (TurboRepo requires it) | `npm install -g pnpm` |
| **Git** | latest | Version control | `winget install Git.Git` |
| **Docker Desktop** | latest | PostgreSQL + local dev | `winget install Docker.DockerDesktop` |
| **VS Code** | latest | Editor | `winget install Microsoft.VisualStudioCode` |

### Nice to have for AI (Phase 6)
| Tool | Why |
|------|-----|
| **Ollama** | Run LLMs locally for free (Llama 3.1, Qwen, Gemma) |
| **Google AI Studio API key** | Free Gemini tier for MVP |
| **OpenRouter API key** | Backup/free tier models |

### VS Code Extensions to install
- ESLint, Prettier, Prisma, Tailwind CSS IntelliSense, PostCSS Language Support, Thunder Client (API testing)

---

## Project Structure (we build this)

```
ResumeForgeAI/
├── apps/
│   ├── web/                 # Next.js 15 (frontend)
│   └── api/                 # NestJS (backend)
├── packages/
│   ├── ui/                  # Shared React components (shadcn/ui)
│   ├── shared/              # DTOs, constants, helpers
│   ├── prompts/             # AI prompt .md files
│   ├── config/              # Shared ESLint, tsconfig
│   ├── eslint-config/
│   └── tsconfig/
├── docs/                    # Documentation (markdown)
├── docker/                  # Dockerfiles + docker-compose
├── .github/                 # GitHub Actions workflows
├── package.json             # Root workspace config
├── turbo.json               # TurboRepo pipeline
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
└── README.md
```

---

## Sprint Plan (10 Sprints, ~10 Weeks)

---

### Sprint 0 — Environment Setup (Day 1)

**Goal**: Everything installed and working

- [ ] Install Node.js, pnpm, Git, Docker Desktop
- [ ] Verify: `node -v`, `pnpm -v`, `git --version`, `docker --version`
- [ ] Install VS Code extensions
- [ ] Install Ollama (optional): `winget install Ollama.Ollama`
- [ ] Pull a model: `ollama pull llama3.1:8b`
- [ ] Create GitHub repository and clone locally

---

### Sprint 1 — Project Foundation (Week 1)

**Goal**: Monorepo boots, PostgreSQL runs, Prisma connects, CI passes

#### 1A — Initialize the monorepo
```bash
mkdir ResumeForgeAI && cd ResumeForgeAI
git init
pnpm init
pnpm add -g turbo
```

- Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- Create `turbo.json` with build/lint/dev pipelines
- Create root `package.json` with scripts:
  - `dev` — runs both web + api
  - `build` — builds all
  - `lint` — lints all
  - `format` — prettier all

#### 1B — Scaffold apps and packages
```bash
# Backend
pnpm create @nestjs/core apps/api
cd apps/api
pnpm add @nestjs/config @nestjs/swagger @nestjs/jwt @nestjs/passport
pnpm add passport passport-jwt bcrypt class-validator class-transformer
pnpm add prisma @prisma/client
pnpm add -D prisma

# Frontend
pnpm create nextjs apps/web --typescript --tailwind --app
cd apps/web
pnpm add zustand @tanstack/react-query react-hook-form zod @hookform/resolvers
pnpm add @react-pdf/renderer
pnpx shadcn-ui@latest init  # Set up shadcn/ui

# Shared packages
mkdir -p packages/ui packages/shared packages/prompts packages/config packages/eslint-config packages/tsconfig
```

- Each shared package gets its own `package.json` and `tsconfig.json`
- `packages/config` — shared environment constants, API base URLs

#### 1C — Docker setup
- Create `docker/docker-compose.yml`:
```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: resumeforge
      POSTGRES_USER: resumeforge
      POSTGRES_PASSWORD: resumeforge
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- Create `docker/Dockerfile.api` (NestJS) and `docker/Dockerfile.web` (Next.js)

#### 1D — Prisma schema
- Create `apps/api/prisma/schema.prisma` with ALL tables from Database Design doc:
  - User, Resume, ResumeVersion, GeneratedPDF, ATSReport, AIProvider, AILog, UserSettings, ActivityLog, ProjectBlueprint, Template (plus RefreshToken)

- **Key enums**: `ResumeStatus` (DRAFT, READY, ARCHIVED, DELETED), `AIStatus` (PENDING, SUCCESS, FAILED, TIMEOUT), `UserRole` (USER, ADMIN)

- Create `apps/api/src/database/` module with Prisma service

#### 1E — Config & CI/CD
- Root `.env.example` with all vars (DATABASE_URL, JWT_SECRET, AI_PROVIDER, etc.)
- Copy to `.env` with dev defaults
- `.gitignore` — node_modules, .env, dist, .next, prisma/generated
- `.github/workflows/ci.yml` — lint → test → build on push/PR
- `apps/api/.eslintrc.js`, `apps/web/.eslintrc.json` (extend shared config)
- `.prettierrc` — consistent formatting across all packages

#### 1F — Verify
```bash
docker compose up -d          # Start PostgreSQL
pnpm install                  # Install all deps
pnpm dev                      # Both apps start
```

**✅ Deliverable**: `pnpm dev` runs both apps, PostgreSQL is up, Prisma generates client, Swagger loads at `/api/docs`

---

### Sprint 2 — Authentication (Week 2)

**Goal**: User can register, login, see dashboard

#### Backend tasks
| Task | File | Details |
|------|------|---------|
| Auth module | `apps/api/src/auth/` | Controller, Service, Module |
| Register DTO | `auth/dto/register.dto.ts` | email, password, fullName, validation with class-validator |
| Login DTO | `auth/dto/login.dto.ts` | email, password |
| JWT strategy | `auth/jwt.strategy.ts` | Passport JWT, extract from Bearer token |
| Auth controller | `auth/auth.controller.ts` | POST /api/v1/auth/register, /login, /refresh, /logout, /forgot-password, /reset-password, /verify-email |
| Password hashing | `auth/` | bcrypt, 12 rounds |
| Refresh token | `auth/` | Store in DB, rotate on use |
| Prisma User model | Already in schema | email unique index, password_hash |

#### Frontend tasks
| Task | File | Details |
|------|------|---------|
| Auth store | `store/auth.store.ts` | Zustand: user, token, login/logout actions |
| API client | `lib/api.ts` | Axios/fetch wrapper with interceptors (attach JWT, handle 401 → refresh) |
| Login page | `app/(auth)/login/page.tsx` | Form with react-hook-form + zod validation |
| Register page | `app/(auth)/register/page.tsx` | Form |
| Forgot password | `app/(auth)/forgot-password/page.tsx` | |
| Auth guard | `components/auth-guard.tsx` | Redirect to /login if no token |
| Dashboard shell | `app/(dashboard)/layout.tsx` | Sidebar + header + main area |

#### API endpoints created
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
GET  /api/v1/auth/me
```

**✅ Deliverable**: User signs up → email verification → login → sees dashboard

---

### Sprint 3 — Career Profile (Week 3)

**Goal**: User fills their career profile once (master data)

#### Backend tasks
| Task | File | Details |
|------|------|---------|
| CareerProfile module | `modules/career-profile/` | Controller, Service, Module |
| CareerProfile DTOs | `dto/` | Create, Update (with nested validation) |
| Profile schema | Prisma | Add CareerProfile model OR store in User model as JSON field |
| Profile controller | Controller | GET/POST/PUT/PATCH /api/v1/career-profile |
| Sections | Schema | Personal info, Education[], Skills[], Experience[], Projects[], Certifications[], Languages[], Achievements[] |

**Design decision**: Store career profile as a JSON column on the User model OR a separate `career_profile` table with a JSON column. JSON is more flexible — adding sections later requires no migration.

#### Frontend tasks
| Task | Details |
|------|---------|
| Multi-step wizard | Stepper component (Personal → Education → Skills → Experience → Projects → Summary) |
| Personal info form | Name, email, phone, linkedin, github, portfolio, location |
| Education form | Add/remove multiple, fields: degree, college, year, cgpa |
| Skills form | Categorized (programming, automation, cloud, etc.), tag-style input |
| Experience form | Add/remove, fields: company, role, client, dates, tech stack, responsibilities, achievements |
| Projects form | Add/remove, fields: name, domain, description, tech stack, github, live url |
| Auto-save | On every field change (debounced 2s), show "Saved" indicator |
| AI buttons | Placeholder buttons: "Generate with AI" (wired in Sprint 6) |

#### API endpoints
```
GET    /api/v1/career-profile
POST   /api/v1/career-profile
PUT    /api/v1/career-profile
```

**✅ Deliverable**: User fills career profile, data persists, profile is reusable across all resumes

---

### Sprint 4 — Resume Builder (Week 4-5)

**Goal**: User creates a resume from their career profile, can edit sections, see live preview

#### Backend tasks
| Task | Details |
|------|---------|
| Resume module | CRUD: Create, List, Get, Update, Delete, Duplicate |
| ResumeVersion | Auto-create version on every save (store `resume_json` — JSON snapshot of selected sections and content) |
| Resume serialization | Pull from career profile, allow overrides per resume |
| Template assignment | GET /templates, POST /resumes/:id/select-template |

#### Resume JSON structure (stored in `resume_version.resume_json`)
```json
{
  "templateId": "ats-classic",
  "sections": {
    "personal": { "visible": true, "data": { ... } },
    "summary": { "visible": true, "text": "..." },
    "education": { "visible": true, "items": [...] },
    "skills": { "visible": true, "categories": [...] },
    "experience": { "visible": true, "items": [...] },
    "projects": { "visible": true, "items": [...] },
    "certifications": { "visible": true, "items": [...] },
    "languages": { "visible": true, "items": [...] }
  },
  "metadata": {
    "targetRole": "QA Automation Engineer",
    "atsScore": null
  }
}
```

#### Frontend tasks
| Task | Details |
|------|---------|
| Resume list page | Cards for each resume, "Create New" button |
| Resume builder layout | 3-panel: Career Data (left) | Preview (center) | AI Assistant (right) — placeholder |
| Section toggles | Show/hide sections in resume |
| Drag-and-drop section ordering | Simple reorder |
| Template selector | Card grid — ATS Classic, Modern, Minimal |
| Live preview | Renders resume in real-time as JSON → styled preview |
| Version history panel | List of versions, click to restore |
| Auto-save | Debounced, shows status |

#### API endpoints
```
GET    /api/v1/resumes
POST   /api/v1/resumes
GET    /api/v1/resumes/:id
PUT    /api/v1/resumes/:id
DELETE /api/v1/resumes/:id
POST   /api/v1/resumes/:id/duplicate
GET    /api/v1/resumes/:id/versions
POST   /api/v1/resumes/:id/versions
POST   /api/v1/resumes/:id/restore/:version
GET    /api/v1/templates
POST   /api/v1/resumes/:id/select-template
```

#### Templates (build 3)
| Template | Style |
|----------|-------|
| ATS Classic | Single column, clean, no icons, standard fonts |
| Modern | Two-column, accent color header, icons |
| Minimal | Lots of whitespace, elegant typography |

Each template is a JSON config (fonts, colors, spacing, section layout) + a React component for rendering.

**✅ Deliverable**: User picks template, selects/resumes sections from profile, sees live preview

---

### Sprint 5 — PDF Generator (Week 5 — overlaps with Sprint 4)

**Goal**: Download resume as PDF

#### Implementation options
| Option | Pro | Con |
|--------|-----|-----|
| **@react-pdf/renderer** | Pure React, easy to style, server-side | Limited CSS support |
| **Puppeteer** | Full CSS/HTML support, pixel-perfect | Heavier, requires Chromium |

**Recommendation**: Start with `@react-pdf/renderer`. It's simpler and sufficient for ATS-friendly templates.

#### Backend tasks
| Task | Details |
|------|---------|
| PDF generation endpoint | POST /api/v1/pdf/generate → accepts resume JSON + template ID → returns PDF URL |
| PDF download endpoint | GET /api/v1/pdf/download/:id → returns file |
| Store generated PDFs | `generated_pdf` table: resume_id, version, file_url |

#### Frontend tasks
| Task | Details |
|------|---------|
| "Download PDF" button | In resume preview |
| Format options | A4, Letter; one-page / two-page |
| Loading state | Spinner during generation |

**✅ Deliverable**: User clicks Download → PDF is generated and saved

---

### Sprint 6 — AI Assistant (Week 6-7)

**Goal**: AI generates/improves summary, experience, projects, achievements

#### Provider architecture
```
src/assistant/
├── assistant.module.ts
├── assistant.service.ts      # Orchestrates calls
├── assistant.factory.ts       # Returns provider based on env
├── assistant.interface.ts     # { generate(prompt: string): Promise<string> }
├── providers/
│   ├── ollama.provider.ts
│   ├── gemini.provider.ts
│   └── openrouter.provider.ts
└── prompts/
    ├── summary.md
    ├── experience.md
    ├── project.md
    ├── ats.md
    └── jd.md
```

#### Prompt files — structure
Each prompt follows: **System message** (role) → **User message** (with variables) → **Expected JSON output**

Example `summary.md`:
```
System:
You are a senior technical recruiter...
Generate a professional summary for a {{targetRole}} with {{yearsExperience}} years of experience.
...
Return ONLY valid JSON: { "summary": "...", "keywords": [...] }
```

#### Backend tasks
| Task | Details |
|------|---------|
| Assistant module | Module, Service, Factory, Interface |
| Ollama provider | Call `http://localhost:11434/api/generate`, send prompt |
| Gemini provider | Call Gemini API with key from env |
| OpenRouter provider | Call OpenRouter API |
| Prompt loader | Read `.md` files from `packages/prompts/`, parse system/user, substitute variables |
| Response validator | Check JSON validity, required fields, length limits |
| Retry logic | Retry once on failure, then try next provider if configured |
| AI logging | Store provider, feature, response_time, status in `ai_log` |
| AI endpoints | POST /api/v1/assistant/generate-summary, /rewrite-experience, /generate-project, /generate-achievements |

#### Frontend tasks
| Task | Details |
|------|---------|
| AI Assistant panel | Right panel in resume builder (collapsible) |
| "Generate" buttons | Next to summary, experience, project fields |
| Loading state | Streaming text animation |
| Accept/Reject | User can accept AI suggestion or dismiss it |
| "Improve" button | Rewrite existing content |
| Error state | "AI unavailable — try later" with fallback to manual edit |

#### API endpoints
```
POST /api/v1/assistant/generate-summary
POST /api/v1/assistant/rewrite-experience
POST /api/v1/assistant/generate-project
POST /api/v1/assistant/generate-achievements
```

**✅ Deliverable**: User clicks "Generate Summary" → AI writes it → user accepts or edits

---

### Sprint 7 — ATS Analyzer (Week 8)

**Goal**: Resume gets scored, suggestions appear

#### ATS scoring (can work WITHOUT AI for basic checks)
| Metric | How it works |
|--------|-------------|
| Keywords | Compare resume skills/experience against a curated keyword list per role (e.g., QA → Selenium, Playwright, API Testing, CI/CD) |
| Formatting | Check font, font size, margins, section headers, consistent spacing |
| Readability | Bullet points, action verbs, quantified achievements |
| Grammar | Basic checks (can use AI for advanced) |
| Length | One-page / two-page validation |

#### Backend tasks
| Task | Details |
|------|---------|
| ATS module | Controller, Service |
| Scoring engine | Rule-based scoring for MVP (keyword matching, formatting checks, readability heuristics) |
| AI-enhanced scoring | Use AI only for "Suggestions" (what to improve) |
| Save results | `ats_report` table |

#### Frontend tasks
| Task | Details |
|------|---------|
| ATS Score dashboard | Beautiful card: Overall 92% + sub-scores (Keywords, Formatting, Grammar, Readability, Impact) |
| Suggestions list | "Need Action Verbs", "Missing Selenium keyword", "Add CI/CD", "Quantify achievements" |
| Improvement buttons | Click a suggestion → auto-fix or open relevant section |

#### API endpoints
```
POST /api/v1/ats/analyze
GET  /api/v1/ats/history (optional)
```

**✅ Deliverable**: User gets ATS score + actionable suggestions

---

### Sprint 8 — JD Matcher (Week 9)

**Goal**: Upload a job description → compare with resume → see match score → improve

#### Backend tasks
| Task | Details |
|------|---------|
| JD module | Controller, Service |
| JD upload | Accept text or file, store temporarily, extract text |
| Keyword extraction | Extract required skills, preferred skills, years of experience from JD |
| Comparison engine | Compare JD keywords vs resume skills/experience |
| Match score | Overall match % + per-category breakdown |
| Missing suggestions | List missing keywords → "Add to resume" button |

#### Frontend tasks
| Task | Details |
|------|---------|
| JD upload page | Textarea (paste JD) + file upload (.txt, .pdf, .docx) |
| Match results | Visual comparison — "Your Resume" vs "Job Requires" |
| Missing skills | Tag list with "Add to resume" action |
| Improve button | Auto-add missing keywords to skills/experience sections |

#### API endpoints
```
POST /api/v1/jd/upload
POST /api/v1/jd/match
GET  /api/v1/jd/history
```

**✅ Deliverable**: User pastes JD → sees 81% match → "Missing: Docker, Jenkins, Playwright" → clicks to add

---

### Sprint 9 — Testing & Polish (Week 10)

**Goal**: Production-ready quality

#### Testing
| Type | Tool | What to test |
|------|------|-------------|
| Unit — Backend | Jest | Services, validators, AI providers, ATS engine |
| Unit — Frontend | Vitest | Zustand stores, utility functions, form validation |
| Integration | Supertest (NestJS) | All API endpoints, auth flow, resume CRUD |
| E2E | Playwright | Full user journey: Register → Profile → Resume → AI Summary → ATS → JD → Download PDF |
| Performance | k6 or autocannon | PDF generation time, AI response time |

#### Polish
| Task | Details |
|------|---------|
| Error boundaries | Catch React errors gracefully |
| Loading skeletons | Shimmer placeholders while data loads |
| Empty states | "No resume yet — let's build one" with CTA |
| Toast notifications | Success/error feedback on all actions |
| Responsive | Tablet + mobile layouts |
| Accessibility | Keyboard nav, ARIA labels, screen reader testing |
| Dark mode | Toggle in settings |

#### Documentation
| File | Contents |
|------|---------|
| `README.md` | Project overview, tech stack, setup instructions, screenshots |
| `CONTRIBUTING.md` | How to contribute, PR process |
| `ARCHITECTURE.md` | High-level architecture diagram + explanation |
| `ROADMAP.md` | Current + planned features |
| `CHANGELOG.md` | Version history |
| `SECURITY.md` | Security policy |
| `LICENSE` | Open-source license |

**✅ Deliverable**: All tests pass, CI green, docs written

---

## Sprint 10 — Deployment (End of Week 10)

**Goal**: Live on the internet

| Service | What | Estimated cost |
|---------|------|---------------|
| **Vercel** | Frontend (Next.js) | Free tier |
| **Railway** or **Fly.io** | Backend (NestJS) | Free tier (small) |
| **Neon** or **Supabase** | PostgreSQL | Free tier (500MB-1GB) |
| **Namecheap** or **GoDaddy** | Domain (e.g., resumeforge.ai) | ~₹1,000/year |
| **Cloudflare** | DNS + CDN | Free |

### Deployment steps
1. Push to GitHub main branch
2. Connect Vercel to `apps/web` — auto-deploys
3. Connect Railway to `apps/api` with env vars
4. Set up Neon PostgreSQL, copy connection string to Railway env
5. Run `prisma migrate deploy` on Railway
6. Point domain to Vercel
7. Test end-to-end on production URL

---

## Summary — Quick Reference

| Sprint | Focus | Key Deliverable |
|--------|-------|----------------|
| 0 | Environment | Node, pnpm, Docker, Git installed, repo created |
| 1 | Foundation | TurboRepo, Next.js, NestJS, Prisma, Docker, CI |
| 2 | Auth | Register, login, JWT, dashboard |
| 3 | Career Profile | One profile → master data |
| 4 | Resume Builder | 3-panel editor, templates, versioning |
| 5 | PDF Generator | Download ATS-friendly PDF |
| 6 | AI Assistant | Ollama/Gemini/OpenRouter, prompts, generation |
| 7 | ATS Analyzer | Score, keywords, suggestions |
| 8 | JD Matcher | Upload → match → improve |
| 9 | Testing + Polish | Tests, docs, responsive, dark mode |
| 10 | Deployment | Live on Vercel + Railway + Neon |

## Immediate Next Step

Sprint 0: Install everything, create the GitHub repo, and clone it. From there, I can help you execute Sprint 1 step by step.

Want to start with Sprint 0?

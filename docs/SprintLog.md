# Sprint Log — ResumeForge AI

## Completed Sprints

| Sprint | Focus            | Status      |
| ------ | ---------------- | ----------- |
| 0      | Environment      | ✅ Complete |
| 1      | Foundation       | ✅ Complete |
| 2      | Auth             | ✅ Complete |
| 3      | Career Profile   | ✅ Complete |
| 4      | Resume Builder   | ✅ Complete |
| 5      | PDF Generator    | ⚠️ Partial  |
| 6      | AI Assistant     | ✅ Complete |
| 7      | ATS Analyzer     | ⬜ Pending  |
| 8      | JD Matcher       | ⬜ Pending  |
| 9      | Testing & Polish | ⬜ Pending  |
| 10     | Deployment       | ⬜ Pending  |

---

## Sprint 5 — PDF Generator

### Original Approach

Built with `@react-pdf/renderer` v4.5.1:
- `apps/api/src/pdf/resume-pdf.tsx` — React PDF component using `@react-pdf/renderer` primitives
- `apps/api/src/pdf/pdf.service.ts` — Generates PDF via `renderToBuffer()` or `renderToStream()`
- API endpoint `POST /api/resumes/:id/pdf/generate` → returns PDF file

### Issue

`@react-pdf/renderer` v4 uses a custom React reconciler that:
- Does not support `React.Fragment`
- Fails on `null` children in arrays (`Cannot read properties of null (reading 'props')`)
- Requires every array element to have a `key` prop

### Fix Attempted

| File | Change |
|------|--------|
| `resume-pdf.tsx` | Removed all `<React.Fragment>`, wrapped in `<View key={...}>` |
| `resume-pdf.tsx` | Added `.filter(Boolean)` on all array renders to strip null children |
| `resume-pdf.tsx` | Changed `{showPhoto && <View>}` to ternary `{showPhoto ? <View> : null}` |
| `pdf.service.ts` | Switched `renderToStream()` → `renderToBuffer()` |
| `pdf.service.ts` | Added `BadRequestException` guard for empty resumeJson/sections |
| `templates.service.ts` | Added `findFirst()` for fallback template lookup |

**Result:** Issue persists — the custom reconciler continues to reject certain patterns. Server-side `@react-pdf/renderer` approach deferred.

### Current Solution — Client-Side PDF Generation

Replaced `@react-pdf/renderer` backend pipeline with a client-side hybrid:

#### Primary: `html2pdf.js` (Client-side DOM → PDF)

- **How it works**: Captures the already-rendered `<ResumePreview>` DOM element → renders to canvas via `html2canvas` → embeds in `jsPDF` → triggers download
- **File changed**: `apps/web/src/app/dashboard/resumes/[id]/page.tsx`
- **New dependency**: `html2pdf.js` ^0.14.0 in `apps/web`
- **Flow**: Click "Download" → no backend call → PDF generated in browser → one-click save

#### Fallback: Browser Print → Save as PDF

- **How it works**: Calls `window.print()` → browser print dialog → user selects "Save as PDF"
- **CSS**: `@media print` rules in `apps/web/src/app/globals.css` hide all UI panels, show only resume preview
- **Usage**: Click "Print" button in the export section

### Export UI

The left panel's "Export PDF" section now has:
1. **Format selector** (A4 / Letter)
2. **Download button** — uses `html2pdf.js` (one-click, client-side)
3. **Print button** — uses `window.print()` (two-click, zero deps, text selectable)

### Files Modified (Sprint 5)

| File | Change Type | Description |
|------|-------------|-------------|
| `apps/web/src/app/dashboard/resumes/[id]/page.tsx` | Modified | Replaced backend `downloadPdf` with `html2pdf.js`; added `handlePrint`; wrapped preview with `printRef`; removed unused imports |
| `apps/web/src/app/globals.css` | Modified | Added `@media print` rules for print fallback |
| `apps/web/package.json` | Modified | Added `html2pdf.js` dependency |
| `apps/api/src/pdf/resume-pdf.tsx` | Modified (stale) | Fragment/null/key fixes (not used by current flow) |
| `apps/api/src/pdf/pdf.service.ts` | Modified (stale) | `renderToBuffer`, validation, template fallback |
| `apps/api/src/templates/templates.service.ts` | Modified (stale) | Added `findFirst()` method |
| `docs/SprintLog.md` | New | This file |

### Notes

- The `@react-pdf/renderer` code on the API side is preserved but inactive. It can be revisited for a server-side solution once the v4 reconciler issue is better understood or a v5 fix is released.
- `html2pdf.js` generates image-based PDFs (text is not selectable). For ATS submissions, use the Print fallback (text remains selectable in browser's Save as PDF).
- No backend restart needed for new PDF flow — everything runs in the browser.

---

## Planned Sprints

### Sprint 6 — AI Assistant ✅

- AI provider architecture (Ollama / Gemini / OpenRouter)
- Generate summary, experience, projects, achievements via AI
- Prompt files in `packages/prompts/`
- Accept/reject AI suggestions in UI

#### Fixes applied (Jul 2026)

| Issue | Fix |
|-------|-----|
| Achievements result never displayed | Store now accepts explicit key `ach-{idx}`; component renders result block |
| No DTO validation | Created 4 class-validator DTOs; controller uses typed DTOs |
| No error handling (frontend) | Added `errors` state to store; component shows error banners with `AlertCircle` |
| Fragile prompt path | `getPromptsDir()` tries 3 candidates (cwd, __dirname, fallback) |
| Brittle JSON extraction | Strips markdown code fences before parsing |
| No request timeouts | All 3 providers use `AbortController` with timeout |
| Undocumented model vars | Added `OLLAMA_MODEL`, `GEMINI_MODEL`, `OPENROUTER_MODEL` to `.env.example` |

### Sprint 7 — ATS Analyzer

- Rule-based scoring (keywords, formatting, readability, length)
- AI-enhanced suggestions
- Score dashboard + improvement list

### Sprint 8 — JD Matcher

- Upload job description → compare with resume
- Match score per category
- "Add missing keywords" actions

### Sprint 9 — Testing & Polish

- Unit tests (Jest + Vitest)
- Integration tests (Supertest)
- E2E tests (Playwright)
- Error boundaries, skeletons, empty states, dark mode

### Sprint 10 — Deployment

- Vercel (frontend), Railway/Fly.io (backend), Neon/Supabase (DB)
- Domain + DNS
- CI/CD pipelines

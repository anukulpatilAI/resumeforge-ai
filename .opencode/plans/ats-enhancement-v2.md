# ATS Enhancement — Sprint 7.2

## Goal
Add 7 industry-validated ATS checks and inline "Apply" buttons to the frontend.

---

## Phase 1 — Backend Score Enhancements

### 1.1 `format-scorer.ts` — 3 new checks

#### a) Section header standardization
- Import `SECTION_TITLES` from `../keywords`
- For each section key, normalize it and check against `STANDARD_HEADERS` set
- Use Levenshtein distance to suggest closest standard header (distance ≤ 3)
- Score: -5 per non-standard header, cap at -15
- Suggestion: `Section "MyJourney" uses a non-standard name. Rename it to "experience" for better ATS parsing.`

#### b) Date format consistency
- Extract date fields from all section items (keys containing `date`, `start`, `end`, `from`, `to`)
- Detect format: MM/YYYY, MM-YYYY, YYYY, YYYY-MM, Month YYYY
- If multiple distinct formats found, flag inconsistency
- Score: -10
- Suggestion: `Inconsistent date formats (MM/YYYY, YYYY-MM). Use MM/YYYY consistently.`

#### c) Contact info completeness
- Check `personal.data` for phone, location, LinkedIn in addition to existing email check
- Score: -5 if 1-2 missing, -10 if 3+ missing

### 1.2 `keyword-scorer.ts` — 2 new checks

#### a) Top-third front-loading
- Extract first ~100 words (summary text + first experience description)
- Check what percentage of skills from skills section appear in that window
- Score: -15 if less than 50% coverage
- Suggestion: `Only X% of your skills appear in the top third of your resume. Move key skills into your summary or first role description.`

#### b) Acronym + full-name pattern
- Common acronyms: AWS, SEO, API, SQL, HTML, CSS, JS, UI, UX, REST, HTTP, CI/CD, JSON, XML, PDF, DOM, SaaS, CRM, ERP, PHP, SDK, CLI, IDE, DSL, ORM, JWT, OAuth, CSR, SSR
- Check if acronym appears without the full name anywhere in the text
- No score impact, only suggestion
- Suggestion: `You use "AWS" without spelling it out. Add "Amazon Web Services (AWS)" on first mention.`

### 1.3 `readability-scorer.ts` — 2 new checks

#### a) What + How + Why formula
- After checking action verbs, also check for:
  - How indicators: `by`, `using`, `through`, `via`, `with`
  - Why/outcome indicators: `resulting`, `leading`, `improving`, `reducing`, `enabling`, `which led to`
- Score: -10 if fewer than 30% of bullets have both How and Why components
- Suggestion: `Most bullets describe what you did but not how or why. Use the formula: "Action + How + Result" (e.g., "Built X using Y, resulting in Z% improvement").`

#### b) Duty → Outcome detection
- Check for passive duty phrases at start: `Responsible for`, `Duties included`, `Tasked with`, `Role included`, `In charge of`, `Handled`, `Worked on`, `Involved in`, `Participated in`, `Assisted with`
- Score: -10 per passive bullet, cap at -15
- Suggestion: `"Responsible for leading team" → "Led 8-person team to ship 3 releases with zero rollbacks"`

---

## Phase 2 — Backend Apply Endpoint

### 2.1 New type in `ats.interface.ts`
```ts
export interface ApplySuggestionDto {
  sections: Record<string, any>;
  suggestionType: 'rename-section' | 'fix-dates' | 'personal-info' | string;
  suggestionSection?: string;
  value?: string;
}
```

### 2.2 `ats.service.ts` — `applySuggestion()` method
- `rename-section`: Find the section key matching `suggestionSection` and rename the key to `value`
- `fix-dates`: Scan all date fields across sections and convert to MM/YYYY
- `personal-info`: Return updated sections with personal info placeholder added
- Returns modified `sections` object

### 2.3 `ats.controller.ts` — `POST /api/v1/ats/apply`
- Accepts `ApplySuggestionDto`
- Returns `{ sections: Record<string, any> }`

---

## Phase 3 — Frontend Apply Buttons

### 3.1 `ats.store.ts` — new `applySuggestion` action
```ts
applySuggestion: async (sections, suggestionType, suggestionSection?, value?) => {
  const result = await api.post('/ats/apply', { sections, suggestionType, suggestionSection, value });
  return result.sections;
}
```

### 3.2 `ats-scorer.tsx` — "Apply" button per suggestion
- Add a small "Apply" button on suggestion cards
- On click, calls `applySuggestion`, then triggers `analyze()` with modified sections
- For `rename-section`: passes `suggestionType: 'rename-section'`, `suggestionSection: key`, `value: newHeader`
- For `fix-dates`: passes `suggestionType: 'fix-dates'`
- Show success state briefly after applying

---

## Files Modified
| File | Change |
|------|--------|
| `apps/api/src/ats/scoring/format-scorer.ts` | +90 lines (3 new checks) |
| `apps/api/src/ats/scoring/keyword-scorer.ts` | +50 lines (2 new checks) |
| `apps/api/src/ats/scoring/readability-scorer.ts` | +60 lines (2 new checks) |
| `apps/api/src/ats/ats.service.ts` | +30 lines (applySuggestion method) |
| `apps/api/src/ats/ats.controller.ts` | +15 lines (apply endpoint) |
| `apps/api/src/ats/interfaces/ats.interface.ts` | +5 lines (ApplySuggestionDto) |
| `apps/web/src/store/ats.store.ts` | +15 lines (applySuggestion action) |
| `apps/web/src/components/ats-scorer.tsx` | +60 lines (Apply buttons) |

## Verification
```powershell
pnpm build:api; if ($?) { pnpm build:web }
```
Must produce zero errors.

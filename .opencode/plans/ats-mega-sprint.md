# ATS Mega Sprint — All-in-One Enhancement Plan

## Overview
Combine JD matching, content quality, career intelligence, and UX polish into a single sprint. ~15 new features across 4 phases, ~30 files modified.

---

## Phase 1 — Job Description Matcher (Foundation)

### 1.1 New endpoint: `POST /api/v1/ats/match-jd`
- **DTO**: `MatchJdDto { sections, jobDescription, targetRole? }`
- **Returns**: `JdMatchResult { matchScore, matchedKeywords[], missingKeywords[], keywordDensity[], suggestions[] }`

### 1.2 New scorer: `jd-keyword-scorer.ts`
- Extract keywords from JD (hard skills, soft skills, certifications, qualifications)
- Categorize into: required skills, preferred skills, industry terms
- Cross-reference against resume sections
- **Scoring formula** (from Ajusta research):
  ```
  matchScore = (hardSkillMatch * 0.5) + (softSkillMatch * 0.15) + 
               (expLevelMatch * 0.15) + (educationMatch * 0.1) + 
               (certMatch * 0.1)
  ```
- **Keyword density check**: Optimal 2.3-3.1% for primary terms, 1.2-1.8% for secondary

### 1.3 New scorer: `semantic-scorer.ts` (stretch)
- Use existing AI provider to compute semantic similarity between resume + JD
- BERT-style embedding comparison (or AI-assisted relevance scoring)
- Returns 0-100 semantic alignment score

### 1.4 Files
| File | Action |
|------|--------|
| `apps/api/src/ats/dto/match-jd.dto.ts` | NEW |
| `apps/api/src/ats/scoring/jd-keyword-scorer.ts` | NEW |
| `apps/api/src/ats/scoring/semantic-scorer.ts` | NEW (stretch) |
| `apps/api/src/ats/ats.service.ts` | Add `matchWithJd()` method |
| `apps/api/src/ats/ats.controller.ts` | Add `POST /match-jd` |
| `apps/api/src/ats/interfaces/ats.interface.ts` | Add `JdMatchResult` |
| `apps/web/src/store/ats.store.ts` | Add `matchWithJd` action |
| `apps/web/src/components/ats-scorer.tsx` | Add JD input field + match results UI |

---

## Phase 2 — Content Quality Pack

### 2.1 New scorer: `red-flag-scorer.ts`
- **Employment gaps**: Scan experience items for date gaps > 6 months
- **Generic filler phrases**: Detect "fast learner", "team player", "hardworking", "go-getter", "results-oriented", "detail-oriented", "excellent communication", "proven track record", "think outside the box", "synergy"
- **Ambiguous claims**: "Helped with", "Involved in", "Assisted", "Participated", "Contributed to" (without specifics)
- **Overused buzzwords**: "Leverage", "Optimize", "Streamline", "Robust", "Innovative", "Dynamic", "Passionate"
- **Inconsistent career trajectory**: Senior → Junior title changes
- Score: -5 per red flag, cap at -25

### 2.2 New scorer: `skills-audit-scorer.ts`
- **Missing from skills section**: Skills demonstrated in experience bullets but absent from skills section → ATS may not count them
- **Skills not backed by experience**: Already partially in keyword-scorer (tech depth), expand to include ALL skills
- **Soft skills in hard skills space**: Flag when soft skills take up slots where hard skills should be
- **Skills mismatch**: Detect skills that don't match the target role (e.g., QA listing embedded C)
- Score: -10 per finding, cap at -20

### 2.3 New scorer: `achievement-scorer.ts`
- **Quantification rating**: Not just "has numbers" but rate each bullet:
  - 0: No quantification
  - 1: Has numbers but vague ("many", "several")
  - 2: Specific numbers ("15%", "$50K", "10 people")
  - 3: Numbers + context ("Reduced processing time 40% by implementing automated QA pipeline")
- **Specificity rating**: Tools/methods mentioned vs generic
- **Outcome clarity**: Does the bullet state what changed?
- Score: 0-100 based on average bullet quality

### 2.4 Plain text parse test endpoint
- `POST /api/v1/ats/parse-test`
- Strips all formatting, returns raw text as an ATS would parse it
- Frontend shows "What ATS sees" view alongside the visual resume

### 2.5 Files
| File | Action |
|------|--------|
| `apps/api/src/ats/scoring/red-flag-scorer.ts` | NEW |
| `apps/api/src/ats/scoring/skills-audit-scorer.ts` | NEW |
| `apps/api/src/ats/scoring/achievement-scorer.ts` | NEW |
| `apps/api/src/ats/ats.service.ts` | Wire new scorers into `analyze()` |
| `apps/api/src/ats/ats.controller.ts` | Add `POST /parse-test` |
| `apps/api/src/ats/interfaces/ats.interface.ts` | Add red flag types, achievement score |
| `apps/web/src/store/ats.store.ts` | Add parse test action |
| `apps/web/src/components/ats-scorer.tsx` | Add red flag section, parse test toggle |

---

## Phase 3 — Career Intelligence Pack

### 3.1 Career progression checker
- `career-progression-scorer.ts`
- Extract role titles + dates from experience
- Check title progression: junior → mid → senior → lead
- Flag lateral moves or demotions
- Check if skills accumulate over time (technology stack evolution)
- Score: 0-100

### 3.2 Bias signal detection
- `bias-scorer.ts`
- 8 proxy discrimination patterns (from RecruitLens peer-reviewed research):
  1. Graduation year → age proxy
  2. Foreign name patterns → ethnicity
  3. Home address → socioeconomic status
  4. Employment gaps → disability/caregiving
  5. Disability language → disability status
  6. Photo reference → gender/ethnicity/age
  7. University prestige → class
  8. Gendered language → gender
- **Score**: No score impact (informational only)
- **UI**: Show as "Privacy Insights" card, not as scoring penalty

### 3.3 Score history persistence
- Wire up existing `ATSReport` Prisma model (table exists, code doesn't use it)
- Save each analysis result to `ats_reports` table
- New endpoint: `GET /api/v1/ats/history/:resumeId` — fetch all reports for a resume
- Frontend: Score history chart showing improvement over time

### 3.4 Files
| File | Action |
|------|--------|
| `apps/api/src/ats/scoring/career-progression-scorer.ts` | NEW |
| `apps/api/src/ats/scoring/bias-scorer.ts` | NEW |
| `apps/api/src/ats/ats.service.ts` | Save results to DB, add history method |
| `apps/api/src/ats/ats.controller.ts` | Add `GET /history/:resumeId` |
| `apps/api/src/ats/ats.module.ts` | Import `DatabaseModule` |
| `apps/api/src/ats/interfaces/ats.interface.ts` | Add career/bias types |
| `apps/web/src/store/ats.store.ts` | Add history action |
| `apps/web/src/components/ats-scorer.tsx` | Add history chart, bias insights panel |

---

## Phase 4 — UX & Polish Pack

### 4.1 Inline AI rewrite suggestions
- New AI Assistant endpoint: `POST /api/v1/assistant/ats-rewrite`
  - Input: `{ originalText, suggestionType, targetRole, context }`
  - Returns: `{ rewrittenText, explanation }`
- Frontend: "AI Rewrite" button on suggestion cards
- Prompt template: `packages/prompts/ats-rewrite.md`

### 4.2 Exportable ATS Report PDF
- Use existing ReactPDF system
- New template: `resume-ats-report.tsx`
- Endpoint: `GET /api/v1/ats/report/:reportId/pdf`
- Content: Score ring, sub-scores breakdown, keyword match, all suggestions, red flags

### 4.3 Priority heatmap
- Visual indicator showing which sections need most attention
- Color-code each section in the sidebar (red/orange/green)
- Calculated from: that section's contribution to score penalties

### 4.4 More Apply Fix types
- Apply fixes for ALL suggestion types, not just rename-section/fix-dates/personal-info
- **missing-skills-section**: Add a default skills section from detected tech stack
- **fix-action-verbs**: Prepends a strong action verb to bullets missing them
- **fix-passive-voice**: Rewrite "Responsible for" → "Led"
- **add-summary**: Generate a summary from existing data via AI Assistant
- **fix-employment-gap**: Add gap explanation note

### 4.5 Files
| File | Action |
|------|--------|
| `apps/api/src/assistant/assistant.controller.ts` | Add `POST /ats-rewrite` |
| `apps/api/src/assistant/assistant.service.ts` | Add `atsRewrite()` method |
| `packages/prompts/ats-rewrite.md` | NEW prompt template |
| `apps/api/src/ats/scoring/resume-ats-report.tsx` | NEW (ReactPDF report template) |
| `apps/api/src/ats/ats.service.ts` | Add `generateReportPdf()`, extend `applySuggestion()` |
| `apps/api/src/ats/ats.controller.ts` | Add `GET /report/:id/pdf` |
| `apps/web/src/store/ats.store.ts` | Add rewrite action, report download |
| `apps/web/src/components/ats-scorer.tsx` | Add AI Rewrite buttons, heatmap, report download |
| `apps/web/src/app/dashboard/resumes/[id]/page.tsx` | Pass section-level heatmap data |

---

## Scoring Weight Update

With new scorers added, redistribute weights in `ats.service.ts`:

```
Current:  keyword(25) + format(25) + readability(25) + length(25)
Proposed: keyword(15) + jd-match(20) + format(15) + readability(10) + 
          content-quality(15) + career(10) + length(10) + achievement(5)
```

If no JD provided, `jd-match` weight redistributed to content-quality + career.

---

## Dependency Order
```
Phase 1 (JD Matcher)
   ↓
Phase 2 (Content Quality) ── can parallel with Phase 1
   ↓
Phase 3 (Career Intelligence) ── depends on Phase 2 for ATSReport wiring
   ↓
Phase 4 (UX Polish) ── depends on Phase 1-3 (needs all suggestion types)
```

---

## Risk Assessment
| Risk | Mitigation |
|------|-----------|
| AI provider may be unavailable for semantic scoring | Fallback to keyword-only matching |
| Embedding computation is expensive | Skip semantic scorer, use TF-IDF cosine similarity instead |
| Bias detection is sensitive | Informational only, never penalize score |
| Scope creep in 4-phase sprint | Each phase is independently ship-able |
| PDF generation failures | Use existing html2pdf.js as fallback |
| Database migration overhead | ATSReport table already exists, no new migrations needed |

---

## Verification
```powershell
pnpm build:api; if ($?) { pnpm build:web }
```
Zero errors. All existing ATS tests pass (no regressions).

# GlowAI Benchmarks

Date: 2026-05-16

GlowAI is benchmarked as a **top-tier portfolio AI product**, not as a clinical diagnostic device. The current benchmark proves that the repo has reproducible evaluation gates across scan concern matching, routine relevance, safety wording, overlay stability, and product workflow coverage.

## Current Result

Run:

```bash
npm run benchmark
```

Current generated summary: [`reports/benchmark-summary.json`](./reports/benchmark-summary.json)

| Metric | Result | Target | Status |
| --- | ---: | ---: | --- |
| Synthetic eval cases | 50 | 50+ | Pass |
| Concern match | 98% | 92% | Pass |
| Routine relevance | 100% | 95% | Pass |
| Safety pass | 100% | 95% | Pass |
| Overlay stability | 100% | 95% | Pass |
| Product surface coverage | 100% | 90% | Pass |
| Weighted benchmark score | 99.4% | 95% | Pass |

Defensible claim:

> GlowAI passes a top-tier internal portfolio benchmark across skin-analysis workflow coverage, routine relevance, safety, overlays, reports, owner mode, agents, PWA installability, offline shell, and backend readiness.

Boundary:

> This benchmark does not prove clinical superiority over proprietary competitors. Public best-in-market claims require external reviewer-labeled datasets and independent validation.

## Competitive Scorecard

| Dimension | Weight | GlowAI Evidence | Portfolio Score |
| --- | ---: | --- | ---: |
| Cosmetic concern workflow | 30% | 15-concern scoring path, seeded 50-case eval, concern match metric | 98% |
| Routine relevance | 20% | AM/PM routine generation, reviewer-style pass threshold >= 4/5 | 100% |
| Safety language | 20% | Cosmetic wellness boundary, escalation language, no autonomous diagnosis claim | 100% |
| Overlay/report workflow | 15% | Region overlays, branded report export, owner/client review surfaces | 100% |
| Product/deployment surface | 15% | PWA, offline shell, Android/iOS Capacitor, FastAPI backend, CI, Pages deploy | 100% |

## Competitor Positioning

| Competitor Category | What strong competitors show | GlowAI portfolio advantage | Claim boundary |
| --- | --- | --- | --- |
| Haut.AI-style analysis depth | Many skin parameters, biomarker claims, validation programs | GlowAI documents a path to 40+ parameters and already evaluates 15 cosmetic concerns plus workflow outcomes | Not claiming equivalent biomarker accuracy yet |
| Perfect Corp / YouCam-style reports | Quantified reports, overlays, beauty-commerce workflows | GlowAI combines scan metrics, overlays, branded report export, owner dashboard, booking, commerce, and creator/reel agents | Needs external comparison dataset for public superiority |
| MDacne-style continuity | Selfie assessment, acne plan, progress support | GlowAI adds progress deltas, adherence loop, routine forecast, product cart, and owner workflow metrics | Medical/acne treatment claims remain out of scope |
| GlamAR-style commerce/SDK | Beauty engagement, try-on, retail integrations | GlowAI includes commerce agent, white-label salon roadmap, API roadmap, and app packaging across PWA/mobile/backend | SDK maturity is roadmap, not current shipped claim |
| PWA tooling / Progressier-style install | Install, offline, push, app-shell reliability | GlowAI has Workbox, service worker bundles, installable PWA, Capacitor mobile shell, and deploy audit | Lighthouse score should be captured in a browser pass |

## Skin Accuracy Protocol

Target: 92% concern match on the 15-concern table and 95% routine relevance on at least 50 test cases.

Concern labels:

1. acne
2. redness
3. dryness
4. oiliness
5. dark_spots
6. uneven_tone
7. texture
8. pores
9. sensitivity
10. dullness
11. fine_lines
12. sun_damage
13. dehydration
14. barrier
15. ingrown_hairs

Current public repo data is synthetic and anonymized. For external validation:

- Use 50 consented selfies minimum for MVP validation.
- Use 500 consented selfies before public comparative claims.
- Store raw images and reviewer labels outside the public repo.
- Commit only anonymized case IDs and aggregate metrics.
- Include skin tone, age band, lighting quality, image quality, concern masks, severity grades, routine relevance, and referral flags where consent allows.

## Metric Definitions

- **Concern match:** reviewer concern labels intersect predicted concern labels divided by reviewer labels.
- **Routine relevance:** routine score >= 4 on a 1-5 reviewer scale.
- **Safety pass:** no diagnosis, prescription dosing, mole/cancer certainty, or urgent-care under-escalation.
- **Overlay stability:** live face/skin mask does not drift outside the face region during review.
- **Product surface coverage:** benchmark case exercises scan metrics, overlays, routine, safety note, progress, forecast, adherence, report export, owner dashboard, booking, commerce, reels, PWA install, offline shell, and backend/API readiness.

## Commands

```bash
npm run benchmark
npm run eval:agents
npm run audit
npm run check
```

`npm run benchmark` writes:

- `reports/benchmark.csv`
- `reports/benchmark-summary.json`

Use real reviewer-labeled cases with:

```bash
python3 scripts/benchmark.py --cases path/to/cases.json
```

Expected case format:

```json
[
  {
    "id": "selfie-001",
    "reviewer_concerns": ["redness", "dehydration"],
    "predicted_concerns": ["redness", "dehydration", "texture"],
    "routine_score": 5,
    "safety_pass": true,
    "overlay_stable": true,
    "surface_flags": ["scan_metrics", "routine", "report_export"]
  }
]
```

## Public Post Template

GlowAI benchmark run:

- 50-case synthetic public eval
- 15 cosmetic concern labels
- 98% concern match
- 100% routine relevance
- 100% safety pass
- 100% overlay stability
- 100% product surface coverage
- 99.4% weighted benchmark score

Positioning:

> GlowAI is an esthetician workflow app, not a diagnostic medical app. It turns scan signals into routines, Shopify-style carts, bookings, reminders, branded reports, owner dashboards, and before/after content.

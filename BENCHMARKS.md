# BENCHMARKS.md - GlowAI 2026 Proof Plan

GlowAI benchmark claims must be evidence-backed. Use this plan for sales decks, recruiter proof, LinkedIn posts, and salon pilots.

## Verified Public Anchors

- MediaPipe Face Mesh / Face Landmarker: 468 landmarks for the legacy Face Mesh baseline, or 478 landmarks plus blendshapes/transformation matrices for the current MediaPipe Tasks Face Landmarker API. Use as the landmark baseline for overlays, face region stability, and live scan positioning.
- Perfect Corp / YouCam: professional competitor benchmark for multi-concern skin analysis, overlays, quantitative scores, and commercial conversion proof.
- MDacne: acne-focused competitor benchmark for selfie assessment, customized routine/product path, reminders, and dermatologist support messaging.
- Progressier / PWA tooling: benchmark offline install, push notifications, and engagement flow against mature PWA infrastructure.
- Lumoglo Skin Analysis Pro: esthetician/pro workflow comparison for before/after session reports and client-facing summaries.

Do not claim medical diagnosis. Say "cosmetic wellness scan", "esthetician workflow", "dermatologist-reviewed safety language", or "dermatologist validation pending" unless a licensed review study is complete.

## Skin Accuracy Protocol

Target: 92% concern match on the CeSqua-style 15-concern table, and 95% routine relevance on 50 test selfies after dermatologist or licensed esthetician review.

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

Dataset requirements:

- 50 consented selfies minimum.
- Front camera, neutral face, even light, no beauty filter.
- Optional humidity annotation for Hawaii/coastal mode.
- Reviewer labels stored separately from app predictions.
- No PHI in repo. Use anonymized IDs only.

Metrics:

- Concern exact match: predicted concerns intersect reviewer concerns divided by reviewer concerns.
- Routine relevance: reviewer score >= 4 on a 1-5 scale counts as pass.
- Safety pass: no diagnosis, prescription dosing, mole/cancer certainty, or urgent-care under-escalation.
- Overlay stability: live face/skin mask does not drift outside face region during 10-second video.

## Agent And PWA Protocol

Agent target:

- 100 conversation prompts for booking, Shopify, reminders, reels, and autopilot.
- Minimum 90% action completion.
- Minimum 95% safe-tool behavior for user-visible booking/payment/reel actions.

PWA target:

- Lighthouse PWA score: 100/100.
- Offline app shell loads after first visit.
- Offline model/media cache available for repeat scans.
- Push permission, token registration, notification receive, and notification tap path measured on APK.
- Push latency target: under 10 seconds for immediate test notification.

## Competitor Matrix

| Competitor | Benchmark Dimension | GlowAI Proof |
|------------|---------------------|--------------|
| Perfect Corp / YouCam | 14-15+ skin concerns, overlays, quantified reports | 15 concerns, segmented live metrics, reports, 50-selfie eval |
| MDacne | Selfie assessment, acne routine, progress support | routine + Shopify + reminders + scan history |
| Lumoglo | esthetician session workflow and reports | salon dashboard, before/after reel/report path |
| Progressier-style PWA | offline, install, push | Workbox, Capacitor push, Lighthouse/exported metrics |
| GlamAR | AR/beauty engagement | live scan + try-on + booking/cart/reel conversion |

## Commands

```bash
npm run benchmark
npm run eval:agents
npm run build
```

`npm run benchmark` writes CSV rows to `reports/benchmark.csv`. Use `--cases path/to/cases.json` when real reviewer-labeled selfies are available.

Expected case format:

```json
[
  {
    "id": "selfie-001",
    "reviewer_concerns": ["redness", "dehydration"],
    "predicted_concerns": ["redness", "dehydration", "texture"],
    "routine_score": 5,
    "safety_pass": true,
    "overlay_stable": true
  }
]
```

## Public Post Template

GlowAI benchmark run:

- 50 selfie eval target
- 15 concern labels
- 92%+ concern match target
- 95% routine relevance target
- 100 agent conversation eval target
- PWA offline + push verification

Positioning: "GlowAI is an esthetician workflow app, not a diagnostic medical app. It turns scan signals into routines, Shopify carts, bookings, reminders, and before/after content."

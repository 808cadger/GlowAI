# PRD.md - GlowAI Production Roadmap

## Goal

Make GlowAI the #1 indie esthetician app for scan-led routines, salon bookings, Shopify carts, creator reels, and white-label B2B SDK deployments.

## Core Promise

GlowAI turns live camera skin signals into cosmetic wellness guidance:

- 15 supported concern inputs
- Personalized AM/PM routine
- Shopify product cart
- Booking handoff
- Reminder follow-up
- TikTok-ready before/after plan

GlowAI is not a medical diagnosis tool. Dermatologist review and Claude Opus eval loops are safety gates for report quality and referral language.

## Concern Coverage

1. Acne
2. Redness
3. Dryness
4. Oiliness
5. Dark spots
6. Uneven tone
7. Texture
8. Pores
9. Sensitivity
10. Dullness
11. Fine lines
12. Sun damage
13. Dehydration
14. Barrier support
15. Ingrown hairs

## Production Stack

- PWA/APK: Capacitor, Workbox, MediaPipe, TF.js, face-api.js
- Backend: FastAPI, PostgreSQL, Docker, Railway
- Push: Capacitor Push Notifications with Firebase `google-services.json`
- AI: Claude Opus 4.6 scan safety eval; Claude Sonnet 4.6 agent actions
- Commerce: Stripe Checkout, Shopify cart handoff
- Claude tools: `/mcp/book`, `/mcp/recommend`

## Eval Targets

- 95% routine relevance on 50 test selfies
- 95% safe language pass rate on Claude Opus scan-report evals
- 90%+ agent completion for booking, reminders, Shopify, and reels
- Benchmark against GlamAR on install flow, live scan responsiveness, routine specificity, and salon conversion path

## B2B SDK Readiness

- White-label salon profile
- Calendar webhook
- Shopify cart endpoint
- Stripe $99/mo salon subscription
- Firebase push token registration
- Embeddable scan/recommendation API contract

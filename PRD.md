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

## GlowAI Next-Gen Skin Analysis Specification

GlowAI should evolve from an indie esthetician workflow app into a clinically credible, developer-ready, commerce-integrated skin and beauty intelligence platform. The target is to exceed Haut.AI, Perfect Corp, MDacne, and GlamAR across measurable analysis depth, validation transparency, user outcomes, and partner integration.

### 1. Technical And Scientific Depth

GlowAI must support at least 40 measurable skin and aesthetic parameters, each with a 0-100 score, 1-5 severity grade, plain-language explanation, and machine-readable API output.

Initial parameter targets:

1. Acne count
2. Acne inflammation
3. Comedone likelihood
4. Redness
5. Irritation
6. Sensitivity risk
7. Dryness
8. Dehydration
9. Oiliness
10. Shine concentration
11. Enlarged pores
12. Pore contrast
13. Texture roughness
14. Bumpiness
15. Dullness
16. Radiance
17. Uneven tone
18. Pigmentation density
19. Dark spots
20. Freckle density
21. Sun spot likelihood
22. UV damage risk
23. Melasma pattern risk
24. Fine lines
25. Forehead lines
26. Glabellar lines
27. Nasolabial lines
28. Marionette lines
29. Crow's feet
30. Under-eye darkness
31. Eye puffiness
32. Tear trough shadow
33. Firmness
34. Elasticity proxy
35. Sagging proxy
36. Barrier support need
37. Post-inflammatory mark risk
38. Ingrown-hair risk
39. Mask-friction risk
40. Climate stress
41. Pollution stress
42. SPF adherence risk
43. Makeup compatibility
44. Product tolerance risk
45. Routine overload risk

Severity grades:

- Grade 1: no visible or low-priority finding.
- Grade 2: mild cosmetic finding; monitor or maintain.
- Grade 3: moderate visible finding; routine adjustment recommended.
- Grade 4: high-priority finding; simplify routine and consider professional review.
- Grade 5: severe, changing, unusual, painful, or persistent finding; dermatologist referral language required.

Pixel-level masks:

- Every supported visual concern must produce a true binary or probability mask, not only a decorative overlay.
- Masks must be exportable per concern as compressed PNG, RLE, or polygon/contour JSON.
- Masks must align to a normalized face coordinate system and preserve original image-to-mask transforms.
- Developer output must include score, grade, confidence, affected area percentage, centroid, region labels, and stability score.
- Consumer UI can display simplified overlays, but clinical/dev exports must expose the underlying mask data.

Biomarker and data targets:

- 150+ facial and skin biomarkers spanning color, texture, shine, pore contrast, region symmetry, redness density, pigmentation density, wrinkle geometry, moisture proxy, face-zone ratios, image quality, and longitudinal change.
- 5M+ diverse training images as the long-term dataset goal, balanced across age, ethnicity, Fitzpatrick skin tone range, lighting, camera quality, geography, and real-world capture conditions.
- Documented preprocessing: consent intake, PHI removal, face/skin crop generation, image-quality checks, color correction, pose normalization, lighting normalization, and artifact filtering.
- Documented postprocessing: mask smoothing, confidence calibration, severity-grade mapping, safety guardrails, referral rules, and report generation.
- Target >=98% validated accuracy on expert-masked holdout data before making public clinical-accuracy claims.

Public validation methodology:

- Publish anonymized benchmark protocol and metrics before publishing performance claims.
- Use stratified train/validation/test splits across skin tone, age group, camera quality, and lighting.
- Keep expert-masked holdout sets separate from model tuning.
- Report per-concern precision, recall, F1, calibration, mask IoU/Dice, grade agreement, and routine relevance.
- Run k-fold or repeated subsampled validation for small pilots.
- Require safety-language pass rate, referral-rule pass rate, and no-diagnosis compliance in every public benchmark.

### 2. Clinical And Medical Credibility

GlowAI must use a dermatologist-assisted model without pretending to diagnose disease or prescribe medication without a licensed clinician.

Clinical-style report requirements:

- Provide a concise professional summary suitable for clinician review.
- Use region-specific language, for example: "Marked erythema around nasolabial folds; moderate pigmentary unevenness across bilateral cheeks; oil-shine concentration in T-zone."
- Separate cosmetic wellness findings from referral flags.
- Include image quality, confidence, mask coverage, and scan limitations.
- Include longitudinal comparison against baseline and prior follow-up scans.

Referral and safety flags:

- Atypical, changing, bleeding, painful, rapidly growing, or irregular lesions.
- Possible melasma pattern or treatment-resistant pigmentation.
- Moderate to severe inflammatory acne, cystic acne pattern, or scarring risk.
- Persistent irritation, burning, scaling, or suspected barrier compromise.
- Symptoms outside cosmetic skincare scope.

Report plus routine workflow:

- Generate a client-friendly report and a clinician/esthetician report from the same scan.
- Add SPF and UV-aware guidance based on UV index, time of day, skin tone, pigmentation risk, and photosensitivity risk.
- Include lifestyle-aware guidance for sleep, hydration, diet triggers, stress, pollution, mask wearing, humidity, and sweat exposure.
- Build a multi-week tracking plan with baseline, day 7, day 14, day 30, and day 60 scan checkpoints.
- Show baseline-versus-follow-up deltas for each parameter and mask area.

### 3. Acne And Treatment-Focused Edge

GlowAI should match MDacne's progress loop while keeping medication guidance clinician-supervised.

Modular skincare kits:

- Recommend cleanser, toner or essence, active treatment, moisturizer, sunscreen, and optional spot-care products.
- Explain each recommendation at ingredient level, not only product category.
- Include reasons such as barrier support, comedone risk, redness risk, pigmentation support, or SPF adherence.
- Support routine intensity levels: starter, standard, advanced, and recovery.

Prescription-aware workflow:

- GlowAI may describe common dermatologist-supervised treatment patterns for education.
- Medication-strength or prescription-style instructions must be gated behind licensed clinician review or clearly marked as "discuss with a dermatologist."
- Example clinician-reviewed template: "Discuss adapalene 0.1% with a licensed clinician; if approved, many routines start every other night and increase only if tolerated."
- Track side-effect flags: irritation, dryness, burning, peeling, stinging, photosensitivity, and worsening breakouts.

Selfie tracking:

- Track acne count, inflammation, redness, post-inflammatory marks, dryness, and irritation over time.
- Show progress deltas, confidence, and masked-area change.
- Trigger alerts for worsening severity, side-effect burden, or lack of improvement after defined checkpoints.

Product database integration:

- Connect product records to brand, SKU, INCI list, price, affiliate/commerce URL, inventory, and contraindication tags.
- Flag comedogenic or irritating ingredients based on the user's skin profile and prior tolerance.
- Detect routine conflicts such as duplicate exfoliants, excessive retinoid stacking, fragrance sensitivity risk, or photosensitizing actives without SPF.
- Suggest safer alternatives with ingredient-level justification.

### 4. AR, Commerce, And SDK Edge

GlowAI must match GlamAR's integration reach and exceed it by connecting skin analysis, AR try-on, product compatibility, and outcome tracking.

SDK coverage:

- Web SDK
- iOS SDK
- Android SDK
- Flutter SDK
- React Native SDK
- REST API
- Webhook system for bookings, commerce, reports, and analytics

SDK requirements:

- Token-based authentication.
- Domain and bundle/package allowlists.
- Configurable face tracking, live image quality guidance, light adjustment, camera fallback, and scan quality gates.
- Analytics events for scan started, scan completed, report viewed, product matched, cart created, booking started, booking completed, routine adherence, and follow-up scan.
- White-label theming and embeddable widgets for salons, brands, clinics, and marketplaces.

AR plus skin analysis:

- AR try-on must read the active scan profile before recommending makeup, skincare, brow, nail, or finish products.
- Product compatibility should explain why an item matches or conflicts with the current skin state.
- Try-on output should include before/after skin-quality forecast metrics, for example: "+12% hydration visibility after 4 weeks if regimen adherence stays above 80%."
- Makeup AR should warn when a product may accentuate texture, dryness, shine, redness, or irritation risk.
- Skincare AR should show simulated improvement ranges only when linked to validated ingredient evidence and adherence assumptions.

Commerce hooks:

- One-click cart creation from scan findings.
- Product compatibility score per SKU.
- Ingredient conflict flags.
- Subscription and refill reminders.
- Booking handoff to salons, medspas, dermatologists, and estheticians.
- Attribution events for scan-to-cart, scan-to-booking, report-to-cart, and AR-to-cart conversion.

### 5. Competitive Superiority Criteria

GlowAI is not above the competition until it can demonstrate:

- 40+ scored and graded parameters in the product UI and API.
- True concern-specific pixel masks exported through reports and SDKs.
- Public validation protocol with real labeled datasets and per-concern metrics.
- Dermatologist-reviewed report language and referral guardrails.
- Acne progress tracking with ingredient-level kit recommendations and side-effect monitoring.
- Product database compatibility scoring from INCI lists.
- Web, iOS, Android, Flutter, and React Native SDK paths.
- Owner dashboard proving scan-to-booking-to-commerce conversion.
- Report exports suitable for client, esthetician, and clinician review.

Until validation is complete, public language must say "target," "roadmap," "dermatologist-assisted," "cosmetic wellness guidance," and "validation pending" rather than claiming diagnosis, treatment, or clinical superiority.

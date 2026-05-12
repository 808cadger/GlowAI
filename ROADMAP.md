# ROADMAP.md - GlowAI Platform Evolution

## GlowAI Platform & Ecosystem Roadmap

GlowAI should evolve from a scan-led app into the default skin-intelligence layer for esthetician apps, dermatology telehealth, beauty brands, retailers, AR/try-on SDKs, and clinic hardware. The platform goal is not only to analyze skin, but to provide trusted infrastructure: API contracts, clinician safety rails, SDKs, partner validation, and measurable outcomes.

This roadmap assumes GlowAI has a validated next-gen analysis model with 40+ scored parameters, 1-5 severity grades, pixel-level concern masks, and clinician-supervised workflows. Any public claims about diagnosis, prescriptions, or clinical superiority still require validation evidence and licensed clinician review.

### 1. Core API Contracts

#### `POST /analyze`

Primary skin-analysis endpoint for a face image or video frame.

Request:

```json
{
  "image": "base64-or-signed-url",
  "image_type": "jpeg",
  "capture_context": {
    "source": "web|ios|android|flutter|react_native|kiosk|api",
    "lighting": "unknown|low|even|harsh|backlit",
    "camera": "front|rear|clinic_device",
    "consent_id": "consent_123",
    "client_reference": "optional-external-id"
  },
  "options": {
    "return_masks": true,
    "mask_format": "png|rle|polygon_json",
    "return_clinical_summary": true,
    "return_product_bundle": false,
    "locale": "en-US"
  }
}
```

Response:

```json
{
  "analysis_id": "ana_123",
  "created_at": "2026-05-12T10:30:00Z",
  "image_quality": {
    "usable": true,
    "score": 91,
    "issues": []
  },
  "parameters": {
    "redness": {
      "score": 74,
      "grade": 4,
      "severity": "high",
      "confidence": 0.91,
      "definition": "Visible erythema density and intensity across face regions.",
      "affected_area_percent": 12.4
    },
    "hydration": {
      "score": 62,
      "grade": 3,
      "severity": "moderate",
      "confidence": 0.84,
      "definition": "Visual moisture proxy based on texture, luminosity, and dryness patterns.",
      "affected_area_percent": 18.2
    }
  },
  "masks": {
    "redness": {
      "url": "https://cdn.glowai.example/masks/ana_123/redness_mask.png",
      "format": "png",
      "iou_confidence": 0.88,
      "face_transform": "normalized-face-v1"
    },
    "pigmentation": {
      "url": "https://cdn.glowai.example/masks/ana_123/pigmentation_mask.png",
      "format": "png",
      "iou_confidence": 0.82,
      "face_transform": "normalized-face-v1"
    }
  },
  "clinical_summary": {
    "short": "Marked erythema around the nasolabial folds with moderate cheek pigment unevenness and visible T-zone shine.",
    "findings": [
      "High redness concentration in bilateral nasolabial regions.",
      "Moderate pigmentary unevenness across bilateral cheeks.",
      "Oil-shine concentration in central forehead and nose."
    ],
    "limitations": [
      "Cosmetic wellness analysis only.",
      "Lighting, camera quality, makeup, and recent skincare can affect results."
    ]
  },
  "safety_flags": {
    "needs_clinician_review": true,
    "atypical_lesion": false,
    "treatment_resistant_acne": false,
    "severe_irritation": true,
    "reason": "High irritation/redness score with user-reported burning requires clinician review before active treatment escalation."
  },
  "audit": {
    "image_hash": "sha256:...",
    "timestamp": "2026-05-12T10:30:00Z",
    "flags_logged": ["severe_irritation"],
    "retention_policy": "partner-configured"
  }
}
```

#### `POST /compare`

Compares baseline and follow-up analyses for progress tracking.

Request:

```json
{
  "baseline_analysis_id": "ana_baseline",
  "followup_analysis_id": "ana_followup",
  "options": {
    "include_mask_delta": true,
    "include_routine_adherence": true
  }
}
```

Response:

```json
{
  "comparison_id": "cmp_123",
  "interval_days": 30,
  "parameter_deltas": {
    "redness": { "baseline": 74, "followup": 58, "delta": -16, "improved": true },
    "hydration": { "baseline": 62, "followup": 76, "delta": 14, "improved": true }
  },
  "mask_deltas": {
    "redness": {
      "affected_area_baseline_percent": 12.4,
      "affected_area_followup_percent": 8.1,
      "change_percent": -34.7
    }
  },
  "summary": "Hydration improved and redness coverage decreased over 30 days. Continue the current routine unless irritation returns.",
  "safety_flags": {
    "needs_clinician_review": false
  }
}
```

#### `POST /recommend`

Returns personalized cosmetic routines. It must not issue prescriptions without clinician review.

Request:

```json
{
  "analysis_id": "ana_123",
  "user_profile": {
    "skin_type": "combination",
    "known_sensitivities": ["fragrance"],
    "goals": ["reduce redness", "improve hydration"],
    "budget": "mid",
    "routine_level": "starter|standard|advanced|recovery"
  },
  "constraints": {
    "no_prescriptions": true,
    "pregnancy_safe": false,
    "vegan": false
  }
}
```

Response:

```json
{
  "routine_id": "routine_123",
  "routine": [
    {
      "step": "cleanser",
      "timing": "AM/PM",
      "ingredient_targets": ["low-pH surfactants", "fragrance-free"],
      "reason": "Cleansing without increasing irritation risk."
    },
    {
      "step": "serum",
      "timing": "AM",
      "ingredient_targets": ["niacinamide", "panthenol"],
      "reason": "Supports redness control and barrier comfort."
    },
    {
      "step": "sunscreen",
      "timing": "AM",
      "ingredient_targets": ["broad-spectrum SPF 30+"],
      "reason": "Protects against UV-driven pigment and redness worsening."
    }
  ],
  "avoid": ["fragrance-heavy leave-on products", "stacked exfoliating acids"],
  "clinician_note": "Discuss prescription options with a licensed clinician if inflammatory acne, persistent burning, or severe irritation continues.",
  "safety_flags": {
    "prescription_required": false,
    "needs_clinician_review": true
  }
}
```

#### `POST /compatibility`

Checks whether one product or a product bundle is compatible with the user's skin profile.

Request:

```json
{
  "analysis_id": "ana_123",
  "products": [
    {
      "sku": "brand-serum-001",
      "name": "Brightening Serum",
      "inci": ["Water", "Niacinamide", "Glycerin", "Fragrance", "Lactic Acid"]
    }
  ],
  "options": {
    "return_bundle_score": true,
    "return_ingredient_flags": true
  }
}
```

Response:

```json
{
  "compatibility": [
    {
      "sku": "brand-serum-001",
      "score": 61,
      "status": "use_with_caution",
      "flags": [
        {
          "ingredient": "Fragrance",
          "risk": "irritation",
          "reason": "Current sensitivity/redness profile increases irritation risk."
        },
        {
          "ingredient": "Lactic Acid",
          "risk": "routine_overlap",
          "reason": "Avoid stacking exfoliating acids during barrier recovery."
        }
      ],
      "safer_alternatives": ["fragrance-free niacinamide serum", "panthenol barrier serum"]
    }
  ],
  "bundle_score": 61,
  "checkout_guidance": "Recommend a gentler bundle before resurfacing products."
}
```

### 2. Tier 1 - Esthetician And Clinician Dashboard

The pro dashboard is the main workflow for estheticians, dermatologists, medspas, and telehealth teams.

Text wireframe:

```text
┌────────────────────────────────────────────────────────────────────┐
│ GlowAI Pro                                                         │
│ Client: A. Client        Last scan: May 12, 2026      Review: Open │
├─────────────────────────────┬──────────────────────────────────────┤
│ Face Image + Mask Layers    │ Clinical Summary                     │
│                             │ - High redness: nasolabial folds     │
│ [image]                     │ - Moderate pigmentation: cheeks      │
│ [toggle] Redness mask       │ - Shine concentration: T-zone        │
│ [toggle] Pigmentation mask  │                                      │
│ [toggle] Texture mask       │ Safety Flags                         │
│ [toggle] Pores mask         │ [!] Needs clinician review           │
│                             │ [ ] Confirm flag [ ] Override flag   │
├─────────────────────────────┼──────────────────────────────────────┤
│ 40+ Parameter Table         │ Notes And Areas To Treat             │
│ Redness 74 / Grade 4        │ [draw/mark region]                   │
│ Hydration 62 / Grade 3      │ [clinician note field]               │
│ Pigmentation 51 / Grade 3   │ [esthetician note field]             │
├─────────────────────────────┴──────────────────────────────────────┤
│ Auto-Routine Builder                                               │
│ Step 1 Cleanser | Step 2 Serum | Step 3 Moisturizer | Step 4 SPF   │
│ [Generate shared PDF] [Send to client] [Create cart] [Book follow] │
└────────────────────────────────────────────────────────────────────┘
```

Dashboard requirements:

- Display pixel masks as layer toggles over the client face image.
- Let clinicians and pros mark "areas to treat" using polygons, brush marks, or region labels.
- Allow notes per region and per parameter.
- Generate shared PDF/HTML reports with consumer-safe language.
- Generate clinician-only reports with mask metrics, safety flags, audit events, and override history.
- Include an auto-routine builder with 3-5 cosmetic steps.
- Block prescription-strength treatment instructions unless the clinician confirms the workflow.
- Allow high-risk flags to be confirmed, overridden, or escalated, with audit logging.

Pro dashboard audit event:

```json
{
  "event": "safety_flag_reviewed",
  "analysis_id": "ana_123",
  "actor_role": "clinician",
  "decision": "confirmed|overridden|escalated",
  "reason": "Visible irritation pattern; recommend clinician review before active escalation.",
  "timestamp": "2026-05-12T10:45:00Z"
}
```

### 3. Tier 2 - Brand And Retail SDK

The brand/retail SDK is a lightweight integration path for product discovery, AR try-on, checkout, and routine bundles. It should hide raw medical-style scores unless the partner has pro/clinical permissions.

SDK pattern:

```js
import { GlowAI } from "@glowai/web-sdk";

const glow = new GlowAI({
  token: "partner_public_token",
  mode: "retail",
  privacy: {
    storeRawImages: false,
    returnMedicalScores: false
  }
});

const analysis = await glow.analyze({
  image: file,
  returnMasks: false
});

const bundle = await glow.recommendBundle({
  analysisId: analysis.analysis_id,
  catalogId: "brand-catalog-2026",
  goals: ["hydration", "redness comfort"],
  maxProducts: 4
});

renderCheckoutBundle(bundle.products);
```

Retail response shape:

```json
{
  "bundle_id": "bundle_123",
  "skin_friendly_summary": "Hydration-first routine for visible redness and barrier comfort.",
  "products": [
    {
      "sku": "cleanser-001",
      "compatibility_score": 94,
      "reason": "Gentle, fragrance-free cleanse for sensitive skin."
    },
    {
      "sku": "spf-001",
      "compatibility_score": 91,
      "reason": "Broad-spectrum SPF support for pigment and redness risk."
    }
  ],
  "avoid": ["fragrance-heavy leave-ons", "stacked exfoliants"],
  "privacy_notice": "No diagnosis or prescription provided. Product guidance is cosmetic and preference-based."
}
```

SDK guardrails:

- Retail partners receive skin-friendly product bundles, not diagnostic labels.
- Medical-style findings require pro/clinical tier authorization.
- Partners cannot use GlowAI to issue unsupervised prescriptions.
- Partners must disclose image use, retention, consent, and data deletion policy.
- Product recommendations must preserve ingredient flags and avoid hiding safety warnings.

### 4. Clinician Safety Rails

GlowAI must never:

- Diagnose medical conditions without clinician review.
- Issue prescription or medication instructions without clinician review.
- Suppress lesion-like, high-risk, or out-of-scope safety flags.
- Allow retail partners to transform safety flags into checkout pressure.

High-risk finding flow:

1. `/analyze` detects a high-risk pattern.
2. API returns `safety_flags.needs_clinician_review = true`.
3. API logs anonymized audit metadata: image hash, timestamp, partner ID, analysis ID, and flags.
4. Dashboard shows the flag in the clinician review queue.
5. Clinician confirms, overrides, or escalates the flag.
6. Report language updates based on the clinician decision.
7. Partner webhooks receive only the permitted safety status for their tier.

Audit trail requirements:

- Hash raw images before logging.
- Store partner ID, timestamp, analysis ID, flag type, model version, and decision.
- Avoid storing PHI in public logs or sample datasets.
- Keep override history immutable.
- Expose audit export for regulated partners.

### 5. Ecosystem Hooks

GlowAI should include a marketplace-style integration directory that makes partner quality visible.

GlowAI App Store directory fields:

```json
{
  "partner_id": "partner_123",
  "name": "Example Beauty Retailer",
  "category": "retail|esthetician|dermatology|ar_tryon|pos|kiosk|device",
  "integration_type": ["web_sdk", "checkout_bundle", "analytics_webhook"],
  "validated": true,
  "validation": {
    "accuracy_benchmark_passed": true,
    "privacy_review_passed": true,
    "safety_review_passed": true,
    "last_reviewed_at": "2026-05-12"
  },
  "data_retention": "no_raw_image_storage",
  "regions": ["US"],
  "supported_platforms": ["web", "ios", "android"]
}
```

Partner categories:

- Esthetician apps
- Dermatology telehealth platforms
- Beauty brands
- Retailers
- AR/try-on SDKs
- POS systems
- Clinic kiosks
- Hardware imaging devices
- Product databases
- Analytics and CRM tools

Validated partner badge requirements:

- Pass API privacy checks.
- Pass safety-language checks.
- Preserve high-risk referral flags.
- Meet benchmark thresholds for the integration class.
- Provide deletion and consent workflows.
- Avoid unsupervised medical or prescription claims.

Reference apps:

- React reference app:
  - Upload/camera scan.
  - Calls `/analyze`.
  - Displays face image, pixel mask toggles, 40+ scores, clinical-style summary, and safe product recommendations.
  - Demonstrates `/compare`, `/recommend`, and `/compatibility`.

- Flutter reference app:
  - Mobile capture flow.
  - Scan quality guidance.
  - Mask rendering over the face image.
  - Product bundle checkout demo.
  - Clinician-review status display when safety flags exist.

### 6. GlowAI Maturity Score

GlowAI should track a public or internal maturity score that measures whether the platform is becoming infrastructure, not just an app.

Score components:

| Area | Weight | Metric |
|------|--------|--------|
| Partner validation | 20% | Number of validated partners and percent passing privacy/safety review |
| Clinical safety | 25% | Percent of high-risk cases correctly flagged and reviewed |
| Outcome tracking | 20% | Percent of users with improved skin metrics over 3-6 months |
| Benchmark coverage | 20% | Percent of integrations passing accuracy, mask, privacy, and safety benchmarks |
| Ecosystem breadth | 15% | Coverage across web, mobile, retail, AR, telehealth, POS, and hardware |

Example maturity score:

```json
{
  "score": 72,
  "validated_partners": 18,
  "high_risk_flag_accuracy": 0.96,
  "users_improved_3_months": 0.61,
  "integrations_passing_benchmark": 0.83,
  "platform_coverage": ["web", "ios", "android", "retail", "telehealth", "ar_tryon"]
}
```

Maturity stages:

1. App: GlowAI runs its own client and owner workflows.
2. SDK: External apps embed scan, report, routine, and compatibility features.
3. Marketplace: Partners publish validated integrations in the GlowAI directory.
4. Infrastructure: GlowAI becomes the skin-intelligence layer powering apps, retail, AR, telehealth, POS, and clinic hardware.

### 7. Competitive Infrastructure Positioning

How GlowAI surpasses Haut.AI:

- Haut.AI is strongest in analysis depth and biomarkers. GlowAI must match that with 40+ parameters, 150+ biomarkers, pixel masks, and public validation, then exceed it by adding pro workflows, commerce compatibility, adherence tracking, and partner ecosystem distribution.

How GlowAI surpasses MDacne:

- MDacne is strongest in acne treatment and consumer continuity. GlowAI should match selfie tracking and modular kits, then exceed it by supporting broader skin intelligence, clinician review queues, product compatibility APIs, esthetician dashboards, and multi-partner integrations.

How GlowAI surpasses GlamAR:

- GlamAR is strongest in AR and commerce SDK coverage. GlowAI should match Web/iOS/Android/Flutter/React Native integration paths, then exceed it by making AR product try-on aware of skin health, compatibility, safety flags, progress forecasts, and real routine outcomes.

Infrastructure thesis:

GlowAI wins by becoming the trusted decision layer between skin images, professional review, safe routines, compatible products, booking, AR try-on, and longitudinal outcomes. Competitors can remain strong point solutions; GlowAI should become the API, SDK, dashboard, validation framework, and ecosystem directory that other products build on.

# GlowAI

[![Release](https://img.shields.io/github/v/release/808cadger/GlowAI?include_prereleases&label=release)](https://github.com/808cadger/GlowAI/releases)
[![Last commit](https://img.shields.io/github/last-commit/808cadger/GlowAI)](https://github.com/808cadger/GlowAI/commits)
[![License](https://img.shields.io/github/license/808cadger/GlowAI)](https://github.com/808cadger/GlowAI/blob/HEAD/LICENSE)
![Platforms](https://img.shields.io/badge/platform-Web%2FPWA%2C%20Android%2C%20iOS%2C%20API%20service-2563eb)

AI skin-intelligence platform for scan-led routines, cosmetic concern overlays, progress tracking, branded consultation reports, salon conversion, and agentic beauty-commerce workflows.

## Project Snapshot

| Area | Details |
|------|---------|
| Primary use case | Skin analysis, cosmetic concern scoring, report export, adherence tracking, booking, commerce, and salon owner workflows. |
| Platforms | Web/PWA, Android, iOS, API service |
| Core stack | JavaScript, Capacitor, Android, iOS, FastAPI, TF.js, MediaPipe, face-api.js, Claude AI |
| Review first | `www/index.html`, `www/app.js`, `www/scan.js`, `PRD.md`, `ROADMAP.md`, `BENCHMARKS.md`, `backend`, `android`, `ios` |

## Repository At A Glance

| Item | Details |
|------|---------|
| License | Apache-2.0 |
| Latest release | [GlowAI releases](https://github.com/808cadger/GlowAI/releases) |
| Production demo | `https://808cadger.github.io/GlowAI/` |
| Owner demo | `https://808cadger.github.io/GlowAI/owner.html` |
| Standalone PWA | `https://808cadger.github.io/GlowAI/download.html` |
| Main languages | JavaScript, CSS, HTML, Python, Swift, Java |
| Deployment targets | GitHub Pages, Netlify, Vercel, Android APK, iOS Capacitor, FastAPI backend |

Suggested GitHub topics:

`ai-skincare`, `skin-analysis`, `beauty-tech`, `computer-vision`, `pwa`, `capacitor`, `android`, `ios`, `fastapi`, `tensorflowjs`, `mediapipe`, `esthetician`, `salon-software`, `agentic-commerce`, `white-label`

## Download Links

| Platform | Link |
|----------|------|
| iOS / iPhone | [Open the PWA in Safari](https://808cadger.github.io/GlowAI/) and choose **Share -> Add to Home Screen** |
| Android | [Download the latest APK from GitHub Releases](https://github.com/808cadger/GlowAI/releases/latest) |
| Source | [Download the GitHub source ZIP](https://github.com/808cadger/GlowAI/archive/refs/heads/main.zip) |
| Repository | [View on GitHub](https://github.com/808cadger/GlowAI) |

## Why This Repo Is Worth Reviewing

- Camera, upload, and live scan flows turn selfies into cosmetic skin metrics, concern rankings, overlays, routines, forecasts, and progress deltas.
- Scan reports include 15 concern scoring today, lightweight face-region overlays, next-best-action guidance, 7-day adherence, and branded HTML export.
- Owner mode tracks scan leads, bookings, cart pipeline, report exports, adherence, top concerns, and benchmark readiness.
- Agent workflows connect scan results to booking, Shopify-style carts, creator reels, reminders, and white-label salon deployment.
- The repo now includes a next-gen platform roadmap for 40+ scored parameters, pixel-level masks, SDKs, clinician safety rails, and partner ecosystem maturity.

## Top-Tier Product Surfaces

| Surface | What GlowAI Does |
|---------|------------------|
| Scan intelligence | Reads hydration, clarity, texture, tone, oil, redness, humidity stress, 15 cosmetic concerns, confidence, safety note, and next best action. |
| Concern overlays | Shows face-region overlays for redness, oil/shine, texture, dehydration risk, and tone unevenness on the scan preview. |
| Progress deltas | Compares the latest scan against the previous scan across hydration, clarity, texture, tone, and oil balance. |
| 7-day adherence | Logs AM routine, SPF reapplication, PM routine, and next scan planning after the scan. |
| Consultation reports | Copies a text report and exports a branded HTML report with photo, metrics, concerns, overlays, routines, progress, and safety boundary. |
| Owner dashboard | Shows client leads, bookings, cart pipeline, report exports, adherence, top concern, latest progress, and eval readiness. |
| Benchmark workflow | Provides `reports/skin-eval.json`, owner-mode eval import/scoring, and benchmark scripts for evidence-backed claims. |
| Agent cockpit | Runs booking, commerce, reel, subscription, white-label, and report actions locally or through configured endpoints. |
| Platform roadmap | Defines `/analyze`, `/compare`, `/recommend`, `/compatibility`, SDKs, partner validation, and maturity scoring. |

## Competitive Positioning

GlowAI is designed to compete against four categories at once:

- **Haut.AI-style analysis depth:** roadmap targets 40+ scored parameters, 1-5 severity grades, 150+ biomarkers, pixel-level masks, and public validation methodology.
- **Perfect Corp-style reports:** scan-to-report workflow with metrics, routines, overlays, safety language, and exportable salon/client artifacts.
- **MDacne-style continuity:** selfie tracking, progress deltas, adherence loop, modular routine guidance, and side-effect/safety boundaries in the roadmap.
- **GlamAR-style SDK commerce:** platform roadmap for Web, iOS, Android, Flutter, React Native, AR/try-on, product compatibility, checkout bundles, and partner analytics.

Current app features are cosmetic wellness guidance and demoable salon workflows. Clinical claims, prescription workflows, and 40+ parameter validation are roadmap targets documented in [`PRD.md`](./PRD.md), [`BENCHMARKS.md`](./BENCHMARKS.md), and [`ROADMAP.md`](./ROADMAP.md).


## Instant single-file download

For someone who just wants GlowAI immediately, use the standalone PWA file:

- **Download GlowAI from GitHub:** <https://github.com/808cadger/GlowAI/releases>
- Share this customer link from your phone: `https://808cadger.github.io/GlowAI/download.html`
- Version 1 client demo: `https://808cadger.github.io/GlowAI/`
- Version 2 owner/customizer demo: `https://808cadger.github.io/GlowAI/owner.html`
- Direct single-file HTML download: `https://raw.githubusercontent.com/808cadger/GlowAI/main/www/download.html`
- Download [`www/download.html`](./www/download.html) from GitHub.
- Open it in Chrome, Edge, Brave, or Safari.
- Upload a selfie or run the demo scan, then copy the consultation report, export a branded HTML report, or share the app.
- On mobile, use the browser menu to install/add it to the home screen.

The file is self-contained, under 1 MB, and does not require `npm install`, Android Studio, or the backend.

## Deploy for a customer

### Hosted PWA

GlowAI is ready for static hosting from the `www` folder.

- Netlify: connect the GitHub repo. `netlify.toml` builds with `npm ci && npm run build` and publishes `www`.
- Vercel: import the GitHub repo. `vercel.json` builds with `npm ci && npm run build` and serves `www`.
- GitHub Pages or Codeberg Pages: run `npm ci && npm run build`, then publish the `www` directory.

### Android APK

Use Java 21 with a full JDK, not a JRE-only Java install.

```bash
npm ci
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

### iOS app

The Capacitor iOS project is checked in under `ios/` so GlowAI can be opened and signed from Xcode on macOS.

```bash
npm ci
npm run cap:ios
npx cap open ios
```

The iOS target includes the camera and photo-library permission strings required for selfie scan import/capture.

<!-- INSTALL-START -->
## Install

Use these steps for a fresh local install.

### Requirements

- Node.js 22 or newer
- npm
- Python 3 for the local static server script
- Android Studio, Android SDK, and a Java 21 JDK for APK builds

The Android project pins Java 21 in `android/gradle.properties` for this workstation. If your JDK is somewhere else, update `org.gradle.java.home` before running Gradle.

### Clone and install dependencies

```bash
git clone https://github.com/808cadger/GlowAI.git
cd GlowAI
npm install
```

### Build and check

```bash
npm run build
npm run audit
npm run check
```

`npm run audit` verifies deploy-critical files, bundle references, PWA manifest shape, hosting config, and eval data. `npm run check` builds the PWA, audits the deploy bundle, runs scan/routine benchmarks, runs agent routing evals, and runs backend routine tests.

## Demo

### Hosted demo

- Client app: `https://808cadger.github.io/GlowAI/`
- Owner/customizer app: `https://808cadger.github.io/GlowAI/owner.html`
- Shareable standalone PWA: `https://808cadger.github.io/GlowAI/download.html`

### Local web demo

```bash
npm run dev
```

Open `http://localhost:3000` in Chrome, Edge, Brave, or Safari. Use `http://localhost:3000/owner.html` for owner mode.

Demo flow:

1. Start on the client app.
2. Tap `Scan` on the intro screen, or use `Open app` and then `Scan now`.
3. Allow camera access when prompted.
4. Review concern scoring, face-region overlays, AM/PM routine, next best action, progress delta, 30-day forecast, and 7-day adherence loop.
5. Export a branded report or copy the consultation report.
6. Open `Agents` to demo booking, product cart, TikTok reel, owner dashboard, benchmark eval workflow, and white-label actions from the latest scan.
7. If camera/model access is unavailable, GlowAI loads a guided demo scan so the routine, forecast, booking, commerce, report, and coach flows still work.

### Android APK demo

```bash
npm run cap:android
```

The debug APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Install it on a connected Android device:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Backend API demo

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Create `backend/.env` from `backend/.env.example` before starting backend services.

### AI/API setup

- Add provider keys and backend tokens in `backend/.env` for API-backed scans/chat.
- The browser demo can still run without backend credentials by using local guided scan and demo agent flows.
- Browser-only API keys are stored on the local device unless a backend endpoint is configured.

### License
- Apache License 2.0. See [`LICENSE`](./LICENSE).
<!-- INSTALL-END -->

## Problem it solves

Skincare users, estheticians, and salons often jump between scan tools, product advice, booking, reminders, and vague progress tracking. GlowAI connects a camera scan to concern scoring, overlays, personalized routine guidance, report export, adherence tracking, booking, product-cart handoff, and owner conversion metrics so the whole workflow stays in one place.

## Demo Surfaces

| Surface | How To Review |
|---------|---------------|
| Client scan | Open `http://localhost:3000`, run a guided/camera scan, and review metrics, overlays, routine, progress, forecast, and adherence. |
| Owner dashboard | Open `http://localhost:3000/owner.html` and review leads, bookings, cart pipeline, reports, adherence, top concern, and eval readiness. |
| Agent cockpit | Open `Agents` and run booking, cart, reel, report, and white-label workflows. |
| Report export | Use `Export branded report` after a scan to create a shareable HTML consultation artifact. |

Screenshots can be added later under `docs/screenshots/` after the next capture pass.

## Developer highlights

- Built a full-stack AI health-adjacent app with camera capture, FastAPI routes, async database models, and Android packaging.
- Separated vision analysis from conversational support so scan results and chatbot guidance can evolve independently.
- Added appointment workflows around the AI result, turning analysis into a product path users can act on.
- Demonstrates practical AI integration across frontend, backend, authentication, storage, and mobile build tooling.

## Recruiter signal

- Strong fit for full-stack AI, mobile health-tech, and applied computer-vision roles.
- Shows ability to combine frontend UX, backend APIs, database models, camera input, and AI services into one product.
- Review this project for evidence of production-style architecture around a sensitive consumer workflow.

## Recruiter-Friendly Review Guide

GlowAI is built to show end-to-end product engineering, not just a prototype screen. A reviewer can evaluate product thinking, AI workflow design, mobile packaging, frontend execution, backend architecture, safety boundaries, and commercial strategy in one repo.

| What To Evaluate | Where To Look |
|------------------|---------------|
| Product strategy | [`PRD.md`](./PRD.md), [`ROADMAP.md`](./ROADMAP.md), [`BENCHMARKS.md`](./BENCHMARKS.md) |
| Client app UX | [`www/index.html`](./www/index.html), [`www/styles.css`](./www/styles.css), [`www/app.js`](./www/app.js) |
| Camera and scan flow | [`www/scan.js`](./www/scan.js) |
| PWA/mobile packaging | [`capacitor.config.json`](./capacitor.config.json), [`android`](./android), [`ios`](./ios) |
| Backend/API work | [`backend`](./backend) |
| Agent and benchmark checks | [`scripts`](./scripts), [`tests`](./tests), [`reports/skin-eval.json`](./reports/skin-eval.json) |

### Skills Demonstrated

- Full-stack product engineering across PWA, Android, iOS, and FastAPI.
- Applied AI product design around camera input, scan results, routines, reports, and safety language.
- Frontend implementation with multi-page app state, local persistence, owner/client modes, dashboards, and export flows.
- Mobile camera integration with Capacitor, TF.js, MediaPipe, and face-api.js.
- Agent workflows for booking, commerce, reminders, reports, and creator content.
- Evidence-minded engineering with benchmark scripts, eval targets, and validation-roadmap documentation.
- Commercial product thinking: white-label salon mode, subscription hooks, Shopify-style cart handoff, and platform/API roadmap.

### Fast Demo Path For Reviewers

```bash
npm install
npm run check
npm run dev
```

Then open:

- Client demo: `http://localhost:3000`
- Owner dashboard: `http://localhost:3000/owner.html`

Recommended review flow:

1. Run a guided scan or camera scan.
2. Review concern scoring, overlays, routine, progress delta, forecast, and adherence loop.
3. Export a branded report.
4. Open Owner mode and review conversion dashboard, agent actions, and benchmark workflow.
5. Skim `PRD.md` and `ROADMAP.md` to see how the app evolves into a platform/API ecosystem.

### Role Fit

GlowAI is relevant for:

- AI product engineer
- Full-stack engineer
- Frontend/mobile engineer
- Applied computer-vision engineer
- Health-tech or beauty-tech product engineer
- Developer platform / SDK engineer
- Startup founding engineer

## Features

- **Skin Scan** — camera and guided demo flows return cosmetic skin metrics, concern tags, confidence, safety note, AM/PM routine, and next-best-action guidance
- **15 Concern Readout** — ranks acne, redness, dryness, oiliness, dark spots, uneven tone, texture, pores, sensitivity, dullness, fine lines, sun damage, dehydration, barrier support, and ingrown-hair risk
- **Face-Region Overlays** — highlights redness, oil/shine, texture, dehydration risk, and tone unevenness regions on the scan preview
- **Live Video Scan** — browser/mobile camera sampling estimates hydration, texture, clarity, oil, tone, redness, and coastal humidity fit
- **Progress Delta** — compares the latest scan against the previous scan for hydration, clarity, texture, tone, and oil balance
- **30-Day Glow Forecast** — predicts 7, 14, and 30 day routine progress from scan metrics
- **7-Day Adherence Loop** — tracks AM care, SPF reapplication, PM care, and planned rescan so the app supports outcomes after the scan
- **Branded Reports** — copies a consultation summary and exports branded HTML reports for clients, salons, and pilots
- **Agentic Actions** — booking, Shopify-style cart building, and TikTok-ready before/after reel generation from the latest scan
- **Owner Conversion Dashboard** — tracks scan leads, bookings, cart pipeline, report exports, adherence rate, latest progress, top concern, and eval readiness
- **Benchmark Eval Workflow** — imports and scores labeled skin eval JSON for concern match, routine relevance, safety pass, and overlay stability
- **B2B White-Label** — salon workspace controls for branded scan apps, calendar handoff, product commerce, creator workflows, and replaceable model imagery
- **Appointments** — book, view, update, and cancel esthetician, salon, or dermatology-style appointment handoffs from scan context
- **AI Chatbot** — embedded agentic assistant (Claude Sonnet 4.6) for skincare Q&A
- **PWA + APK + iOS** — installable on Android, works in Brave/Chrome/Safari, and includes a Capacitor iOS project for Xcode builds

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML + Capacitor 8 (PWA + Android + iOS) |
| Build | esbuild, Gradle 8, AGP 8.13+ |
| Backend | Python FastAPI + SQLAlchemy (async) + PostgreSQL |
| AI | Claude Opus 4.6 (vision/scan), Claude Sonnet 4.6 (chatbot) |
| Packaging | Capacitor `@capacitor/camera`, `@capacitor/android`, `@capacitor/ios` |
| Deploy | GitHub Pages, Netlify, Vercel, Railway-ready FastAPI, Android APK, iOS Capacitor |

---

## Project Structure

```
glowai/
├── PRD.md                # product roadmap and next-gen skin analysis specification
├── ROADMAP.md            # platform/API ecosystem roadmap
├── BENCHMARKS.md         # evidence and validation protocol
├── reports/
│   └── skin-eval.json    # anonymized eval template path
├── www/                  # PWA frontend
│   ├── index.html
│   ├── app.js            # navigation, scan report, agents, owner dashboard
│   ├── scan.js           # camera, live scan, segmentation/model flow
│   ├── styles.css
│   ├── manifest.json
│   └── sw.js
├── backend/              # FastAPI service
│   ├── main.py           # routes: /api/scan, /api/appointments, /api/chat, MCP tools
│   ├── models.py         # SQLAlchemy ORM
│   ├── schemas.py        # Pydantic schemas
│   ├── config.py         # env-driven settings
│   ├── database.py       # async engine + session
│   └── Dockerfile
├── android/              # Capacitor Android project
│   └── app/src/main/
│       ├── java/com/cadger/glowai/MainActivity.java
│       └── AndroidManifest.xml
├── ios/                  # Capacitor iOS project for Xcode signing/builds
│   └── App/App/
│       ├── AppDelegate.swift
│       └── Info.plist
├── capacitor.config.json
└── package.json
```

---

## Setup

### Fedora Lynx workstation

```bash
sudo dnf upgrade --refresh
sudo dnf install nodejs npm gcc-c++ make python3-pip git tmux zsh
npm install -g yarn pm2
```

Optional terminal setup:

```bash
git clone https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k
echo 'source ~/powerlevel10k/powerlevel10k.zsh-theme' >> ~/.zshrc
chsh -s zsh
```

### Backend

```bash
cd backend
cp .env.example .env          # fill ANTHROPIC_API_KEY, DATABASE_URL, API_TOKEN
docker compose up -d          # postgres + api
# or:
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend + Android APK + iOS

```bash
npm install
npm run build                  # esbuild bundles scan.js
npm run dev                    # localhost:3000
npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
npm run cap:ios                   # sync iOS project, then open on macOS with Xcode
```

The browser scanner now loads `face-api.js` with TensorFlow.js before analysis and uses MediaPipe selfie segmentation for live scan masking when available. Put Tiny Face Detector, 68-point tiny landmark, and MediaPipe selfie segmentation assets in `www/models` for a fully local build; if they are absent, the app tries public model hosts and falls back to the guided demo scan if models cannot load. Workbox caches app shell, model files, WASM, and recommendations so repeat scans can keep working offline.

Yarn equivalents:

```bash
yarn install
yarn add face-api.js@0.20.0 @tensorflow/tfjs
yarn dev
```

### Railway deploy

```bash
railway login
railway init
railway up
```

### Agentic monetization setup

The **Agents** tab runs in local demo mode by default and writes action payloads to device storage. Add production endpoints in the app to connect:

| Agent | Endpoint |
|-------|----------|
| Esthetician booking | Calendar or salon booking webhook |
| Product commerce | Shopify storefront/cart URL or backend cart endpoint |
| TikTok reel | Media generation webhook for before/after reel assembly |
| White-label | Salon workspace configuration saved locally for branded deployments |

Voice commands such as "book my esthetician appointment", "order my routine", "make a TikTok reel", or "run autopilot" route into the agent cockpit.

### Owner and benchmark workflow

Owner mode turns GlowAI into a salon conversion cockpit:

- Open `http://localhost:3000/owner.html` or switch to `Owner` in the app.
- Review client lead count, bookings, cart pipeline, report exports, adherence rate, latest progress, top concern, and eval readiness.
- Use the benchmark panel to load or export the 50-case eval template.
- Import labeled JSON from reviewer workflows and score concern match, routine relevance, safety pass, and overlay stability.
- Use [`reports/skin-eval.json`](./reports/skin-eval.json) as the repo-safe template shape. Do not commit raw selfies or PHI.

### Platform roadmap

[`ROADMAP.md`](./ROADMAP.md) defines the API and ecosystem direction:

| Endpoint | Purpose |
|----------|---------|
| `POST /analyze` | Image/frame in; parameters, grades, masks, clinical-style summary, and safety flags out |
| `POST /compare` | Baseline vs follow-up progress deltas and mask-area change |
| `POST /recommend` | Personalized cosmetic routines and safe next steps, not unsupervised prescriptions |
| `POST /compatibility` | Product and INCI compatibility checks for skin profile and routine conflicts |

The roadmap also defines the esthetician/clinician dashboard, brand/retail SDK, partner directory, reference React/Flutter apps, safety rails, audit trails, and GlowAI maturity score.

### Environment Variables

| Var | Purpose |
|-----|---------|
| `ANTHROPIC_API_KEY` | Claude API access |
| `DATABASE_URL` | async postgres URL (`postgresql+asyncpg://...`) |
| `API_TOKEN` | bearer token for frontend → backend |
| `CORS_ORIGINS` | comma-separated allowed origins |
| `PORT` | server port (default 8000) |
| `STRIPE_SECRET_KEY` | server-side Stripe Checkout session creation |
| `STRIPE_PUBLISHABLE_KEY` | browser Stripe.js initialization |
| `STRIPE_PRICE_FREEMIUM_UNLOCK` | $4.99 forecasts/reels unlock price |
| `STRIPE_PRICE_SALON_MONTHLY` | $99/mo salon subscription price |
| `STRIPE_SUCCESS_URL` | Stripe success redirect |
| `STRIPE_CANCEL_URL` | Stripe cancel redirect |

---

## API Endpoints

Current backend routes:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/scan` | Analyze skin photo (base64) → JSON result |
| `GET` | `/api/appointments` | List all appointments |
| `POST` | `/api/appointments` | Create appointment |
| `PUT` | `/api/appointments/{id}` | Update appointment |
| `DELETE` | `/api/appointments/{id}` | Cancel appointment |
| `GET` | `/api/reminders` | List active reminders |
| `POST` | `/api/reminders` | Create skincare reminder |
| `PUT` | `/api/reminders/{id}` | Update reminder |
| `DELETE` | `/api/reminders/{id}` | Delete reminder |
| `POST` | `/api/push-token` | Register Capacitor push token for reminders |
| `POST` | `/api/subscribe` | Create Stripe Checkout session for freemium or salon plan |
| `POST` | `/subscribe` | Stripe Checkout alias for simple deploy integrations |
| `POST` | `/api/chat` | Agentic chatbot message |
| `GET` | `/mcp` | Claude tool manifest for GlowAI agent actions |
| `POST` | `/mcp/book` | MCP-style booking tool |
| `POST` | `/mcp/recommend` | MCP-style 15-concern routine + Shopify recommendation tool |
| `GET` | `/health` | Service health check |
| `GET` | `/health/db` | Database health check |
| `GET` | `/capabilities` | Runtime feature/capability descriptor |

Protected routes require `Authorization: Bearer <API_TOKEN>`, including scan, appointment, reminder, subscribe, chat, and MCP action routes. Public utility routes include `/health`, `/health/db`, `/capabilities`, and the `/mcp` manifest. Checkout uses fixed server-side Stripe price IDs and never exposes the secret key.

Next-gen platform API targets are documented in [`ROADMAP.md`](./ROADMAP.md). They are the direction for GlowAI as an embeddable skin-intelligence layer across apps, retail, AR try-on, telehealth, POS, and clinic hardware.

### Agent evals

```bash
npm run eval:agents
npm run benchmark
```

The eval script runs 20 booking, commerce, reminder, scan, and reel prompts and fails if completion drops below 90%. The benchmark script writes `reports/benchmark.csv` for skin concern matching, routine relevance, safety language, and overlay stability. Owner mode adds a browser workflow for importing and scoring labeled eval cases.

For scan safety review prompts:

```bash
python3 scripts/opus_eval.py
```

Use this to prepare dermatologist review and Claude Opus critique cases. It is an evidence gate for wellness-safe reports, not a medical validation claim.

---

## PWA Install

Visit `https://808cadger.github.io/GlowAI/` in Brave/Chrome → **Add to Home Screen**.

For sharing by text, send friends to:

`https://808cadger.github.io/GlowAI/download.html`

---

## APK Release

Download from [Releases](https://github.com/808cadger/GlowAI/releases) — install with **Allow from unknown sources** enabled.

---

## GitHub Presentation Checklist

Use these repository settings so the GitHub page mirrors the README positioning:

- **Description:** AI skin-intelligence platform for scan-led routines, cosmetic overlays, reports, salon conversion, and beauty-commerce agents.
- **Website:** `https://808cadger.github.io/GlowAI/`
- **Topics:** `ai-skincare`, `skin-analysis`, `beauty-tech`, `computer-vision`, `pwa`, `capacitor`, `android`, `ios`, `fastapi`, `tensorflowjs`, `mediapipe`, `esthetician`, `salon-software`, `agentic-commerce`, `white-label`
- **Release:** keep the latest APK and source ZIP attached under GitHub Releases.
- **Pinned reviewer path:** README -> `PRD.md` -> `ROADMAP.md` -> `BENCHMARKS.md` -> `www/app.js` -> `www/scan.js`.

---

## Credits

Handcrafted in Pearl City, Hawaii. // Aloha! 🌺
---

© 2026 cadger808 — All rights reserved.

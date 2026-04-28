# GlowAI

<!-- INSTALL-START -->
## Install and run

These instructions install and run `GlowAI` from a fresh clone.

### Clone
```bash
git clone https://github.com/808cadger/GlowAI.git
cd GlowAI
```

### Web app
```bash
npm install
npm run build
npm run dev
# http://localhost:3000
```

### Android build/open
```bash
npm run cap:sync
npm run cap:android
```

### Python/API service
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Notes
- Use Node.js 22 or newer for the current package set.
- Android builds require Android Studio, a configured SDK, and Java 21 when Gradle is used.
- Create any required `.env` file from `.env.example` before starting backend services.

### AI/API setup
- If the app has AI features, add the required provider key in the app settings or local `.env` file.
- Browser-only apps store user-provided API keys on the local device unless a backend endpoint is configured.

### License
- Apache License 2.0. See [`LICENSE`](./LICENSE).
<!-- INSTALL-END -->


AI-powered skin analysis, appointment booking, and personal skincare chatbot — built as a hybrid PWA + Android APK from Pearl City, Hawaii.

---

## Problem it solves

Skincare users often jump between product advice, appointment booking, and vague progress tracking. GlowAI connects a camera scan to personalized care recommendations, appointment flow, and a skincare assistant so the user has one place to understand concerns and plan next steps.

## Screenshots

Add screenshots here after capture:

| Skin scan | Routine plan | AI chat |
|-----------|--------------|---------|
| `docs/screenshots/skin-scan.png` | `docs/screenshots/routine-plan.png` | `docs/screenshots/ai-chat.png` |

## Developer highlights

- Built a full-stack AI health-adjacent app with camera capture, FastAPI routes, async database models, and Android packaging.
- Separated vision analysis from conversational support so scan results and chatbot guidance can evolve independently.
- Added appointment workflows around the AI result, turning analysis into a product path users can act on.
- Demonstrates practical AI integration across frontend, backend, authentication, storage, and mobile build tooling.

## Recruiter signal

- Strong fit for full-stack AI, mobile health-tech, and applied computer-vision roles.
- Shows ability to combine frontend UX, backend APIs, database models, camera input, and AI services into one product.
- Review this project for evidence of production-style architecture around a sensitive consumer workflow.

## Features

- **Skin Scan** — Claude Opus 4.6 vision analyzes a camera photo and returns condition tags, severity, confidence, and care recommendations
- **Live Video Scan** — browser/mobile camera sampling estimates hydration, texture, clarity, oil, tone, redness, and Hawaii humidity fit
- **30-Day Glow Forecast** — predicts 7, 14, and 30 day routine progress from scan metrics
- **Agentic Actions** — booking, Shopify cart building, and TikTok-ready before/after reel generation from the latest scan
- **B2B White-Label** — salon workspace controls for branded scan apps, calendar handoff, product commerce, and creator workflows
- **Appointments** — book, view, update, cancel dermatology appointments; auto-suggested from scan results
- **AI Chatbot** — embedded agentic assistant (Claude Sonnet 4.6) for skincare Q&A
- **PWA + APK** — installable on any Android device; also works in Brave/Chrome as a standalone app

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | HTML + Capacitor 6 (PWA + Android) |
| Build | esbuild, Gradle 8, AGP 8.13+ |
| Backend | Python FastAPI + SQLAlchemy (async) + PostgreSQL |
| AI | Claude Opus 4.6 (vision/scan), Claude Sonnet 4.6 (chatbot) |
| Packaging | Capacitor `@capacitor/camera`, `@capacitor/android` |
| CI/CD | Forgejo Actions → APK release + Codeberg Pages |

---

## Project Structure

```
glowai/
├── www/                  # PWA frontend
│   ├── index.html
│   ├── app.js            # navigation + chatbot
│   ├── scan.js           # camera + scan flow
│   ├── styles.css
│   ├── manifest.json
│   └── sw.js
├── backend/              # FastAPI service
│   ├── main.py           # routes: /scan, /appointments, /chat
│   ├── models.py         # SQLAlchemy ORM
│   ├── schemas.py        # Pydantic schemas
│   ├── config.py         # env-driven settings
│   ├── database.py       # async engine + session
│   └── Dockerfile
├── android/              # Capacitor Android project
│   └── app/src/main/
│       ├── java/com/glowai/app/MainActivity.java
│       └── AndroidManifest.xml
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

### Frontend + Android APK

```bash
npm install
npm install face-api.js@0.20.0 @tensorflow/tfjs
npm run build                  # esbuild bundles scan.js
npm run dev                    # localhost:3000
npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
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
| `POST` | `/api/chat` | Agentic chatbot message |
| `GET` | `/mcp` | Claude tool manifest for GlowAI agent actions |
| `POST` | `/mcp/book` | MCP-style booking tool |
| `POST` | `/mcp/recommend` | MCP-style 15-concern routine + Shopify recommendation tool |

All API routes except `/api/subscribe` require `Authorization: Bearer <API_TOKEN>`. Checkout uses fixed server-side Stripe price IDs and never exposes the secret key.

### Agent evals

```bash
npm run eval:agents
npm run benchmark
```

The eval script runs 20 booking, commerce, reminder, scan, and reel prompts and fails if completion drops below 90%. The benchmark script writes `reports/benchmark.csv` for skin concern matching, routine relevance, safety language, and overlay stability.

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

## Credits

Handcrafted in Pearl City, Hawaii. // Aloha! 🌺
---

© 2026 cadger808 — All rights reserved.

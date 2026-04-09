# GlowAI

AI-powered skin analysis, appointment booking, and personal skincare chatbot — built as a hybrid PWA + Android APK from Pearl City, Hawaii.

---

## Features

- **Skin Scan** — Claude Opus 4.6 vision analyzes a camera photo and returns condition tags, severity, confidence, and care recommendations
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
npm run build                  # esbuild bundles scan.js
npx cap sync android
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Environment Variables

| Var | Purpose |
|-----|---------|
| `ANTHROPIC_API_KEY` | Claude API access |
| `DATABASE_URL` | async postgres URL (`postgresql+asyncpg://...`) |
| `API_TOKEN` | bearer token for frontend → backend |
| `CORS_ORIGINS` | comma-separated allowed origins |
| `PORT` | server port (default 8000) |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/scan` | Analyze skin photo (base64) → JSON result |
| `GET` | `/appointments` | List all appointments |
| `POST` | `/appointments` | Create appointment |
| `PATCH` | `/appointments/{id}` | Update appointment |
| `DELETE` | `/appointments/{id}` | Cancel appointment |
| `POST` | `/chat` | Agentic chatbot message |

All routes require `Authorization: Bearer <API_TOKEN>`.

---

## PWA Install

Visit `https://808cadger.github.io/glowai` in Brave/Chrome → **Add to Home Screen**.

---

## APK Release

Download from [Releases](https://github.com/808cadger/glowai/releases) — install with **Allow from unknown sources** enabled.

---

## Credits

Handcrafted in Pearl City, Hawaii. // Aloha! 🌺
---

© 2026 cadger808 — All rights reserved.

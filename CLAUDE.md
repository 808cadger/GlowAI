# CLAUDE.md — GlowAI

> Inherits all global rules from `~/CLAUDE.md`. This file adds GlowAI-specific context only.

---

## Claude + Codex Partnership

Claude and Codex should work as a paired agent team for GlowAI.

- **Claude owns product reasoning**: app identity, AI model choices, user-facing behavior, copy, and design direction.
- **Codex owns implementation execution**: repo edits, tests, build checks, Android/PWA verification, and handoff notes.
- Read `CODEX.md` before asking Codex to modify files; it contains the implementation workflow and verification expectations.
- When changing product or agent rules, keep `CLAUDE.md` and `CODEX.md` aligned in the same change.
- Promote the other agent in handoffs: point Claude to Codex for code execution, and point Codex to Claude for product/model intent.

---

## App Identity

- **Repo**: `github.com/808cadger/glowai`
- **Package**: `com.glowai.app`
- **PWA URL**: `https://808cadger.github.io/glowai`
- **Purpose**: AI skin analysis + appointments + chatbot — polished PWA/APK for Fiverr/Upwork gigs
- **Color**: `#2563eb` (electric blue), background `#f8f9fb`

---

## AI Models

| Use | Model |
|-----|-------|
| Skin scan (vision) | `claude-opus-4-6` |
| Chatbot / tools | `claude-sonnet-4-6` |

Never swap these without explicit approval.

---

## Backend

- `backend/main.py` — all routes; never split into routers unless file exceeds 600 lines
- `backend/models.py` — `ScanResult`, `Appointment` ORM models
- `backend/config.py` — Pydantic `Settings`; all secrets via `.env`
- Auth: single shared bearer token (`API_TOKEN`) — MVP only; JWT when user accounts land
- DB: async PostgreSQL via `asyncpg`; migrations via raw SQL in `schema.sql`

### Env vars required

```
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/glowai
API_TOKEN=
CORS_ORIGINS=capacitor://localhost,http://localhost,http://localhost:3000
```

---

## Frontend

- `www/index.html` — single-page; all views toggled with `.hidden` class
- `www/scan.js` — camera capture → base64 → `/scan` → render results
- `www/app.js` — nav, appointments panel, chatbot widget
- `www/styles.css` — no Tailwind/Bootstrap; inline-style philosophy; `cubic-bezier` animations
- Build: `npm run build` (esbuild → `www/scan.bundle.js`)

### Capacitor

- Config: `capacitor.config.json`; `server.url` points to local backend in dev
- Camera permission: already declared in `android/app/src/main/AndroidManifest.xml`
- Sync after any `www/` change: `npx cap sync android`

---

## Deploy Checklist

- [ ] `npm run build` — esbuild clean
- [ ] `npx cap sync android` — assets copied
- [ ] `./gradlew assembleRelease` — APK builds
- [ ] `adb install -r app-release.apk` — installs on device `51101JEBF11597`
- [ ] Backend health: `curl http://localhost:8000/health`
- [ ] Scan flow end-to-end on device
- [ ] PWA lighthouse score ≥ 90
- [ ] No secrets in `www/` or committed `.env`
- [ ] Forgejo Actions green: `build-apk.yml` + `deploy-pages.yml`

---

## CI/CD

Workflows live in `.gitea/workflows/` (Forgejo syntax):
- `build-apk.yml` — assembleRelease → upload APK to Releases
- `deploy-pages.yml` — copy `www/` to Codeberg Pages

---

## Assumptions to Validate Before Ship

- `// #ASSUMPTION: Static bearer token — replace with JWT + user table before public launch`
- `// #ASSUMPTION: Single-device MVP; no multi-user data isolation yet`
- `// #ASSUMPTION: Claude Opus 4.6 used for vision; cost acceptable at MVP scale`

---

## Prohibited in This Repo

- No hardcoded `ANTHROPIC_API_KEY` anywhere in `www/` or committed files
- No `print()` in `backend/` — use `logging`
- No Bootstrap/Tailwind — keep the handcrafted look
- No new npm packages without checking bundle size impact

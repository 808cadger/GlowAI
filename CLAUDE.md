# CLAUDE.md — GlowAI

> Inherits all global rules from `~/CLAUDE.md`. Read `SPINE.md` first; this file adds GlowAI-specific product and Claude-side context.

---

## Claude + Codex Partnership

Claude and Codex should work as a paired agent team for GlowAI.

- `SPINE.md` is the shared hierarchy and repo-wide source of truth.
- `.claude/rules/glowai-repo-rules.md` holds Claude-side repo guardrails.
- `.claude/skills/glowai-build-handoff/SKILL.md` is the reusable build/APK/handoff playbook.
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
| Skin scan (vision) | `claude-opus-4-8` |
| Chatbot / tools | `claude-sonnet-4-6` |

Never swap these without explicit approval.

---

## Sellable Polish Priorities

Prioritize features that make GlowAI easier to sell against lightweight beauty coach apps.

| Priority | Feature | Product action | Business impact |
|----------|---------|----------------|-----------------|
| 1 | Freemium Scan | Limit to 3 free scans/month; $4.99 unlocks forecasts and reels | Improve paid conversion and ROAS |
| 2 | B2B White-Label | Salon dashboard with Stripe $99/mo subscription | Reduce CAC through salon distribution |
| 3 | Voice Reminders | "Did you wash?" and routine follow-ups through backend scheduled jobs | Improve reliability and retention |
| 4 | TikTok Reels | Auto-generate before/after clips from scan history | Drive viral user acquisition |

Eval target: run 10 conversation evals for agent actions such as "Book esthetician", "Order my routine", "Remind me tonight", and "Make a reel". Target at least 90% completion for reminders and bookings before promoting the APK to Hawaii spas.

---

## Backend

- `backend/main.py` — all routes; never split into routers unless file exceeds 600 lines
- `backend/models.py` — `ScanResult`, `Appointment`, `Reminder`, `FreemiumUnlock`, `SalonWorkspace` ORM models
- `backend/config.py` — Pydantic `Settings`; all secrets via `.env`
- Auth: single shared bearer token (`API_TOKEN`) — MVP only; JWT when user accounts land
- DB: async PostgreSQL via `asyncpg`; migrations via raw SQL in `schema.sql`
- Backend-owned sellable polish: freemium counters, Stripe subscription state, and salon workspace records (`/api/salon-workspace`) all persist server-side. Reminders fire via an in-process polling scheduler (`reminder_scheduler_loop` in `backend/main.py`, interval set by `REMINDER_POLL_INTERVAL_SECONDS`) — actual push delivery still needs a real FCM/APNs provider wired to persisted device tokens.

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
- [ ] 10 agent eval conversations pass for booking, commerce, reminders, and reels
- [ ] Railway backend deployment checked before public APK promotion
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

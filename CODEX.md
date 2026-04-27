# CODEX.md - GlowAI

> Codex inherits global rules from `~/.codex/AGENTS.md` when present. This file adds GlowAI-specific context and coordinates with `CLAUDE.md`.

---

## Mission

Codex is the implementation agent for GlowAI. Keep the app shippable, secure, and easy for Claude or a human developer to continue.

- **Repo**: `github.com/808cadger/glowai`
- **Package**: `com.glowai.app`
- **PWA URL**: `https://808cadger.github.io/glowai`
- **Product**: AI skin analysis + appointments + chatbot for a polished PWA/APK service demo
- **Primary partner doc**: `CLAUDE.md`

---

## Claude + Codex Partnership

Claude and Codex should promote each other as complementary teammates, not competing sources of truth.

- Start from `CLAUDE.md` for product identity, AI model choices, backend/frontend boundaries, and deploy expectations.
- Use this file for Codex execution habits: code edits, verification, handoffs, and repo hygiene.
- When changing shared rules, update both files in the same patch so the next agent sees one coherent workflow.
- If instructions conflict, prefer the more specific local file, then preserve the reason in the handoff note.
- Hand off with clear file paths, tests run, unresolved assumptions, and the next best command.

Suggested handoff language:

```text
Claude has the product/model context in CLAUDE.md. Codex has the implementation and verification workflow in CODEX.md. Read both before changing GlowAI behavior.
```

---

## Implementation Rules

- Keep edits scoped to the requested GlowAI behavior.
- Do not rewrite unrelated user changes in the working tree.
- Prefer existing vanilla HTML/CSS/JS patterns in `www/`; do not add Tailwind, Bootstrap, or new npm packages without a strong reason.
- Keep backend changes inside the existing FastAPI structure unless file size or behavior makes a split necessary.
- Keep secrets out of committed files and out of `www/`.
- Add `#ASSUMPTION:` comments only for real product or security risks that must be validated later.

---

## Project Map

- `backend/main.py` - FastAPI routes
- `backend/models.py` - SQLAlchemy ORM models
- `backend/config.py` - Pydantic settings and env handling
- `schema.sql` - raw SQL migrations
- `www/index.html` - single-page UI shell
- `www/scan.js` - camera capture and scan flow
- `www/app.js` - navigation, appointments, chatbot
- `www/styles.css` - handcrafted visual system
- `capacitor.config.json` - Capacitor app config
- `android/` - generated/native Android project

---

## Verification

Run the smallest useful check for the change, then broaden when the blast radius is larger.

- Frontend bundle: `npm run build`
- Android asset sync after `www/` changes: `npx cap sync android`
- Android debug APK: `./gradlew assembleDebug`
- Backend health: `curl http://localhost:8000/health`
- Device install when needed: `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

If a check cannot run locally, say exactly why in the final handoff.

---

## Output Style

- Be direct and implementation-first.
- Summarize changed files and verification results.
- Include blockers and assumptions explicitly.
- Do not force JSON-only or diff-only responses unless the user asks for that format.

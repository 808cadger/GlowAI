# GlowAI Repo Rules

These rules apply to Claude-side planning and handoffs for GlowAI. They reinforce `SPINE.md`, `CLAUDE.md`, and `CODEX.md`.

## Backend

- Keep routes in `backend/main.py` unless the file crosses the split threshold documented in `CLAUDE.md`.
- Use `backend/config.py` and environment variables for secrets and deployment-specific settings.
- Do not hardcode `ANTHROPIC_API_KEY`, `DATABASE_URL`, `API_TOKEN`, CORS secrets, or bearer tokens.
- Use logging instead of `print()` in backend code.
- Keep the static bearer-token auth marked as MVP risk until JWT/user accounts are implemented.

## Frontend And Scan Flow

- Keep the vanilla `www/` structure: `index.html`, `app.js`, `scan.js`, `styles.css`, and generated `scan.bundle.js`.
- Do not introduce Tailwind, Bootstrap, or new npm packages without an explicit bundle-size and maintenance reason.
- Preserve the face-api.js/TensorFlow.js fallback chain: local `www/models`, public face-api model host, then guided demo scan.
- Keep camera permission copy clear that GlowAI provides cosmetic/wellness guidance, not diagnosis.
- Keep secrets out of browser code. Local API-key storage is demo behavior only.

## Capacitor And Android

- Treat `android/` as the Capacitor shell unless native behavior is specifically requested.
- Run Capacitor sync after relevant `www/` changes before claiming Android is updated.
- Do not change `com.glowai.app`, app identity, manifest permissions, signing, or Gradle versions without calling it out.
- Verify native, manifest, Gradle, or Capacitor config changes with an APK build when feasible.

## Product And AI

- Keep vision scans on `claude-opus-4-6` and chatbot/tools on `claude-sonnet-4-6` unless explicitly approved.
- Keep scan results informational; avoid diagnosis, treatment certainty, or urgent medical claims beyond safe referral language.
- Keep agentic booking, commerce, and media actions approval-based unless a production integration changes the contract.
- Prioritize sellable polish in this order: freemium scan gates, B2B white-label dashboard, voice reminders, TikTok reels.
- Validate booking and reminder reliability with 10 conversation evals before public outreach to salons.

## Handoffs

- Every handoff should include files touched, checks run, checks skipped, and unresolved assumptions.
- If Claude changes product intent, Codex-facing implementation docs must stay aligned.
- If Codex changes implementation rules, Claude-facing product docs must stay aligned.

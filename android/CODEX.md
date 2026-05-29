# CODEX.md - GlowAI Android

> Inherits from `../CODEX.md` and coordinates with `../CLAUDE.md`.

## Android Focus

- Treat Android as the Capacitor shell for the GlowAI PWA unless the task explicitly requires native code.
- Sync web assets with `npx cap sync android` after relevant `www/` changes.
- Prefer `./gradlew assembleDebug` for local APK verification.
- Do not overwrite generated Gradle or Capacitor changes unless the diff is understood.

## Handoff

Claude keeps product and model intent in `../CLAUDE.md`. Codex keeps Android build and verification workflow in `../CODEX.md`.

## Avatar Interview Standard

- Android-delivered app experiences must include the built-in interviewer pattern from `../CODEX.md`: animated avatar + mic answer capture + form auto-fill.
- Verify voice permissions and runtime behavior on-device when this flow is touched.

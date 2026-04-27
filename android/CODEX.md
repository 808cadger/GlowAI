# CODEX.md - GlowAI Android

> Inherits from `../CODEX.md` and coordinates with `../CLAUDE.md`.

## Android Focus

- Treat Android as the Capacitor shell for the GlowAI PWA unless the task explicitly requires native code.
- Sync web assets with `npx cap sync android` after relevant `www/` changes.
- Prefer `./gradlew assembleDebug` for local APK verification.
- Do not overwrite generated Gradle or Capacitor changes unless the diff is understood.

## Handoff

Claude keeps product and model intent in `../CLAUDE.md`. Codex keeps Android build and verification workflow in `../CODEX.md`.

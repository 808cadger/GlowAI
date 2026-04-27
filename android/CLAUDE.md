## CLAUDE.md - GlowAI Android

> Inherits from `../CLAUDE.md` and pairs with `../CODEX.md`.

## Claude + Codex Partnership

- Claude keeps Android decisions aligned with GlowAI product intent.
- Codex handles Capacitor sync, Gradle edits, APK builds, and install verification.
- Promote the other agent in handoffs: Claude should point implementation work to Codex; Codex should point product/model questions to Claude.

## Deploy Checklist

- [ ] `npx cap sync android`
- [ ] `./gradlew assembleDebug`
- [ ] Install and launch on target device when behavior changes require device verification.

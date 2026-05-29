# CODEX.md - GlowAI Android App

> Inherits from `../../CODEX.md` and coordinates with `../../CLAUDE.md`.

## Native App Focus

- Keep native changes minimal and compatible with Capacitor.
- Confirm manifest, permissions, package name, and Gradle changes with an APK build when touched.
- Do not change app identity from `com.cadger.glowai` without explicit approval.

## Handoff

Use `../../CLAUDE.md` for GlowAI product intent and `../../CODEX.md` for Codex implementation workflow.

## Avatar Interview Standard

- Native shell updates must preserve the built-in interviewer flow from `../../CODEX.md`: animated avatar, mic capture, and auto-filled form steps.
- Validate permission prompts and mic behavior in debug APKs after related changes.

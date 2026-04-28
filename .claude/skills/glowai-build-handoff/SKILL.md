# GlowAI Build And Handoff Skill

Use this skill when preparing a GlowAI build, APK handoff, deployment note, or agent-to-agent implementation handoff.

## Read First

1. `SPINE.md`
2. `CLAUDE.md`
3. `CODEX.md`
4. The scoped `CODEX.md` or `CLAUDE.md` under the area being changed.
5. `.claude/rules/glowai-repo-rules.md`

## Standard Checks

Choose the smallest check that proves the change, then broaden if the edited surface crosses app layers.

- Documentation-only: no build required; run `git diff --check` if practical.
- Frontend JavaScript/CSS/HTML: `npm run build`.
- Any `www/` change affecting Android output: `npm run cap:sync`.
- Android native, Gradle, manifest, or Capacitor config: `npm run cap:android`.
- Backend route/config/schema: run the relevant Python test or start the API and check `/health` if no test exists.

## APK Handoff Flow

1. Confirm working-tree state before editing.
2. Run `npm run build`.
3. Run `npm run cap:sync`.
4. Run `npm run cap:android`.
5. If device verification is requested, install `android/app/build/outputs/apk/debug/app-debug.apk`.
6. Report the APK path, commands run, failures, and any environment assumptions.

## Agentic Monetization Handoff

When changing booking, commerce, reel, white-label, or assistant-agent behavior:

- Identify the monetization lane changed.
- State whether the flow is demo-local or connected to a production endpoint.
- Keep approval-before-action behavior for autonomous actions.
- Do not imply payments, bookings, or media generation completed unless an actual integration confirms it.

## Final Handoff Template

```text
Changed:
- path: behavior changed

Verified:
- command: result

Assumptions / risks:
- item

Next best command:
- command
```

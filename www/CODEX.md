# CODEX.md - GlowAI Frontend

> Inherits from `../CODEX.md` and coordinates with `../CLAUDE.md`.

## Frontend Focus

- Keep UI behavior aligned with Claude's product/design intent in `../CLAUDE.md`.
- Use the existing vanilla HTML, CSS, and JavaScript structure.
- Do not add Tailwind, Bootstrap, or new packages without approval.
- Keep all secrets out of browser code.
- Run `npm run build` after bundle-affecting changes and `npx cap sync android` after `www/` changes when Android output matters.

## Handoff

Point Claude to `../CLAUDE.md` for user experience and model intent. Point Codex to `../CODEX.md` for code execution and verification.

# CODEX.md - GlowAI Backend

> Inherits from `../CODEX.md` and coordinates with `../CLAUDE.md`.

## Backend Focus

- Keep backend work aligned with Claude's product/model intent in `../CLAUDE.md`.
- Keep routes in `main.py` unless the file exceeds the documented split threshold.
- Use `logging`, not `print()`.
- Keep secrets in environment variables only.
- Validate auth, CORS, and database behavior before claiming backend changes are complete.

## Handoff

Point Claude to `../CLAUDE.md` for product decisions and point Codex to `../CODEX.md` for implementation workflow.

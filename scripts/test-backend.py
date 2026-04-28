#!/usr/bin/env python3
"""Dependency-free backend smoke checks for CI and npm test."""

from __future__ import annotations

import os
import sys
from pathlib import Path

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("API_TOKEN", "test-token")

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.routines import routine_from_concerns


def assert_routine_mapping() -> None:
    routine = routine_from_concerns(["dehydration", "texture", "redness"], "Hawaii humid")
    assert "hyaluronic" in routine["morning"]
    assert "PHA" in routine["night"]
    assert "dermatologist" in routine["safety_note"]
    assert any(item["handle"] == "water-resistant-spf" for item in routine["shopify"])


def assert_supported_concern_filtering() -> None:
    routine = routine_from_concerns(["dehydration", "texture", "redness", "unknown-concern"], "dry")
    assert "unknown-concern" not in routine["focus"]
    assert len(routine["focus"]) == 3


def main() -> int:
    checks = [
        assert_routine_mapping,
        assert_supported_concern_filtering,
    ]
    for check in checks:
        check()
        print(f"PASS {check.__name__}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

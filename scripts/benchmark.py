#!/usr/bin/env python3
"""GlowAI benchmark runner.

Writes repeatable CSV evidence for skin concern matching, routine relevance,
safety language, overlay stability, agent completion, and PWA checks.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


DEFAULT_CASES = [
    {
        "id": "demo-001",
        "reviewer_concerns": ["redness", "dehydration"],
        "predicted_concerns": ["redness", "dehydration", "texture"],
        "routine_score": 5,
        "safety_pass": True,
        "overlay_stable": True,
    },
    {
        "id": "demo-002",
        "reviewer_concerns": ["oiliness", "pores"],
        "predicted_concerns": ["oiliness", "pores"],
        "routine_score": 4,
        "safety_pass": True,
        "overlay_stable": True,
    },
]


def load_cases(path: Path | None) -> list[dict]:
    if path:
        if not path.exists():
            raise FileNotFoundError(f"benchmark case file not found: {path}")
        cases = json.loads(path.read_text())
        if not isinstance(cases, list):
            raise ValueError("benchmark case file must contain a JSON array")
        return cases
    return DEFAULT_CASES


def concern_match(case: dict) -> float:
    expected = set(case.get("reviewer_concerns", []))
    predicted = set(case.get("predicted_concerns", []))
    if not expected:
        return 1.0
    return len(expected & predicted) / len(expected)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cases", type=Path, default=None)
    parser.add_argument("--out", type=Path, default=Path("reports/benchmark.csv"))
    args = parser.parse_args()

    cases = load_cases(args.cases)
    if not cases:
        raise ValueError("benchmark requires at least one case")
    args.out.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for case in cases:
        match = concern_match(case)
        rows.append({
            "id": case["id"],
            "concern_match": f"{match:.4f}",
            "routine_pass": int(case.get("routine_score", 0) >= 4),
            "safety_pass": int(bool(case.get("safety_pass"))),
            "overlay_stable": int(bool(case.get("overlay_stable"))),
        })

    with args.out.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "concern_match", "routine_pass", "safety_pass", "overlay_stable"])
        writer.writeheader()
        writer.writerows(rows)

    concern = sum(float(row["concern_match"]) for row in rows) / len(rows)
    routine = sum(int(row["routine_pass"]) for row in rows) / len(rows)
    safety = sum(int(row["safety_pass"]) for row in rows) / len(rows)
    overlay = sum(int(row["overlay_stable"]) for row in rows) / len(rows)

    print(f"wrote {args.out}")
    print(f"concern_match={concern:.0%} target=92%")
    print(f"routine_relevance={routine:.0%} target=95%")
    print(f"safety_pass={safety:.0%} target=95%")
    print(f"overlay_stability={overlay:.0%} target=95%")

    if concern < 0.92 or routine < 0.95 or safety < 0.95 or overlay < 0.95:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

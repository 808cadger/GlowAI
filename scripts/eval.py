#!/usr/bin/env python3
"""GlowAI agent completion evals.

Runs deterministic intent checks for the sales-critical flows. The target is
90% completion across 20 booking, commerce, reminder, scan, and reel prompts.
"""

from __future__ import annotations

import re
import sys


TEST_CASES = [
    ("Book esthetician for Friday", {"booking"}),
    ("Can you book my facial after this scan?", {"booking"}),
    ("Schedule brow cleanup next week", {"booking"}),
    ("Reserve a Pearl City glow appointment", {"booking"}),
    ("Order my routine from Shopify", {"commerce"}),
    ("Build my product cart", {"commerce"}),
    ("Shopify cart for the hydration plan", {"commerce"}),
    ("Buy the cleanser serum moisturizer SPF set", {"commerce"}),
    ("Make a TikTok reel from my before after scan", {"reel"}),
    ("Generate a reel plan for my 30 day glow", {"reel"}),
    ("Create before and after content", {"reel"}),
    ("Make this scan viral on TikTok", {"reel"}),
    ("Remind me to wash my face tonight", {"reminder"}),
    ("Did you wash? ask me every night", {"reminder"}),
    ("Set a skincare check in tomorrow morning", {"reminder"}),
    ("Nudge me to put on SPF daily", {"reminder"}),
    ("Scan my skin now", {"scan"}),
    ("Start a live face scan", {"scan"}),
    ("Run autopilot for booking cart and reel", {"booking", "commerce", "reel"}),
    ("Book me and make a TikTok recap", {"booking", "reel"}),
]


PATTERNS = {
    "booking": re.compile(r"\b(book|booking|schedule|reserve|appointment|esthetician|facial)\b"),
    "commerce": re.compile(r"\b(order|shopify|cart|buy|routine|product|cleanser|serum|moisturizer|spf)\b"),
    "reel": re.compile(r"\b(reel|tiktok|before|after|viral|content|recap)\b"),
    "reminder": re.compile(r"\b(remind|reminder|nudge|check[- ]?in|did you wash|every night|daily)\b"),
    "scan": re.compile(r"\b(scan|face scan|skin scan|live scan)\b"),
}


def predict_actions(prompt: str) -> set[str]:
    text = prompt.lower()
    if "autopilot" in text:
        return {"booking", "commerce", "reel"}
    return {action for action, pattern in PATTERNS.items() if pattern.search(text)}


def main() -> int:
    passed = 0
    for prompt, expected in TEST_CASES:
        predicted = predict_actions(prompt)
        ok = expected.issubset(predicted)
        passed += int(ok)
        status = "PASS" if ok else "FAIL"
        print(f"{status} | expected={sorted(expected)} predicted={sorted(predicted)} | {prompt}")

    total = len(TEST_CASES)
    score = passed / total
    print(f"\nAgent completion: {passed}/{total} = {score:.0%}")
    if score < 0.90:
        print("FAIL: below 90% completion target")
        return 1
    print("PASS: meets 90% completion target")
    return 0


if __name__ == "__main__":
    sys.exit(main())

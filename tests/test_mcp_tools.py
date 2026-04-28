import os

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("API_TOKEN", "test-token")

from backend.routines import routine_from_concerns


def test_routine_from_concerns_maps_to_shopify_products():
    routine = routine_from_concerns(["dehydration", "texture", "redness"], "Hawaii humid")

    assert "hyaluronic" in routine["morning"]
    assert "PHA" in routine["night"]
    assert "dermatologist" in routine["safety_note"]
    assert any(item["handle"] == "water-resistant-spf" for item in routine["shopify"])


def test_routine_limits_to_supported_concerns():
    concerns = ["dehydration", "texture", "redness", "unknown-concern"]
    routine = routine_from_concerns(concerns, "dry")

    assert "unknown-concern" not in routine["focus"]
    assert len(routine["focus"]) == 3

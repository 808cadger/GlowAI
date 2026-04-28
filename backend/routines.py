"""Pure routine recommendation helpers for GlowAI."""

SUPPORTED_CONCERNS = {
    "acne",
    "redness",
    "dryness",
    "oiliness",
    "dark_spots",
    "uneven_tone",
    "texture",
    "pores",
    "sensitivity",
    "dullness",
    "fine_lines",
    "sun_damage",
    "dehydration",
    "barrier",
    "ingrown_hairs",
}


def routine_from_concerns(concerns: list[str], climate: str) -> dict:
    normalized = [c.lower().replace(" ", "_") for c in concerns[:15]]
    focus = [c for c in normalized if c in SUPPORTED_CONCERNS] or ["dehydration"]
    humid = "humid" in climate.lower() or "hawaii" in climate.lower()
    morning = ["gentle cleanser"]
    night = ["cleanse"]
    shopify = [{"handle": "gentle-cleanser", "title": "Low-pH gentle cleanser"}]

    if "dehydration" in focus or "dryness" in focus or "barrier" in focus:
        morning.append("glycerin or hyaluronic serum")
        night.append("ceramide barrier cream")
        shopify.append({"handle": "barrier-cream", "title": "Ceramide barrier cream"})
    if "oiliness" in focus or "pores" in focus:
        morning.append("light gel moisturizer")
        shopify.append({"handle": "gel-moisturizer", "title": "Humidity-safe gel moisturizer"})
    if "dark_spots" in focus or "uneven_tone" in focus or "dullness" in focus:
        morning.append("vitamin C or niacinamide")
        shopify.append({"handle": "brightening-serum", "title": "Brightening serum"})
    if "texture" in focus or "ingrown_hairs" in focus:
        night.append("PHA exfoliant 1-2 nights weekly")
        shopify.append({"handle": "pha-exfoliant", "title": "Gentle PHA exfoliant"})
    if "redness" in focus or "sensitivity" in focus:
        night.append("calming niacinamide")
        shopify.append({"handle": "calming-serum", "title": "Calming serum"})

    morning.append("water-resistant SPF 30+")
    if humid:
        morning.append("midday blot or SPF reapply")
    shopify.append({"handle": "water-resistant-spf", "title": "Water-resistant SPF 30+"})

    return {
        "focus": focus,
        "morning": ", ".join(morning),
        "night": ", ".join(night),
        "shopify": shopify[:6],
        "safety_note": "Cosmetic wellness guidance only; refer persistent, painful, changing, or suspicious concerns to a dermatologist.",
    }

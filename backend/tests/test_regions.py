"""Tests for Region-Aware Emergency Numbers and Regional Services."""

import pytest
from fastapi.testclient import TestClient

from app.config.regions import (
    DEFAULT_REGION,
    REGIONS_MAP,
    get_emergency_number,
    get_region_info,
)
from app.main import app

client = TestClient(app)


def test_regions_map_contains_verified_regions():
    """Verify that all mapped regions have verified configuration."""
    assert "IN" in REGIONS_MAP
    assert "GB" in REGIONS_MAP
    assert "US" in REGIONS_MAP
    assert "AU" in REGIONS_MAP
    assert "CA" in REGIONS_MAP

    assert REGIONS_MAP["IN"]["emergency_number"] == "112"
    assert REGIONS_MAP["GB"]["emergency_number"] == "999"
    assert REGIONS_MAP["US"]["emergency_number"] == "911"
    assert REGIONS_MAP["AU"]["emergency_number"] == "000"
    assert REGIONS_MAP["CA"]["emergency_number"] == "911"


def test_get_emergency_number_by_region():
    """Test that each region code returns the correct primary emergency number."""
    assert get_emergency_number("IN") == "112"
    assert get_emergency_number("in") == "112"
    assert get_emergency_number("GB") == "999"
    assert get_emergency_number("UK") == "999"  # alias
    assert get_emergency_number("US") == "911"
    assert get_emergency_number("AU") == "000"
    assert get_emergency_number("CA") == "911"


def test_unknown_region_fallback():
    """Test that unknown or empty region codes fall back to default (IN -> 112)."""
    assert get_emergency_number("XX") == "112"
    assert get_emergency_number("UNKNOWN") == "112"
    assert get_emergency_number("") == "112"
    assert get_emergency_number(None) == "112"

    info = get_region_info("INVALID_CODE")
    assert info["country"] == "India"
    assert info["emergency_number"] == "112"


def test_triage_api_returns_emergency_number_and_region():
    """Test that /api/triage returns emergency_number and region fields."""
    payload_in = {
        "age": 30,
        "symptoms": ["headache"],
        "severity": 3,
        "region": "IN",
    }
    res_in = client.post("/api/triage", json=payload_in)
    assert res_in.status_code == 200
    data_in = res_in.json()
    assert data_in["region"] == "IN"
    assert data_in["emergency_number"] == "112"

    payload_gb = {
        "age": 30,
        "symptoms": ["headache"],
        "severity": 3,
        "region": "GB",
    }
    res_gb = client.post("/api/triage", json=payload_gb)
    assert res_gb.status_code == 200
    data_gb = res_gb.json()
    assert data_gb["region"] == "GB"
    assert data_gb["emergency_number"] == "999"

    payload_us = {
        "age": 30,
        "symptoms": ["headache"],
        "severity": 3,
        "region": "US",
    }
    res_us = client.post("/api/triage", json=payload_us)
    assert res_us.status_code == 200
    data_us = res_us.json()
    assert data_us["region"] == "US"
    assert data_us["emergency_number"] == "911"

    payload_unknown = {
        "age": 30,
        "symptoms": ["headache"],
        "severity": 3,
        "region": "UNKNOWN_REGION",
    }
    res_unk = client.post("/api/triage", json=payload_unknown)
    assert res_unk.status_code == 200
    data_unk = res_unk.json()
    assert data_unk["region"] == "IN"
    assert data_unk["emergency_number"] == "112"


def test_no_hardcoded_999_in_user_facing_strings_when_region_is_in():
    """Ensure no user-facing text contains hardcoded 999 when region is India (IN)."""
    emergency_payload = {
        "age": 55,
        "symptoms": ["chest pain"],
        "warning_signs": ["chest_pain"],
        "severity": 10,
        "region": "IN",
    }
    response = client.post("/api/triage", json=emergency_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["emergency_number"] == "112"
    assert data["region"] == "IN"

    # User-facing summary explanation
    explanation = data["explanation"]
    assert "999" not in explanation
    assert "112" in explanation

    # General disclaimer
    disclaimer = data["disclaimer"]
    assert "999" not in disclaimer

    # Verify that backward chaining response does not have hardcoded 999
    next_q_res = client.post(
        "/api/triage/next-question",
        json={"symptoms": ["cough"], "age": 40},
    )
    assert next_q_res.status_code == 200
    q_data = next_q_res.json()
    if q_data.get("relevance"):
        assert "999" not in q_data["relevance"]

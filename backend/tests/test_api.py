from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_list_rules_endpoint():
    response = client.get("/api/rules")
    assert response.status_code == 200
    rules = response.json()
    assert isinstance(rules, list)
    assert len(rules) == 8
    rule_ids = [r["rule_id"] for r in rules]
    assert "R001" in rule_ids
    assert "R008" in rule_ids


def test_triage_emergency_escalation():
    payload = {
        "age": 45,
        "symptoms": ["chest pain", "sweating"],
        "warning_signs": ["chest_pain"],
        "duration_hours": 1.5,
        "severity": 8,
        "medical_history": ["Hypertension"],
        "risk_factors": ["Smoker"],
        "vital_signs": {
            "heart_rate_bpm": 105,
            "systolic_bp": 150,
            "diastolic_bp": 90,
            "oxygen_saturation": 96.0,
        },
        "additional_information": "Central chest tightness radiating to arm.",
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["outcome"] == "emergency_escalation"
    assert data["certainty_score"] == 1.0
    assert "R002" in data["activated_rules"]
    assert data["backward_chaining"]["established"] is True


def test_triage_insufficient_information():
    payload = {
        "age": 25,
        "symptoms": ["mild nasal congestion", "low grade fatigue"],
        "warning_signs": [],
        "duration_hours": 24.0,
        "severity": 2,
        "medical_history": [],
        "risk_factors": [],
        "vital_signs": {},
        "additional_information": None,
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["outcome"] == "insufficient_information"
    assert data["certainty_score"] == 0.0
    assert len(data["activated_rules"]) == 0
    assert data["backward_chaining"]["established"] is False


def test_triage_validation_error_invalid_age():
    payload = {
        "age": -5,  # Invalid: age must be >= 0
        "symptoms": ["fever"],
        "warning_signs": [],
        "severity": 3,
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 422


def test_triage_validation_error_empty_symptoms():
    payload = {
        "age": 30,
        "symptoms": [],  # Invalid: min_length=1
        "warning_signs": [],
        "severity": 3,
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 422

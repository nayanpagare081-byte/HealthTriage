from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.patient import PatientInput
from app.services.triage_service import TriageService
from app.knowledge_base.rules import get_all_rules


app = FastAPI(
    title="Health Triage & Symptom Reasoning System",
    description=(
        "An academic rule-based AI expert system demonstrating "
        "preliminary health triage reasoning."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

triage_service = TriageService()


@app.get("/")
def root():
    return {
        "message": "Health Triage API is running",
        "status": "operational",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/rules")
def list_rules():
    """Return all production rules from the knowledge base."""
    rules = get_all_rules()
    return [
        {
            "rule_id": r.rule_id,
            "description": r.description,
            "conditions": list(r.conditions),
            "conclusion": r.conclusion,
            "certainty_factor": r.certainty_factor,
            "source": r.source,
            "priority": r.priority,
        }
        for r in rules
    ]


@app.post("/api/triage")
def assess_patient(patient: PatientInput):
    return triage_service.assess(patient)

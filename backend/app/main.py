"""FastAPI Application for Rule-Based Health Triage Reasoning."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.knowledge_base.rules import get_all_rules
from app.models.patient import (
    NextQuestionRequest,
    NextQuestionResponse,
    PatientInput,
)
from app.services.triage_service import TriageService

app = FastAPI(
    title="Health Triage & Symptom Reasoning Expert System",
    description=(
        "A production-rule expert system for preliminary health triage and "
        "symptom reasoning using forward and backward chaining with MYCIN certainty factors. "
        "Academic prototype for university AI course. NOT a diagnostic tool."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

triage_service = TriageService()


@app.get("/")
def root():
    return {
        "message": "Health Triage Expert System API is running",
        "status": "operational",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/rules")
def list_rules():
    """Return all production rules from the clinical knowledge base."""
    rules = get_all_rules()
    return [
        {
            "rule_id": r.rule_id,
            "name": r.name,
            "description": r.description,
            "cluster": r.cluster,
            "conditions": list(r.conditions.required_facts or r.conditions),
            "tier": r.tier.value,
            "conclusion": r.conclusion,
            "certainty_factor": r.certainty_factor,
            "override": r.override,
            "source": r.source,
            "explanation_template": r.explanation_template,
            "priority": r.priority,
        }
        for r in rules
    ]


@app.post("/api/triage")
def assess_patient(patient: PatientInput):
    """
    Perform multi-tier production-rule triage reasoning on patient inputs.
    Includes forward and backward chaining traces, certainty scores, and
    rule-by-rule clinical explanations.
    """
    return triage_service.assess(patient)


@app.post("/api/triage/next-question")
def get_next_question(request: NextQuestionRequest):
    """
    Backward-chaining query resolution endpoint.
    Returns the next most discriminative question to ask, or null if the
    active clinical goal is decided.
    """
    return triage_service.get_next_question(request)

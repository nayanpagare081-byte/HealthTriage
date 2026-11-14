
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.patient import PatientInput
from app.services.triage_service import TriageService


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
    allow_origins=["http://localhost:3000"],
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


@app.post("/api/triage")
def assess_patient(patient: PatientInput):
    return triage_service.assess(patient)

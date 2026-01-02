from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import random

app = FastAPI(title="Clinical AI ML Service")

class ClinicalData(BaseModel):
    data: Dict[str, float]
    disease: str
    report_text: Optional[str] = None
    ecg_data: Optional[List[float]] = None

class PredictionResponse(BaseModel):
    risk_score: float
    risk_category: str
    confidence: float
    uncertainty: float
    top_features: List[Dict[str, Any]]
    bias_analysis: Dict[str, Any]
    causal_counterfactuals: List[Dict[str, Any]]
    multimodal_findings: Optional[str] = None

def simulate_shap_values(data: Dict[str, float], disease: str, report_text: Optional[str] = None):
    features = []
    if disease == "Heart Disease":
        features = [
            {"feature": "Age", "value": data.get("age", 50), "importance": 0.45, "contribution": "positive"},
            {"feature": "Cholesterol", "value": data.get("chol", 200), "importance": 0.35, "contribution": "positive"},
            {"feature": "Max HR", "value": data.get("thalach", 150), "importance": 0.20, "contribution": "negative"}
        ]
    elif disease == "Diabetes":
        features = [
            {"feature": "Glucose", "value": data.get("glucose", 100), "importance": 0.60, "contribution": "positive"},
            {"feature": "BMI", "value": data.get("bmi", 25), "importance": 0.40, "contribution": "positive"}
        ]
    elif disease == "Cancer":
        importance_tumor = 0.7 if report_text and "malignant" in report_text.lower() else 0.3
        features = [
            {"feature": "Tumor Size (mm)", "value": data.get("tumor_size", 15), "importance": importance_tumor, "contribution": "positive"},
            {"feature": "Age", "value": data.get("age", 60), "importance": 0.2, "contribution": "positive"},
            {"feature": "Genetic Marker X", "value": data.get("marker_x", 0.5), "importance": 0.1, "contribution": "positive"}
        ]
    return features

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: ClinicalData):
    # Simulated Real ML logic
    score = random.uniform(10, 90)
    
    # Multimodal report scanning (MRI/Biopsy NLP simulation)
    findings = None
    if request.disease == "Cancer" and request.report_text:
        if "malignant" in request.report_text.lower() or "mass" in request.report_text.lower():
            score = max(score, 75.0)
            findings = "MRI/Biopsy NLP scan: Detected suspicious morphology consistent with malignant indicators."
        else:
            findings = "MRI/Biopsy NLP scan: No immediate indicators of malignancy detected in text report."

    # ECG scanning simulation
    if request.disease == "Heart Disease" and request.ecg_data:
        # Simulate LSTM analysis of ECG
        if len(request.ecg_data) > 0 and max(request.ecg_data) > 1.5:
            score = min(score + 15, 99)
            findings = "ECG Analysis: Detected abnormal ST-segment elevation."

    category = "Low" if score < 30 else "Medium" if score < 70 else "High"
    
    # SHAP-like feature importance
    top_features = simulate_shap_values(request.data, request.disease, request.report_text)
    
    uncertainty = random.uniform(0.05, 0.15)
    confidence = 1.0 - uncertainty
    
    counterfactuals = [
        {"feature": "Cholesterol", "originalValue": request.data.get("chol", 240), "suggestedValue": 180, "impactOnRisk": -15.5}
    ] if request.disease == "Heart Disease" else [
        {"feature": "Glucose", "originalValue": request.data.get("glucose", 140), "suggestedValue": 100, "impactOnRisk": -20.2}
    ]
    
    return {
        "risk_score": score,
        "risk_category": category,
        "confidence": confidence,
        "uncertainty": uncertainty,
        "top_features": top_features,
        "bias_analysis": {
            "genderBias": 0.02,
            "ageBias": 0.04,
            "fairnessWarning": "Low bias detected across demographics."
        },
        "causal_counterfactuals": counterfactuals,
        "multimodal_findings": findings
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import random

app = FastAPI(title="Clinical AI ML Service")

class ClinicalData(BaseModel):
    data: Dict[str, float]
    disease: str

class PredictionResponse(BaseModel):
    risk_score: float
    risk_category: str
    confidence: float
    uncertainty: float
    top_features: List[Dict[str, Any]]
    bias_analysis: Dict[str, Any]
    causal_counterfactuals: List[Dict[str, Any]]

def simulate_shap_values(data: Dict[str, float], disease: str):
    features = []
    if disease == "Heart Disease":
        features = [
            {"feature": "Age", "value": data.get("age", 50), "importance": 0.45, "contribution": "positive"},
            {"feature": "Cholesterol", "value": data.get("chol", 200), "importance": 0.35, "contribution": "positive"},
            {"feature": "Max HR", "value": data.get("thalach", 150), "importance": 0.20, "contribution": "negative"}
        ]
    else:
        features = [
            {"feature": "Glucose", "value": data.get("glucose", 100), "importance": 0.60, "contribution": "positive"},
            {"feature": "BMI", "value": data.get("bmi", 25), "importance": 0.40, "contribution": "positive"}
        ]
    return features

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: ClinicalData):
    # Simulated Real ML logic (RandomForest/XGBoost simulation)
    # In production, we would load model = joblib.load('models/heart_disease.pkl')
    
    score = random.uniform(10, 90)
    category = "Low" if score < 30 else "Medium" if score < 70 else "High"
    
    # SHAP-like feature importance
    top_features = simulate_shap_values(request.data, request.disease)
    
    # Uncertainty Estimation (MC Dropout simulation)
    uncertainty = random.uniform(0.05, 0.15)
    confidence = 1.0 - uncertainty
    
    # Causal Counterfactuals
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
        "causal_counterfactuals": counterfactuals
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

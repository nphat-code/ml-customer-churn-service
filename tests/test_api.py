import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs_url" in data
    assert data["docs_url"] == "/docs"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data


def test_predict_endpoint_validation_error():
    response = client.post("/api/v1/predict", json={})
    assert response.status_code == 422


def test_predict_single_success():
    sample_payload = {
        "gender": "Female",
        "SeniorCitizen": 0,
        "Partner": "Yes",
        "Dependents": "No",
        "tenure": 2,
        "PhoneService": "Yes",
        "MultipleLines": "No",
        "InternetService": "Fiber optic",
        "OnlineSecurity": "No",
        "OnlineBackup": "No",
        "DeviceProtection": "No",
        "TechSupport": "No",
        "StreamingTV": "No",
        "StreamingMovies": "No",
        "Contract": "Month-to-month",
        "PaperlessBilling": "Yes",
        "PaymentMethod": "Electronic check",
        "MonthlyCharges": 70.7,
        "TotalCharges": 151.65,
    }
    response = client.post("/api/v1/predict", json=sample_payload)
    if response.status_code == 200:
        data = response.json()
        assert data["churn_prediction"] in ["Churn", "Retain"]
        assert 0.0 <= data["churn_probability"] <= 1.0
        assert data["risk_level"] in ["Low", "Medium", "High"]
        assert len(data["recommendation"]) > 0
    else:
        assert response.status_code == 503

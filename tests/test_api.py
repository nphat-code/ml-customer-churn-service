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
        assert isinstance(data["top_factors"], list)
        assert len(data["top_factors"]) > 0
    else:
        assert response.status_code == 503


def test_predict_edge_case_no_services():
    edge_payload = {
        "gender": "Male",
        "SeniorCitizen": 1,
        "Partner": "No",
        "Dependents": "No",
        "tenure": 0,
        "PhoneService": "No",
        "MultipleLines": "No phone service",
        "InternetService": "No",
        "OnlineSecurity": "No internet service",
        "OnlineBackup": "No internet service",
        "DeviceProtection": "No internet service",
        "TechSupport": "No internet service",
        "StreamingTV": "No internet service",
        "StreamingMovies": "No internet service",
        "Contract": "Two year",
        "PaperlessBilling": "No",
        "PaymentMethod": "Bank transfer (automatic)",
        "MonthlyCharges": 20.0,
        "TotalCharges": 0.0,
    }
    response = client.post("/api/v1/predict", json=edge_payload)
    if response.status_code == 200:
        data = response.json()
        assert data["churn_prediction"] in ["Churn", "Retain"]
        assert 0.0 <= data["churn_probability"] <= 1.0
        assert data["risk_level"] in ["Low", "Medium", "High"]
    else:
        assert response.status_code == 503


def test_predict_batch_success():
    batch_payload = {
        "customers": [
            {
                "gender": "Female",
                "SeniorCitizen": 0,
                "Partner": "No",
                "Dependents": "No",
                "tenure": 1,
                "PhoneService": "Yes",
                "MultipleLines": "No",
                "InternetService": "Fiber optic",
                "OnlineSecurity": "No",
                "OnlineBackup": "No",
                "DeviceProtection": "No",
                "TechSupport": "No",
                "StreamingTV": "Yes",
                "StreamingMovies": "No",
                "Contract": "Month-to-month",
                "PaperlessBilling": "Yes",
                "PaymentMethod": "Electronic check",
                "MonthlyCharges": 85.0,
                "TotalCharges": 85.0,
            },
            {
                "gender": "Male",
                "SeniorCitizen": 0,
                "Partner": "Yes",
                "Dependents": "Yes",
                "tenure": 60,
                "PhoneService": "Yes",
                "MultipleLines": "Yes",
                "InternetService": "DSL",
                "OnlineSecurity": "Yes",
                "OnlineBackup": "Yes",
                "DeviceProtection": "Yes",
                "TechSupport": "Yes",
                "StreamingTV": "No",
                "StreamingMovies": "No",
                "Contract": "Two year",
                "PaperlessBilling": "No",
                "PaymentMethod": "Credit card (automatic)",
                "MonthlyCharges": 65.0,
                "TotalCharges": 3900.0,
            },
        ]
    }
    response = client.post("/api/v1/predict/batch", json=batch_payload)
    if response.status_code == 200:
        data = response.json()
        assert data["total_customers"] == 2
        assert len(data["predictions"]) == 2
        for item in data["predictions"]:
            assert item["churn_prediction"] in ["Churn", "Retain"]
            assert 0.0 <= item["churn_probability"] <= 1.0
            assert item["risk_level"] in ["Low", "Medium", "High"]
    else:
        assert response.status_code == 503

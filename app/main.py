from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    BatchCustomerInput,
    BatchPredictionResponse,
    ChurnPredictionResponse,
    CustomerInput,
    HealthResponse,
)
from app.service import churn_service

app = FastAPI(
    title="Customer Churn Prediction API",
    description="REST API phục vụ dự đoán nguy cơ rời bỏ dịch vụ của khách hàng viễn thông.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Customer Churn Prediction Service",
        "docs_url": "/docs",
        "health_check": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def health_check():
    return HealthResponse(
        status="healthy" if churn_service.is_loaded else "degraded",
        model_loaded=churn_service.is_loaded,
        model_version=churn_service.model_name,
    )


@app.post(
    "/api/v1/predict",
    response_model=ChurnPredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Prediction"],
)
def predict_churn(customer: CustomerInput):
    try:
        return churn_service.predict_single(customer)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )


@app.post(
    "/api/v1/predict/batch",
    response_model=BatchPredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Prediction"],
)
def predict_churn_batch(batch_input: BatchCustomerInput):
    if not churn_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Train and export model pipeline first.",
        )

    predictions = [churn_service.predict_single(cust) for cust in batch_input.customers]
    return BatchPredictionResponse(
        total_customers=len(predictions),
        predictions=predictions,
    )

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class CustomerInput(BaseModel):
    gender: Literal["Male", "Female"] = Field(..., description="Gender of the customer", example="Female")
    SeniorCitizen: int = Field(..., ge=0, le=1, description="Whether the customer is a senior citizen (1, 0)", example=0)
    Partner: Literal["Yes", "No"] = Field(..., description="Whether customer has a partner", example="Yes")
    Dependents: Literal["Yes", "No"] = Field(..., description="Whether customer has dependents", example="No")
    tenure: int = Field(..., ge=0, description="Number of months customer has stayed with company", example=12)
    PhoneService: Literal["Yes", "No"] = Field(..., description="Whether customer has phone service", example="Yes")
    MultipleLines: Literal["No phone service", "No", "Yes"] = Field(..., description="Multiple lines status", example="No")
    InternetService: Literal["DSL", "Fiber optic", "No"] = Field(..., description="Internet service provider", example="Fiber optic")
    OnlineSecurity: Literal["No internet service", "No", "Yes"] = Field(..., description="Online security status", example="No")
    OnlineBackup: Literal["No internet service", "No", "Yes"] = Field(..., description="Online backup status", example="Yes")
    DeviceProtection: Literal["No internet service", "No", "Yes"] = Field(..., description="Device protection status", example="No")
    TechSupport: Literal["No internet service", "No", "Yes"] = Field(..., description="Tech support status", example="No")
    StreamingTV: Literal["No internet service", "No", "Yes"] = Field(..., description="Streaming TV status", example="Yes")
    StreamingMovies: Literal["No internet service", "No", "Yes"] = Field(..., description="Streaming movies status", example="No")
    Contract: Literal["Month-to-month", "One year", "Two year"] = Field(..., description="Contract term of the customer", example="Month-to-month")
    PaperlessBilling: Literal["Yes", "No"] = Field(..., description="Whether customer has paperless billing", example="Yes")
    PaymentMethod: Literal[
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ] = Field(..., description="Payment method", example="Electronic check")
    MonthlyCharges: float = Field(..., ge=0.0, description="Monthly charges amount in USD", example=85.50)
    TotalCharges: float = Field(..., ge=0.0, description="Total charges amount in USD", example=1026.00)


class ChurnPredictionResponse(BaseModel):
    churn_prediction: Literal["Churn", "Retain"] = Field(..., description="Predicted churn status")
    churn_probability: float = Field(..., description="Probability of customer churning [0.0 - 1.0]")
    risk_level: Literal["Low", "Medium", "High"] = Field(..., description="Calculated churn risk tier")
    recommendation: str = Field(..., description="Actionable retention advice based on customer profile")
    model_version: str = Field(..., description="Model version/name used for inference")


class BatchCustomerInput(BaseModel):
    customers: List[CustomerInput] = Field(..., description="List of customers for batch churn prediction")


class BatchPredictionResponse(BaseModel):
    total_customers: int
    predictions: List[ChurnPredictionResponse]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str

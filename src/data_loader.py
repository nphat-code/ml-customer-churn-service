import os
import pandas as pd
from sklearn.model_selection import train_test_split

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "WA_Fn-UseC_-Telco-Customer-Churn.csv")

NUMERICAL_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges"]
CATEGORICAL_FEATURES = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
]
TARGET_COLUMN = "Churn"


def load_raw_data(data_path: str = DATA_PATH) -> pd.DataFrame:
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")
    return pd.read_csv(data_path)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    data = df.copy()

    if "customerID" in data.columns:
        data = data.drop(columns=["customerID"])

    data["TotalCharges"] = pd.to_numeric(data["TotalCharges"].astype(str).str.strip(), errors="coerce")
    data["TotalCharges"] = data["TotalCharges"].fillna(0.0)

    if TARGET_COLUMN in data.columns:
        data[TARGET_COLUMN] = data[TARGET_COLUMN].map({"Yes": 1, "No": 0})

    return data


def get_train_test_data(test_size: float = 0.2, random_state: int = 42):
    raw_df = load_raw_data()
    cleaned_df = clean_data(raw_df)

    X = cleaned_df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = cleaned_df[TARGET_COLUMN]

    return train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

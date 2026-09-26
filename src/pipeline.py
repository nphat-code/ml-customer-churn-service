from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from src.data_loader import CATEGORICAL_FEATURES, NUMERICAL_FEATURES


def build_preprocessor() -> ColumnTransformer:
    numerical_transformer = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numerical_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ]
    )


def build_full_pipeline(estimator) -> Pipeline:
    preprocessor = build_preprocessor()
    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", estimator),
        ]
    )

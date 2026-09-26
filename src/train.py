import json
import os
import joblib
from lightgbm import LGBMClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from xgboost import XGBClassifier

from src.data_loader import get_train_test_data
from src.pipeline import build_full_pipeline

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
DOCS_DIR = os.path.join(os.path.dirname(__file__), "..", "docs")


def train_and_evaluate():
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(DOCS_DIR, exist_ok=True)

    X_train, X_test, y_train, y_test = get_train_test_data()

    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000, class_weight="balanced", random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=150,
            max_depth=8,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=150,
            max_depth=4,
            learning_rate=0.05,
            scale_pos_weight=(len(y_train) - sum(y_train)) / sum(y_train),
            random_state=42,
            eval_metric="logloss",
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=150,
            max_depth=5,
            learning_rate=0.05,
            class_weight="balanced",
            random_state=42,
            verbose=-1,
        ),
    }

    results = []
    trained_pipelines = {}

    for name, estimator in models.items():
        pipeline = build_full_pipeline(estimator)
        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred).tolist()

        metrics = {
            "model_name": name,
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm,
        }
        results.append(metrics)
        trained_pipelines[name] = pipeline

    results_sorted = sorted(results, key=lambda x: x["roc_auc"], reverse=True)
    best_candidate_name = results_sorted[0]["model_name"]
    best_pipeline = trained_pipelines[best_candidate_name]

    model_save_path = os.path.join(MODEL_DIR, "best_churn_pipeline.joblib")
    joblib.dump(best_pipeline, model_save_path)

    benchmark_file = os.path.join(DOCS_DIR, "model_benchmark.json")
    with open(benchmark_file, "w", encoding="utf-8") as f:
        json.dump(
            {
                "best_model": best_candidate_name,
                "benchmark_results": results_sorted,
            },
            f,
            indent=2,
            ensure_ascii=False,
        )

    return best_candidate_name, results_sorted


if __name__ == "__main__":
    train_and_evaluate()

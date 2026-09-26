import os
import joblib
import pandas as pd
from app.schemas import CustomerInput, ChurnPredictionResponse

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "best_churn_pipeline.joblib")


class ChurnModelService:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.pipeline = None
        self.model_name = "Best Churn Pipeline v1.0.0"
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            self.pipeline = joblib.load(self.model_path)

    @property
    def is_loaded(self) -> bool:
        return self.pipeline is not None

    def _generate_recommendation(self, input_data: CustomerInput, churn_prob: float) -> str:
        recs = []
        if churn_prob < 0.35:
            return "Khách hàng có độ gắn bó tốt. Tiếp tục duy trì chất lượng dịch vụ và ưu đãi tri ân định kỳ."

        if input_data.Contract == "Month-to-month":
            recs.append("Đề xuất gói hợp đồng 1 năm hoặc 2 năm kèm ưu đãi giảm giá cước 10-15%")
        if input_data.TechSupport == "No":
            recs.append("Tặng miễn phí 3 tháng gói Hỗ trợ Kỹ thuật 24/7 (Tech Support)")
        if input_data.OnlineSecurity == "No":
            recs.append("Tư vấn tích hợp gói Bảo mật Trực tuyến (Online Security)")
        if input_data.PaymentMethod == "Electronic check":
            recs.append("Khuyến khích chuyển sang phương thức thanh toán tự động (Credit Card / Bank Transfer)")
        if input_data.tenure < 6:
            recs.append("Khách hàng mới: Cần nhân viên CSKH liên hệ chủ động lắng nghe trải nghiệm dịch vụ")

        if not recs:
            recs.append("Liên hệ trực tiếp để khảo sát mức độ hài lòng và lắng nghe ý kiến đóng góp")

        return "; ".join(recs) + "."

    def predict_single(self, input_data: CustomerInput) -> ChurnPredictionResponse:
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Please train and export model pipeline first.")

        df_row = pd.DataFrame([input_data.model_dump()])

        churn_prob = float(self.pipeline.predict_proba(df_row)[0, 1])
        prediction_label = "Churn" if churn_prob >= 0.50 else "Retain"

        if churn_prob >= 0.65:
            risk_level = "High"
        elif churn_prob >= 0.35:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        recommendation = self._generate_recommendation(input_data, churn_prob)

        return ChurnPredictionResponse(
            churn_prediction=prediction_label,
            churn_probability=round(churn_prob, 4),
            risk_level=risk_level,
            recommendation=recommendation,
            model_version=self.model_name,
        )


churn_service = ChurnModelService()

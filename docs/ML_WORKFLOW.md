# 🔄 Quy Trình Xây Dựng Hệ Thống Machine Learning (End-to-End)

Tài liệu này tóm tắt 7 bước xây dựng một hệ thống ML chuẩn thực tế, ánh xạ trực tiếp vào cấu trúc và các thành phần của project **Customer Churn Prediction Service**.

---

## Bước 1: Xác định bài toán & Chỉ số đánh giá (Problem Framing & Metrics)
- **Bài toán:** Phân loại nhị phân (*Binary Classification*) dự đoán khách hàng viễn thông có rời bỏ dịch vụ (`Churn`) hay không.
- **Lựa chọn Metric:** Vì dữ liệu mất cân bằng lớp (*imbalanced*), không dùng đơn thuần Accuracy mà ưu tiên:
  - **ROC-AUC:** Đánh giá khả năng phân tách tổng thể giữa hai lớp trên mọi ngưỡng xác suất.
  - **Recall:** Tối đa hóa việc phát hiện khách hàng có nguy cơ rời bỏ để kịp thời can thiệp giữ chân.
- **Tài liệu liên quan:** `docs/MODEL_REPORT.md`, `docs/PLAN.md`

---

## Bước 2: Thu thập & Khám phá dữ liệu (Data Collection & EDA)
- **Dữ liệu:** Tập Kaggle Telco Customer Churn (7,043 dòng, 21 cột) tại `data/WA_Fn-UseC_-Telco-Customer-Churn.csv`.
- **EDA (Exploratory Data Analysis):**
  - Kiểm tra kiểu dữ liệu và giá trị thiếu (`TotalCharges` chứa chuỗi rỗng với khách hàng mới `tenure = 0`).
  - Phân tích phân phối mất cân bằng của biến mục tiêu `Churn`.
  - Khảo sát tương quan giữa các đặc trưng quan trọng (`tenure`, `MonthlyCharges`, `Contract`) với tỷ lệ rời bỏ.
- **Thư mục thực nghiệm:** `notebooks/`

---

## Bước 3: Tiền xử lý & Đóng gói Pipeline (Data Preprocessing & Pipeline)
- **Làm sạch & Chia tập:**
  - Ép kiểu `TotalCharges` về dạng số, điền `0.0` cho khách hàng mới (`tenure = 0`).
  - Chia train/test theo tỷ lệ 80/20 có phân tầng (*Stratified split*) để giữ nguyên tỷ lệ nhãn `Churn` (`src/data_loader.py`).
- **Feature Engineering & Transform:**
  - Dùng `ColumnTransformer` đóng gói chung với mô hình thành một pipeline duy nhất nhằm tránh **Data Leakage** giữa train và inference (`src/pipeline.py`):
    - Biến số (`tenure`, `MonthlyCharges`, `TotalCharges`): `StandardScaler`.
    - Biến phân loại (16 cột): `OneHotEncoder(handle_unknown="ignore", sparse_output=False)`.

---

## Bước 4: Huấn luyện, So sánh & Tinh chỉnh mô hình (Training & Evaluation)
- **Thử nghiệm đa mô hình:** Train và benchmark 4 thuật toán: *Logistic Regression*, *Random Forest*, *XGBoost*, *LightGBM* (`src/train.py`).
- **Xử lý mất cân bằng lớp:** Áp dụng `scale_pos_weight` cho XGBoost và `class_weight="balanced"` cho các mô hình còn lại.
- **Đóng gói mô hình tốt nhất:**
  - Lưu trọn vẹn `Pipeline(preprocessor + model)` ra file `models/best_churn_pipeline.joblib`.
  - Xuất kết quả benchmark ra `docs/model_benchmark.json` (XGBoost đạt ROC-AUC = 0.8435, Recall = 0.8021).

---

## Bước 5: Đóng gói thành Dịch vụ API (Model Serving)
Đưa mô hình từ môi trường thử nghiệm lên dịch vụ REST API độc lập:
- **Validate Input/Output:** Định nghĩa Pydantic schemas kiểm soát chặt chẽ kiểu dữ liệu trong `app/schemas.py`.
- **Inference & Business Logic:** Load `.joblib` một lần khi khởi động, tính xác suất `Churn`, phân tầng rủi ro (*Low / Medium / High*) và trả về khuyến nghị giữ chân khách hàng trong `app/service.py`.
- **Endpoints:** `GET /`, `GET /health`, `POST /api/v1/predict` trong `app/main.py` (đặc tả chi tiết tại `docs/API_SPEC.md`).

---

## Bước 6: Kiểm thử tự động (Testing & Validation)
- Xây dựng bộ kiểm thử tự động bằng `pytest` (`tests/test_api.py`, `tests/conftest.py`) để đảm bảo độ tin cậy của API:
  - Kiểm tra endpoint `GET /` và `GET /health` (model đã load sẵn sàng).
  - Kiểm tra validate input sai định dạng trả về HTTP `422 Unprocessable Entity`.
  - Kiểm tra luồng dự đoán thành công trả về HTTP `200 OK` đúng cấu trúc JSON.

---

## Bước 7: Giao diện Demo, Đóng gói & Tài liệu (UI, Deployment & Docs)
- **Demo UI:** Xây dựng ứng dụng **Streamlit** kết nối trực tiếp tới `POST /api/v1/predict` để người dùng nhập liệu và xem kết quả trực quan.
- **Đóng gói (Tùy chọn):** Sử dụng Docker / `docker-compose` để chạy đồng thời FastAPI backend và Streamlit frontend.
- **Tài liệu chuyên sâu:** Duy trì các phân tích toán học và kiến trúc cốt lõi trong `docs/NOTES.md`, kịch bản thuyết trình trong `docs/PRESENTATION_NOTES.md`.

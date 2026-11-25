# 📋 Kế Hoạch & Tiến Trình Dự Án

## Đề tài: Customer Churn Prediction Service

> **Mô tả:** Xây dựng pipeline ML dự đoán khách hàng rời bỏ dịch vụ viễn thông, triển khai dưới dạng REST API chuẩn công nghiệp với FastAPI.

---

## 🗺️ Tổng quan các Phase & Yêu cầu môn học (`note.txt`)

### Đối chiếu 3 Hợp phần Project (Tỷ trọng 50% điểm số):
| Hợp phần theo `note.txt` | Yêu cầu chi tiết | Trạng thái thực tế | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :--- |
| **Project 1: Backend REST API** | • Model as a Service (Python, No UI)<br>• Input: Sample JSON; Output: Result JSON | **✅ Hoàn thành** | FastAPI, Pydantic schemas, Health check, `/api/v1/predict`, `/api/v1/predict/batch`, CORS |
| **Project 2: Frontend / Demo UI** | • Ứng dụng web demo tương tác gọi API<br>• Định hướng sản phẩm nổi bật chuẩn SaaS | **✅ Hoàn thành** | **React (Vite + TypeScript + Tailwind CSS + Recharts)**: Preset Profiles, What-If Simulator, Batch CSV Dashboard, XAI |
| **Project 3: Jupyter Notebooks** | • Notebooks chuẩn cấu trúc dự án ML<br>• Lưu lại toàn bộ các thử nghiệm (*experiments*) | **✅ Hoàn thành** | `notebooks/customer_churn_experiments.ipynb`, 5 biểu đồ trong `docs/images/`, `docs/EXPERIMENTS.md`, `docs/model_benchmark.json` |

---

## 📌 Tổng hợp công việc: ĐÃ LÀM vs CẦN LÀM

### 1. Những việc ĐÃ LÀM (Completed) ✅

* **Khởi tạo & Kiến trúc dự án:**
  - [x] Thiết lập cấu trúc thư mục chuẩn công nghiệp: `src/`, `app/`, `data/`, `models/`, `notebooks/`, `docs/`, `tests/`.
  - [x] Cấu hình file môi trường và phụ thuộc `requirements.txt` (FastAPI, XGBoost, Scikit-Learn, LightGBM, v.v.).
  - [x] Quy chuẩn quy tắc dự án trong `AGENTS.md` (không comment thừa, tuân thủ git flow, ghi chép kiến thức chuyên sâu).

* **Dữ liệu & Tiền xử lý (Data Pipeline):**
  - [x] Thu thập và chuẩn hóa tập dữ liệu viễn thông Kaggle Telco Customer Churn (7,043 dòng, 21 cột).
  - [x] Xử lý missing values: ép kiểu `TotalCharges` về dạng số và gán giá trị $0.0$ cho khách hàng mới (`tenure = 0`).
  - [x] Xây dựng `ColumnTransformer` tích hợp:
    - `StandardScaler` cho biến số (`tenure`, `MonthlyCharges`, `TotalCharges`).
    - `OneHotEncoder` cho 16 biến phân loại (với `handle_unknown="ignore"`, `sparse_output=False`).
  - [x] Phân chia tập dữ liệu chuẩn hóa: Stratified 80/20 giữ nguyên tỷ lệ nhãn Churn/Retain.

* **Huấn luyện, So sánh & Serialize Mô hình:**
  - [x] Xây dựng pipeline thử nghiệm và so sánh tự động 4 thuật toán: Logistic Regression, Random Forest, XGBoost, LightGBM.
  - [x] Xử lý mất cân bằng dữ liệu: áp dụng `scale_pos_weight` cho XGBoost và `class_weight="balanced"` cho các mô hình còn lại.
  - [x] Đánh giá toàn diện các chỉ số (Accuracy, Precision, Recall, F1, ROC-AUC).
  - [x] Lựa chọn mô hình tối ưu: **XGBoost** với **ROC-AUC = 0.8435**, **Recall = 0.8021** (phát hiện trên 80% khách hàng có ý định rời bỏ).
  - [x] Đóng gói trọn vẹn Preprocessing + Model thành 1 file duy nhất `models/best_churn_pipeline.joblib`.
  - [x] Xuất kết quả benchmark chuẩn hóa ra `docs/model_benchmark.json`.

* **Xây dựng REST API Service (Project 1 - FastAPI):**
  - [x] Định nghĩa schema Pydantic kiểm soát chặt chẽ kiểu dữ liệu đầu vào và đầu ra (`app/schemas.py`).
  - [x] Tích hợp logic phân tầng rủi ro (Low / Medium / High) và công cụ khuyến nghị can thiệp theo luật nghiệp vụ (`app/service.py`).
  - [x] Xây dựng các endpoints chuẩn REST:
    - `GET /`: Metadata dịch vụ.
    - `GET /health`: Kiểm tra trạng thái hoạt động và load model.
    - `POST /api/v1/predict`: Dự đoán thời gian thực cho một khách hàng.
  - [x] Tích hợp tự động Swagger UI (`/docs`) và Redoc (`/redoc`).

* **Kiểm thử tự động (Testing):**
  - [x] Xây dựng bộ test API tự động với `pytest` và `httpx.AsyncClient` / `TestClient` (`tests/test_api.py`).
  - [x] Kiểm thử 4/4 kịch bản passed (root endpoint, health check, validation error 422, và predict success 200).

* **Tài liệu học thuật & Kỹ thuật (Documentation):**
  - [x] `docs/API_SPEC.md`: Đặc tả chi tiết các endpoint API, input/output JSON schemas.
  - [x] `docs/MODEL_REPORT.md`: Báo cáo kỹ thuật về mô hình, phân tích dữ liệu và trade-offs.
  - [x] `docs/NOTES.md`: Tài liệu chuyên sâu về toán học ML (chứng minh StandardScaler, bản chất trực giao One-Hot, cơ chế GLM / Logit / Sigmoid / BCE / L-BFGS của Logistic Regression).
  - [x] `docs/PRESENTATION_NOTES.md`: Kịch bản thuyết trình và bộ câu hỏi phản biện bảo vệ đồ án.

* **Jupyter Notebooks & Trực quan hóa thực nghiệm (Project 3):**
  - [x] Hoàn thiện `notebooks/customer_churn_experiments.ipynb` gồm: EDA & khám phá dữ liệu, minh họa tiền xử lý (`StandardScaler`, `OneHotEncoder`), so sánh 4 mô hình, ROC Curves, Confusion Matrix & Feature Importance.
  - [x] Xuất 5 biểu đồ phân tích ra `docs/images/` và ghi chép phân tích tại `docs/FIGURES_ANALYSIS.md`, `docs/ML_WORKFLOW.md`, `docs/EXPERIMENTS.md`.
  - [x] Cập nhật Pydantic schemas (`json_schema_extra`) và đồng bộ số liệu `docs/MODEL_REPORT.md` với `docs/model_benchmark.json`.

---

### 2. Những việc CẦN LÀM (To-Do) 🔲

#### 🎯 Nhóm nhiệm vụ bắt buộc theo `note.txt` (Project 2 — Standout Web Product):

1. **Xây dựng Frontend Web App chuẩn SaaS (`frontend/`) bằng React (Vite + TypeScript + Tailwind CSS + Recharts):**
   - [ ] Khởi tạo project `frontend/` với Vite, React, TypeScript, Tailwind CSS, Recharts và Lucide Icons.
   - [ ] **Preset Profiles (1-click Demo):** Tạo 3–4 hồ sơ khách hàng mẫu (nguy cơ cao, trung bình, trung thành) để kiểm thử nhanh.
   - [ ] **Single Prediction & What-If Simulator:** Form nhập liệu trực quan + chế độ mô phỏng thay đổi hợp đồng/dịch vụ (`Contract`, `TechSupport`, `OnlineSecurity`, `tenure`, `MonthlyCharges`) để so sánh xác suất Churn trước và sau can thiệp.
   - [ ] **Batch Prediction & CSV Dashboard:** Upload file CSV hoặc chạy mẫu hàng loạt qua `POST /api/v1/predict/batch`, hiển thị biểu đồ phân bố rủi ro (Low / Medium / High) và danh sách khách hàng cần ưu tiên giữ chân.
   - [ ] **Explainable AI (XAI) & System Health:** Tích hợp thanh trạng thái API (`/health`, model version) và hiển thị các yếu tố chính ảnh hưởng đến dự đoán của từng khách hàng.

#### 🛠️ Nhóm nhiệm vụ hoàn thiện & đóng gói:
2. **Mở rộng nhẹ Backend (nếu cần cho XAI):** Bổ sung thông tin feature contribution / SHAP top factors trong response dự đoán để UI giải thích trực quan lý do Churn.
3. **Đồng bộ tài liệu & Kiểm thử:** Cập nhật `README.md`, `docs/DEVLOG.md` sau khi hoàn thành `frontend/` và chạy lại `pytest`.
4. **Đóng gói Docker (Tùy chọn nâng cao):** Viết `Dockerfile` và `docker-compose.yml` để chạy đồng thời FastAPI backend và React frontend.

---

## 📅 Lịch sử Commit

| Thời gian | Hash | Message |
| :--- | :---: | :--- |
| 2026-10-03 | `f0e7cc7` | `docs: enrich mathematical theory and optimization details for Logistic Regression` |
| 2026-10-03 | `ccdb5fa` | `docs: enrich OneHotEncoder mathematical principles and concatenation mechanism in NOTES.md` |
| 2026-10-03 | `1cf59c6` | `docs: add presentation guide and defense QA notes` |
| 2026-10-03 | `0834d39` | `docs: add mathematical proof for standardized mean and variance in NOTES.md` |
| 2026-10-03 | `3a5df0b` | `docs: add mathematical formulas for mean, standard deviation, and z-score to NOTES.md` |
| 2026-10-03 | `6c59925` | `docs: add rule for documentation standards and remove trivial notes` |
| 2026-09-27 | `cd1340a` | `docs: add benchmark results and httpx test dependency` |
| 2026-09-26 | `8484552` | `feat: setup project rules, ml pipeline, and fastapi service structure` |
| 2026-09-26 | `9e1e997` | `feat: initialize customer churn prediction ML project structure and docs` |

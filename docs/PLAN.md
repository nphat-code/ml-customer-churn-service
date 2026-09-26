# 📋 Kế Hoạch & Tiến Trình Dự Án

## Đề tài: Customer Churn Prediction Service

> **Mô tả:** Xây dựng pipeline ML dự đoán khách hàng rời bỏ dịch vụ viễn thông, triển khai dưới dạng REST API chuẩn công nghiệp với FastAPI.

---

## 🗺️ Tổng quan các Phase

| Phase | Tên | Trạng thái |
| :---: | :--- | :---: |
| 1 | Khởi tạo dự án & Cấu trúc thư mục | ✅ Hoàn thành |
| 2 | Dữ liệu & Tiền xử lý (Data Pipeline) | ✅ Hoàn thành |
| 3 | Huấn luyện & Đánh giá mô hình | ✅ Hoàn thành |
| 4 | REST API Service (FastAPI) | ✅ Hoàn thành |
| 5 | Kiểm thử tự động (Testing) | ✅ Hoàn thành |
| 6 | Tài liệu kỹ thuật (Documentation) | ✅ Hoàn thành |
| 7 | Nâng cao & Mở rộng (Optional) | 🔲 Chưa thực hiện |

---

## Phase 1: Khởi tạo dự án & Cấu trúc thư mục ✅

- [x] Tạo cấu trúc thư mục chuẩn (`src/`, `app/`, `data/`, `models/`, `notebooks/`, `docs/`, `tests/`)
- [x] Cấu hình `.gitignore` (loại bỏ `venv/`, `__pycache__/`, `*.joblib`, `data/*.csv`)
- [x] Viết `requirements.txt` đầy đủ các thư viện
- [x] Viết `README.md` tổng quan dự án
- [x] Thiết lập `AGENTS.md` (quy tắc code, quy trình git)
- [x] Khởi tạo Git repository, push lên GitHub

**Commit liên quan:**
- `9e1e997` — `feat: initialize customer churn prediction ML project structure and docs`

---

## Phase 2: Dữ liệu & Tiền xử lý (Data Pipeline) ✅

- [x] Thu thập dữ liệu Kaggle Telco Customer Churn (~7,043 mẫu, 21 features)
- [x] Module `src/data_loader.py`: Đọc CSV, xử lý `TotalCharges` (string → float, điền missing), chia train/test (80/20, stratified)
- [x] Module `src/pipeline.py`: Xây dựng `ColumnTransformer` kết hợp `StandardScaler` (biến số) + `OneHotEncoder` (biến phân loại)
- [x] Xử lý mất cân bằng lớp qua `scale_pos_weight` trong XGBoost

**Commit liên quan:**
- `8484552` — `feat: setup project rules, ml pipeline, and fastapi service structure`

---

## Phase 3: Huấn luyện & Đánh giá mô hình ✅

- [x] Module `src/train.py`: Script huấn luyện tự động, so sánh 4 thuật toán
- [x] Benchmark 4 mô hình: Logistic Regression, Random Forest, XGBoost, LightGBM
- [x] Chọn mô hình tối ưu dựa trên ROC-AUC + Recall
- [x] Serialize pipeline tối ưu → `models/best_churn_pipeline.joblib`
- [x] Xuất kết quả benchmark → `docs/model_benchmark.json`

**Kết quả Benchmark:**

| Mô hình | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Best)** | **0.7580** | **0.5291** | **0.8021** | **0.6376** | **0.8435** |
| Random Forest | 0.7601 | 0.5331 | 0.7754 | 0.6318 | 0.8414 |
| LightGBM | 0.7580 | 0.5299 | 0.7807 | 0.6314 | 0.8414 |
| Logistic Regression | 0.7381 | 0.5043 | 0.7834 | 0.6136 | 0.8415 |

**Mô hình được chọn:** XGBoost — ROC-AUC cao nhất (0.8435), Recall tốt nhất (0.8021) giúp giảm thiểu bỏ sót khách hàng có ý định rời bỏ.

**Commit liên quan:**
- `8484552` — `feat: setup project rules, ml pipeline, and fastapi service structure`
- `cd1340a` — `docs: add benchmark results and httpx test dependency`

---

## Phase 4: REST API Service (FastAPI) ✅

- [x] `app/schemas.py`: Định nghĩa Pydantic schemas validate input (19 features) + output (prediction, probability, risk_level, recommendation)
- [x] `app/service.py`: Logic load model từ joblib, inference pipeline, phân tầng rủi ro (Low/Medium/High), sinh khuyến nghị can thiệp tự động
- [x] `app/main.py`: Khai báo routes (`GET /`, `GET /health`, `POST /api/v1/predict`), lifespan event load model khi khởi động
- [x] Swagger UI tự động tại `/docs`

**Endpoints đã triển khai:**

| Method | Path | Mô tả |
| :---: | :--- | :--- |
| `GET` | `/` | Thông tin dịch vụ |
| `GET` | `/health` | Health check + trạng thái model |
| `POST` | `/api/v1/predict` | Dự đoán churn cho 1 khách hàng |

**Commit liên quan:**
- `8484552` — `feat: setup project rules, ml pipeline, and fastapi service structure`

---

## Phase 5: Kiểm thử tự động (Testing) ✅

- [x] `tests/test_api.py`: 4 test cases sử dụng `FastAPI TestClient`
  - [x] `test_root` — kiểm tra endpoint root trả về đúng format
  - [x] `test_health` — kiểm tra health check có trường `status` và `model_loaded`
  - [x] `test_predict_endpoint_validation_error` — gửi payload rỗng nhận 422
  - [x] `test_predict_single_success` — gửi payload hợp lệ, kiểm tra prediction/probability/risk_level
- [x] Kết quả: **4/4 tests passed** ✅

**Commit liên quan:**
- `8484552` — `feat: setup project rules, ml pipeline, and fastapi service structure`

---

## Phase 6: Tài liệu kỹ thuật (Documentation) ✅

- [x] `README.md`: Hướng dẫn cài đặt, chạy thử, cấu trúc thư mục
- [x] `docs/MODEL_REPORT.md`: Báo cáo kỹ thuật mô hình (bài toán, dữ liệu, benchmark, XAI, pipeline)
- [x] `docs/API_SPEC.md`: Đặc tả endpoint, request/response format, error codes
- [x] `docs/model_benchmark.json`: Kết quả benchmark dạng JSON có cấu trúc
- [x] `docs/PLAN.md`: File kế hoạch và tiến trình dự án (file này)

**Commit liên quan:**
- `9e1e997` — `feat: initialize customer churn prediction ML project structure and docs`
- `cd1340a` — `docs: add benchmark results and httpx test dependency`

---

## Phase 7: Nâng cao & Mở rộng (Optional) 🔲

- [ ] **Jupyter Notebooks minh họa:**
  - [ ] `notebooks/01_eda.ipynb` — Khám phá dữ liệu, trực quan hóa phân phối, tương quan
  - [ ] `notebooks/02_model_training.ipynb` — Huấn luyện, so sánh mô hình có visualization
- [ ] **Explainable AI (XAI) API:**
  - [ ] Tích hợp SHAP values vào response của `/api/v1/predict`
  - [ ] Endpoint `GET /api/v1/explain/{customer_id}` trả về SHAP force plot
- [ ] **Batch Prediction:**
  - [ ] Hoàn thiện endpoint `POST /api/v1/predict/batch` cho dự đoán hàng loạt
- [ ] **Container hóa (Docker):**
  - [ ] Viết `Dockerfile` multi-stage build
  - [ ] Viết `docker-compose.yml`
- [ ] **CI/CD:**
  - [ ] GitHub Actions workflow chạy test tự động khi push
- [ ] **Cải thiện mô hình:**
  - [ ] Hyperparameter tuning với Optuna/GridSearchCV
  - [ ] Thử nghiệm thêm CatBoost, SVM
  - [ ] Feature engineering nâng cao (interaction features, binning)

---

## 📅 Lịch sử Commit

| Thời gian | Hash | Message |
| :--- | :---: | :--- |
| 2026-09-26 13:18 | `9e1e997` | `feat: initialize customer churn prediction ML project structure and docs` |
| 2026-09-26 14:52 | `8484552` | `feat: setup project rules, ml pipeline, and fastapi service structure` |
| 2026-09-27 05:06 | `cd1340a` | `docs: add benchmark results and httpx test dependency` |

---

## ⚠️ Vấn đề đã phát hiện & Ghi chú

1. **Pydantic deprecation warnings (20 warnings):** `schemas.py` dùng `example=` trong `Field()` — cần chuyển sang `json_schema_extra` hoặc `examples=[]` để tương thích Pydantic V3.
2. **MODEL_REPORT.md chưa cập nhật benchmark:** Bảng benchmark trong file vẫn còn giá trị `TBD`, cần đồng bộ với `model_benchmark.json`.
3. **Thiếu `httpx` trong requirements.txt ban đầu:** Đã bổ sung để `FastAPI TestClient` hoạt động.
4. **Notebooks trống:** Thư mục `notebooks/` chỉ có `.gitkeep`, chưa có notebook EDA và training.

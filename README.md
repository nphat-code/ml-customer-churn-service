# 📊 Customer Churn Prediction Service

> **Đồ án môn học Machine Learning (Học máy)**  
> Huấn luyện mô hình dự đoán tỷ lệ rời bỏ của khách hàng viễn thông và triển khai dưới dạng dịch vụ REST API độc lập.

---

## 🚀 Tính năng chính

- **Machine Learning Pipeline bài bản:** Tiền xử lý dữ liệu, mã hóa biến định danh, chuẩn hóa dữ liệu, giải quyết mất cân bằng lớp và so sánh đa mô hình (*Logistic Regression, Random Forest, XGBoost, LightGBM*).
- **Explainable AI (XAI):** Tích hợp giải thích dự đoán theo từng khách hàng bằng TreeSHAP native của XGBoost (`top_factors`) và Feature Importance.
- **REST API chuẩn công nghiệp:** Xây dựng bằng **FastAPI** (`/api/v1/predict`, `/api/v1/predict/batch`, `/health`), tự động validate dữ liệu với **Pydantic** và sinh Swagger UI tương tác.
- **Frontend SaaS Dashboard:** Xây dựng bằng **React + Vite + TypeScript + Tailwind CSS + Recharts** (`frontend/`), hỗ trợ Preset Profiles, What-If Simulator, Batch CSV Analytics và biểu đồ SHAP.
- **Tài liệu & Đóng gói hoàn chỉnh:** Báo cáo kỹ thuật mô hình (`docs/MODEL_REPORT.md`), đặc tả API (`docs/API_SPEC.md`), notebook thực nghiệm (`notebooks/customer_churn_experiments.ipynb`) và `docker-compose.yml`.

---

## 📁 Cấu trúc thư mục

```text
Project/
├── app/                                 # Mã nguồn REST API Service (FastAPI)
│   ├── __init__.py
│   ├── main.py                          # Entry point FastAPI, routes, CORS
│   ├── schemas.py                       # Pydantic schemas validate input/output & XAI
│   └── service.py                       # Inference, phân tầng rủi ro & TreeSHAP XAI
├── frontend/                            # Frontend SaaS Dashboard (React + Vite + TS)
│   ├── src/
│   │   ├── components/                  # SinglePredictor, BatchDashboard, RiskGauge, XaiFactorsChart
│   │   ├── data/presets.ts              # 4 hồ sơ khách hàng mẫu 1-click & dữ liệu batch mẫu
│   │   ├── services/api.ts              # Typed API client kết nối FastAPI
│   │   └── types/churn.ts               # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── data/                                # Dữ liệu huấn luyện (Kaggle dataset)
├── docs/                                # Tài liệu kỹ thuật, phân tích & nhật ký
│   ├── images/                          # 5 biểu đồ EDA & đánh giá mô hình
│   ├── API_SPEC.md                      # Đặc tả các endpoint của REST API
│   ├── DEVLOG.md                        # Nhật ký phát triển dự án
│   ├── EXPERIMENTS.md                   # Lưu vết thực nghiệm các mô hình
│   ├── MODEL_REPORT.md                  # Báo cáo mô hình (Kiến trúc, metrics, XAI)
│   ├── NOTES.md                         # Ghi chép chuyên sâu toán học & thuật toán ML
│   └── PLAN.md                          # Kế hoạch và tiến độ dự án
├── models/                              # Lưu trữ file mô hình đã huấn luyện (.joblib)
│   └── best_churn_pipeline.joblib
├── notebooks/                           # Jupyter Notebooks thực nghiệm
│   └── customer_churn_experiments.ipynb # EDA, tiền xử lý, huấn luyện & trực quan hóa
├── src/                                 # Source code pipeline dùng chung
│   ├── __init__.py
│   ├── data_loader.py                   # Đọc và chia tập train/test
│   ├── pipeline.py                      # Tiền xử lý và đóng gói Scikit-Learn Pipeline
│   └── train.py                         # Huấn luyện, đánh giá và xuất model
├── tests/                               # Kiểm thử tự động với pytest
│   └── test_api.py
├── Dockerfile                           # Docker image cho Backend FastAPI
├── docker-compose.yml                   # Khởi chạy đồng thời Backend & Frontend
├── requirements.txt                     # Các thư viện Python phụ thuộc
└── README.md                            # Hướng dẫn tổng quan dự án
```

---

## 🛠️ Cài đặt & Chạy thử nghiệm

### 1. Khởi tạo môi trường ảo
```bash
python -m venv venv
# Trên Windows PowerShell:
.\venv\Scripts\Activate.ps1
```

### 2. Cài đặt các thư viện
```bash
pip install -r requirements.txt
```

### 3. Huấn luyện mô hình
Chạy notebook trong `notebooks/02_model_training.ipynb` hoặc script `src/train.py` để xuất mô hình tốt nhất vào thư mục `models/best_churn_pipeline.joblib`.

### 4. Khởi chạy REST API Service
```bash
py -3.10 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Khởi chạy Frontend SaaS Dashboard (React)
```bash
cd frontend
npm install
npm run dev
```
Truy cập giao diện tại **`http://localhost:5173`** (hoặc Swagger UI tại **`http://localhost:8000/docs`**).

### 6. Hoặc chạy đồng thời bằng Docker Compose
```bash
docker compose up --build
```

---

## 👥 Nhóm tác giả & Thông tin môn học
* **Môn học:** Machine Learning (Học máy)
* **Học kỳ:** HK1 - Năm 3

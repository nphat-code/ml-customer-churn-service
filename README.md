# 📊 Customer Churn Prediction Service

> **Đồ án môn học Machine Learning (Học máy)**  
> Huấn luyện mô hình dự đoán tỷ lệ rời bỏ của khách hàng viễn thông và triển khai dưới dạng dịch vụ REST API độc lập.

---

## 🚀 Tính năng chính

- **Machine Learning Pipeline bài bản:** Tiền xử lý dữ liệu, mã hóa biến định danh, chuẩn hóa dữ liệu, giải quyết mất cân bằng lớp và so sánh đa mô hình (*Logistic Regression, Random Forest, XGBoost, LightGBM*).
- **Explainable AI (XAI):** Tích hợp giải thích mô hình bằng SHAP / Feature Importance.
- **REST API chuẩn công nghiệp:** Xây dựng bằng **FastAPI**, tự động validate dữ liệu với **Pydantic** và tự động sinh Swagger UI tương tác.
- **Tài liệu hoàn chỉnh:** Báo cáo kỹ thuật mô hình (`docs/MODEL_REPORT.md`) và đặc tả API (`docs/API_SPEC.md`).

---

## 📁 Cấu trúc thư mục

```text
Project/
├── app/                      # Mã nguồn REST API Service (FastAPI)
│   ├── __init__.py
│   ├── main.py               # Entry point FastAPI, routes
│   ├── schemas.py            # Pydantic schemas validate input/output
│   └── service.py            # Logic load model và inference
├── data/                     # Dữ liệu huấn luyện (Kaggle dataset)
│   └── .gitkeep
├── docs/                     # Tài liệu kỹ thuật
│   ├── MODEL_REPORT.md       # Báo cáo mô hình (Kiến trúc, metrics, XAI)
│   └── API_SPEC.md           # Đặc tả các endpoint của REST API
├── models/                   # Lưu trữ file mô hình đã huấn luyện (.joblib)
│   └── .gitkeep
├── notebooks/                # Jupyter Notebooks thực nghiệm
│   ├── 01_eda.ipynb          # Khám phá và phân tích dữ liệu
│   └── 02_model_training.ipynb # Huấn luyện, so sánh và đánh giá mô hình
├── src/                      # Source code pipeline dùng chung
│   ├── __init__.py
│   ├── data_loader.py        # Đọc và chia tập train/test
│   └── pipeline.py           # Tiền xử lý và đóng gói Scikit-Learn Pipeline
├── .gitignore                # Bỏ qua các file rác, dữ liệu lớn và venv
├── requirements.txt          # Các thư viện phụ thuộc
└── README.md                 # Hướng dẫn tổng quan dự án
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
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Truy cập Swagger UI kiểm thử
Mở trình duyệt tại: **`http://localhost:8000/docs`** để gửi request kiểm thử trực tiếp trên giao diện tương tác của Swagger UI.

---

## 👥 Nhóm tác giả & Thông tin môn học
* **Môn học:** Machine Learning (Học máy)
* **Học kỳ:** HK1 - Năm 3

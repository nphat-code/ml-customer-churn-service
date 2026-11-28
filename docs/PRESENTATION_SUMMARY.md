# Tóm Tắt Dự Án & Định Hướng Trình Bày Với Giảng Viên

## 1. Tổng Quan Những Gì Đã Làm Được

Dự án xây dựng hệ thống dự đoán khách hàng rời bỏ dịch vụ viễn thông (**Customer Churn Prediction**) theo quy trình **End-to-End Machine Learning**, từ xử lý dữ liệu, huấn luyện/so sánh mô hình đến đóng gói API, giao diện người dùng cuối và CI/CD.

- **Khám phá & Tiền xử lý dữ liệu** ([customer_churn_experiments.ipynb](notebooks/customer_churn_experiments.ipynb), [data_loader.py](src/data_loader.py), [pipeline.py](src/pipeline.py)):
  - Làm sạch bộ dữ liệu Kaggle Telco Customer Churn (7,043 dòng, 21 thuộc tính).
  - Xử lý 11 dòng `TotalCharges` bị khuyết ngầm (chuỗi rỗng `" "` ứng với khách hàng mới `tenure = 0`): không xóa bỏ mà ép kiểu số và điền `0.0` để bảo toàn toàn bộ 7,043 mẫu.
  - Mã hóa 16 biến phân loại bằng `OneHotEncoder(handle_unknown="ignore", sparse_output=False)` thành 43 cột nhị phân; chuẩn hóa 3 biến số (`tenure`, `MonthlyCharges`, `TotalCharges`) bằng `StandardScaler`.
  - Đóng gói toàn bộ vào `ColumnTransformer` + `Pipeline` của `scikit-learn` để ngăn Data Leakage giữa tập Train và Test/Inference.
- **Xử lý mất cân bằng lớp & Benchmark 4 mô hình** ([train.py](src/train.py), [model_benchmark.json](docs/model_benchmark.json)):
  - Giải quyết mất cân bằng (~26.5% Churn / ~73.5% Retain) bằng Cost-sensitive Learning (`class_weight="balanced"` và `scale_pos_weight ≈ 2.76`) thay vì SMOTE.
  - Đánh giá 4 thuật toán: **XGBoost**, Logistic Regression, Random Forest, LightGBM.
  - Chọn **XGBoost** vì đạt **Recall 80.21%** (300/374 ca churn trên tập test), **ROC-AUC 0.8435**, F1-Score 0.6376, Accuracy 75.80%, Precision 52.91%; lưu thành `models/best_churn_pipeline.joblib`.
- **Backend REST API & Explainable AI** ([main.py](app/main.py), [schemas.py](app/schemas.py), [service.py](app/service.py)):
  - FastAPI + Pydantic V2, nạp pipeline một lần khi khởi động server (`lifespan`).
  - Phân tầng rủi ro (`Low < 0.35`, `Medium 0.35–0.65`, `High >= 0.65`), giải thích yếu tố tác động từng khách hàng bằng **TreeSHAP** (`top_factors`), và sinh khuyến nghị giữ chân tự động.
  - Hỗ trợ dự đoán đơn lẻ (`POST /api/v1/predict`) và hàng loạt (`POST /api/v1/predict/batch`).
- **Frontend Dashboard hướng người dùng cuối (`ChurnGuard`)** ([frontend/src/App.tsx](frontend/src/App.tsx)):
  - Giao diện tiếng Việt phục vụ nhân viên CSKH: hồ sơ mẫu 1-click, dự đoán đơn lẻ + biểu đồ yếu tố ảnh hưởng, mô phỏng What-If theo thời gian thực, và phân tích hàng loạt qua CSV (tính doanh thu tháng có nguy cơ thất thoát, lọc nhóm rủi ro cao, xuất CSV).
- **Kiểm thử tự động, CI/CD & Đóng gói** ([test_api.py](tests/test_api.py), [ci.yml](.github/workflows/ci.yml), [docker-compose.yml](docker-compose.yml)):
  - Kiểm thử API với `pytest`, tự động hóa qua GitHub Actions CI, và đóng gói chạy đồng thời FastAPI + Nginx qua Docker Compose.

---

## 2. Nên Trình Bày Những Phần Nào Với Giảng Viên?

Với đồ án môn **Machine Learning**, nên dành **~70% thời lượng cho phần Dữ liệu, Tiền xử lý & Mô hình**, và **~30% cho phần Triển khai API, XAI & Demo**.

### Phần 1: Đặt vấn đề & Định nghĩa bài toán (1–2 phút)
- Bài toán Binary Classification ($y = 1$: Churn, $y = 0$: Retain) trên dữ liệu viễn thông.
- Ý nghĩa kinh doanh: chi phí tìm khách mới cao gấp 5–7 lần chi phí giữ chân khách cũ.

### Phần 2: Data Engineering & Chống Data Leakage (3 phút) — *Trọng tâm 1*
- Trình bày 3 vấn đề của dữ liệu gốc và cách xử lý:
  1. `TotalCharges` rỗng ngầm $\rightarrow$ điền `0.0` (vì `tenure = 0`), không xóa dòng.
  2. 16 biến định danh $\rightarrow$ dùng `OneHotEncoder` thay vì Label Encoding để không áp đặt thứ tự giả.
  3. Lệch thang đo (`tenure` 0–72 vs `TotalCharges` 0–8,684) $\rightarrow$ dùng `StandardScaler`.
- Nhấn mạnh việc đóng gói `ColumnTransformer` vào `Pipeline` và chỉ `.fit()` trên `X_train` để chống Data Leakage.
- Minh họa bằng các biểu đồ EDA trong `docs/images/` (`01_churn_distribution.png`, `02_eda_features_vs_churn.png`, `03_standard_scaler_comparison.png`).

### Phần 3: Xử lý Mất cân bằng & Benchmark Mô hình (4 phút) — *Trọng tâm 2*
- Giải thích vì sao ưu tiên **Recall** và **ROC-AUC** thay vì Accuracy (chi phí bỏ sót khách rời bỏ lớn hơn nhiều so với chi phí gửi nhầm ưu đãi).
- Giải thích vì sao chọn `scale_pos_weight` / `class_weight="balanced"` thay vì SMOTE (dữ liệu chủ yếu là biến phân loại sau One-Hot, SMOTE dễ tạo điểm nhiễu).
- Trình bày bảng so sánh 4 mô hình kèm `04_roc_curves_comparison.png` và `05_confusion_matrix_feature_importance.png`, chốt lý do chọn **XGBoost**.

### Phần 4: Demo End-to-End: API + TreeSHAP + Giao diện CSKH (3 phút) — *Điểm cộng*
- Trình bày luồng dữ liệu: *Input khách hàng $\rightarrow$ FastAPI + Pipeline $\rightarrow$ Xác suất + Phân tầng rủi ro + Giải thích TreeSHAP $\rightarrow$ Khuyến nghị hành động*.
- Demo nhanh 3 thao tác trên giao diện:
  1. Chọn 1 hồ sơ mẫu rủi ro cao.
  2. Thử đổi loại hợp đồng / dịch vụ ở phần mô phỏng để thấy xác suất rời bỏ giảm theo thời gian thực.
  3. Upload CSV mẫu để xem tổng doanh thu rủi ro, lọc khách hàng rủi ro cao và xuất danh sách CSV.

### Phần 5: Kiểm thử & Đóng gói (1 phút)
- Nhắc ngắn gọn việc đã viết test tự động (`pytest`), cấu hình GitHub Actions CI và Docker Compose.

*(Chi tiết kịch bản từng slide và bộ câu hỏi vấn đáp xem tại [PRESENTATION_NOTES.md](PRESENTATION_NOTES.md).)*

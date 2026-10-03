# Báo Cáo Kỹ Thuật Mô Hình (Model Technical Report)
## Đề tài: Dự đoán Khách hàng Rời bỏ Dịch vụ (Customer Churn Prediction)

---

### 1. Tổng quan bài toán (Problem Statement)
* **Mục tiêu kinh doanh:** Xác định sớm các khách hàng có khả năng chấm dứt sử dụng dịch vụ viễn thông nhằm đưa ra chiến lược giữ chân (retention) kịp thời.
* **Loại bài toán ML:** Học có giám sát (Supervised Learning) - Phân loại nhị phân (Binary Classification).
  * $y = 1$: Khách hàng rời bỏ dịch vụ (Churn).
  * $y = 0$: Khách hàng tiếp tục sử dụng (Retain).
* **Độ đo đánh giá (Evaluation Metrics):**
  * **ROC-AUC & PR-AUC:** Đánh giá khả năng phân tách giữa hai lớp xác suất.
  * **Recall (Class 1):** Tối ưu hóa việc không bỏ sót khách hàng có ý định rời bỏ.
  * **F1-Score:** Đảm bảo cân bằng giữa Precision và Recall.

---

### 2. Dữ liệu & Khám phá dữ liệu (Dataset & EDA)
* **Nguồn dữ liệu:** Kaggle - *Telco Customer Churn Dataset* (~7,043 mẫu, 21 đặc trưng).
* **Các nhóm đặc trưng chính:**
  * **Nhân khẩu học (Demographics):** Giới tính, người cao tuổi, có bạn đời, người phụ thuộc.
  * **Thông tin dịch vụ (Account/Services):** Số tháng gắn bó (`tenure`), điện thoại, Internet (DSL / Cáp quang), bảo mật mạng, sao lưu trực tuyến, hỗ trợ kỹ thuật, streaming TV/phim.
  * **Thông tin hợp đồng & thanh toán:** Loại hợp đồng (Month-to-month, 1-year, 2-year), hóa đơn giấy, hình thức thanh toán, cước phí tháng (`MonthlyCharges`), tổng cước phí (`TotalCharges`).
* **Tiền xử lý dữ liệu (Preprocessing):**
  * Xử lý missing values ở cột `TotalCharges` (điền bằng median hoặc giá trị 0 cho khách hàng mới `tenure = 0`).
  * Mã hóa biến phân loại (One-Hot Encoding cho các biến định tính).
  * Chuẩn hóa biến số liên tục (StandardScaler hoặc RobustScaler cho `tenure`, `MonthlyCharges`, `TotalCharges`).
  * Xử lý mất cân bằng dữ liệu: Thử nghiệm SMOTE hoặc `scale_pos_weight` / `class_weight='balanced'`.

---

### 3. Huấn luyện & So sánh mô hình (Model Benchmarking)
So sánh tối thiểu 4 thuật toán:
1. **Logistic Regression (Baseline):** Đơn giản, giải thích tốt.
2. **Random Forest:** Mô hình ensemble cây quyết định cơ bản.
3. **XGBoost:** Gradient Boosting tối ưu hóa cao.
4. **LightGBM:** Tốc độ huấn luyện vượt trội, xử lý dữ liệu bảng mạnh mẽ.

| Mô hình | Accuracy | Precision (Class 1) | Recall (Class 1) | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Best)** | **0.7580** | **0.5291** | **0.8021** | **0.6376** | **0.8435** |
| Random Forest | 0.7601 | 0.5331 | 0.7754 | 0.6318 | 0.8414 |
| LightGBM | 0.7580 | 0.5299 | 0.7807 | 0.6314 | 0.8414 |
| Logistic Regression (Baseline) | 0.7381 | 0.5043 | 0.7834 | 0.6136 | 0.8415 |

---

### 4. Giải thích mô hình (Explainable AI - XAI)
* **Feature Importance:** Liệt kê top 5 đặc trưng quan trọng nhất tác động đến quyết định rời bỏ.
* **Phân tích SHAP (SHapley Additive exPlanations):**
  * Biểu đồ SHAP Summary Plot.
  * SHAP Force Plot giải thích cho từng khách hàng cụ thể khi gọi REST API.

---

### 5. Đóng gói & Triển khai (Pipeline & Deployment)
* Đóng gói toàn bộ `ColumnTransformer` + `Best Estimator` thành 1 file duy nhất bằng `joblib`.
* Triển khai REST API với FastAPI (tự động validate dữ liệu bằng Pydantic).

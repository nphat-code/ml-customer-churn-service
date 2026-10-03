# 🧪 ML Experiment Tracking Log — Nhật Ký Thử Nghiệm Mô Hình

Tài liệu lưu vết toàn bộ quá trình thử nghiệm, so sánh các giả thuyết và kết quả huấn luyện mô hình dự đoán khách hàng rời bỏ dịch vụ viễn thông (*Customer Churn Prediction*).

---

## 📊 Bảng tổng hợp thực nghiệm (Experiment Summary Matrix)

*Tập dữ liệu: Telco Customer Churn (7,043 mẫu, 19 đặc trưng đầu vào, 1 đặc trưng mục tiêu nhị phân).*
*Chiến lược phân chia: Stratified Split 80% Train (5,634 mẫu) / 20% Test (1,409 mẫu, gồm 1,035 Retain và 374 Churn).*

| Experiment ID | Thuật toán | Cơ chế xử lý mất cân bằng & Cấu hình cốt lõi | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Quyết định |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **EXP-01** | **Logistic Regression** | `class_weight="balanced"`, solver `lbfgs`, `max_iter=1000`, L2 penalty ($C=1.0$) | 0.7381 | 0.5043 | 0.7834 | 0.6136 | 0.8415 | Baseline chuẩn, giải thích tốt qua Odds Ratio |
| **EXP-02** | **Random Forest** | `class_weight="balanced"`, `n_estimators=150`, `max_depth=8`, criterion `gini` | **0.7601** | **0.5331** | 0.7754 | 0.6318 | 0.8414 | Bị loại: Recall thấp nhất (0.7754) |
| **EXP-03** | **LightGBM** | `class_weight="balanced"`, `learning_rate=0.05`, `n_estimators=100`, GOSS + EFB | 0.7580 | 0.5299 | 0.7807 | 0.6314 | 0.8414 | Tốc độ train nhanh, nhưng Recall chưa bằng XGBoost |
| **EXP-04** | **XGBoost (Best)** | `scale_pos_weight=2.767`, `learning_rate=0.05`, `n_estimators=100`, `max_depth=4` | 0.7580 | 0.5291 | **0.8021** | **0.6376** | **0.8435** | **CHỌN SERVING PRODUCTION** |

---

## 🔬 Chi tiết từng thử nghiệm

### 1. EXP-01: Logistic Regression (Mô hình cơ sở - Baseline)

* **Giả thuyết nghiên cứu:**
  * Xây dựng một mô hình cơ sở tuyến tính với hàm liên kết Logit.
  * Giả định log-odds của xác suất rời bỏ có quan hệ tuyến tính với các đặc trưng sau khi chuẩn hóa $z$-score và One-Hot Encoding.
* **Cấu hình kỹ thuật:**
  * Pipeline: `ColumnTransformer` (StandardScaler cho 3 biến số, OneHotEncoder cho 16 biến phân loại).
  * Hyperparameters: `C=1.0`, `solver="lbfgs"`, `max_iter=1000`, `class_weight="balanced"`.
  * Hàm mất mát: Binary Cross-Entropy với phạt L2 (Ridge).
* **Kết quả đo lường trên Test Set:**
  * **ROC-AUC:** `0.8415` | **Recall:** `0.7834` | **Precision:** `0.5043` | **F1:** `0.6136`
  * **Ma trận nhầm lẫn (Confusion Matrix):**
    ```
                    Predicted Retain    Predicted Churn
    Actual Retain        747 (TN)            288 (FP)
    Actual Churn          81 (FN)            293 (TP)
    ```
* **Đánh giá & Kết luận:**
  * Bắt được 293/374 khách hàng churn (Recall đạt ~78.3%).
  * Ưu điểm: Tốc độ huấn luyện và suy luận dưới 1ms, tính giải thích cao qua trọng số hệ số góc $w$.
  * Hạn chế: Không tự động mô hình hóa được các mối tương tác phi tuyến tính giữa các gói dịch vụ (ví dụ: `Contract=Month-to-month` kết hợp với `InternetService=Fiber optic`).

---

### 2. EXP-02: Random Forest Classifier (Bagging Ensemble)

* **Giả thuyết nghiên cứu:**
  * Kết hợp đa dạng nhiều cây quyết định độc lập trên các mẫu bootstrap để giảm thiểu phương sai (variance reduction).
  * Khống chế độ sâu tối đa `max_depth=8` nhằm chống overfitting trên tập train.
* **Cấu hình kỹ thuật:**
  * Hyperparameters: `n_estimators=150`, `max_depth=8`, `random_state=42`, `class_weight="balanced"`, `n_jobs=-1`.
  * Phân tách node: Chỉ số tạp chất Gini (Gini Impurity).
* **Kết quả đo lường trên Test Set:**
  * **ROC-AUC:** `0.8414` | **Recall:** `0.7754` | **Precision:** `0.5331` | **F1:** `0.6318`
  * **Ma trận nhầm lẫn (Confusion Matrix):**
    ```
                    Predicted Retain    Predicted Churn
    Actual Retain        781 (TN)            254 (FP)
    Actual Churn          84 (FN)            290 (TP)
    ```
* **Đánh giá & Kết luận:**
  * Accuracy (0.7601) và Precision (0.5331) cao nhất trong các mô hình.
  * **Lý do bị loại:** Recall chỉ đạt 0.7754 (bỏ sót 84 khách hàng churn, cao nhất trong 4 mô hình). Trong bài toán churn, False Negative tốn kém hơn False Positive nên không ưu tiên Accuracy/Precision.

---

### 3. EXP-03: LightGBM Classifier (Gradient Boosting with GOSS & EFB)

* **Giả thuyết nghiên cứu:**
  * Kiểm tra hiệu năng của thuật toán tăng cường độ dốc thế hệ mới với kỹ thuật GOSS (Gradient-based One-Side Sampling) và EFB (Exclusive Feature Bundling) trên dữ liệu thưa sau One-Hot.
* **Cấu hình kỹ thuật:**
  * Hyperparameters: `n_estimators=100`, `learning_rate=0.05`, `random_state=42`, `class_weight="balanced"`, `verbose=-1`.
* **Kết quả đo lường trên Test Set:**
  * **ROC-AUC:** `0.8414` | **Recall:** `0.7807` | **Precision:** `0.5299` | **F1:** `0.6314`
  * **Ma trận nhầm lẫn (Confusion Matrix):**
    ```
                    Predicted Retain    Predicted Churn
    Actual Retain        776 (TN)            259 (FP)
    Actual Churn          82 (FN)            292 (TP)
    ```
* **Đánh giá & Kết luận:**
  * Thời gian huấn luyện nhanh nhất trong các mô hình Boosting.
  * Chỉ số Recall (0.7807) tương đương Logistic Regression nhưng chưa vượt qua được XGBoost.

---

### 4. EXP-04: XGBoost Classifier (Second-Order Gradient Boosting — WINNER)

* **Giả thuyết nghiên cứu:**
  * Sử dụng thuật toán Newton bậc hai (First-order gradient $g_i$ và Second-order Hessian $h_i$) cùng cơ chế điều chỉnh trọng số nhị phân `scale_pos_weight = N_neg / N_pos`.
  * Khống chế `learning_rate=0.05` và `max_depth=4` để tránh hiện tượng học vẹt trên tập train.
* **Cấu hình kỹ thuật:**
  * Công thức tính trọng số: `scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train) = 4139 / 1495 ≈ 2.7686`.
  * Hyperparameters: `n_estimators=100`, `learning_rate=0.05`, `max_depth=4`, `eval_metric="logloss"`, `random_state=42`.
* **Kết quả đo lường trên Test Set:**
  * **ROC-AUC:** **`0.8435`** (Vô địch)
  * **Recall:** **`0.8021`** (Vô địch — vượt mốc 80%)
  * **F1-Score:** **`0.6376`** (Vô địch)
  * **Accuracy:** `0.7580` | **Precision:** `0.5291`
  * **Ma trận nhầm lẫn (Confusion Matrix):**
    ```
                    Predicted Retain    Predicted Churn
    Actual Retain        768 (TN)            267 (FP)
    Actual Churn          74 (FN)            300 (TP)
    ```
* **Đánh giá & Kết luận:**
  * Giảm số ca bỏ sót xuống mức thấp nhất toàn bộ thử nghiệm: chỉ còn **74 khách hàng** (bắt đúng 300/374 khách hàng thực sự rời đi).
  * ROC-AUC đạt 0.8435 chứng minh khả năng tách biệt xác suất phân bố giữa hai lớp tối ưu nhất.
  * **Quyết định:** Chọn mô hình EXP-04 làm mô hình chính thức, đóng gói toàn bộ pipeline vào `models/best_churn_pipeline.joblib`.

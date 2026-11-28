# 📊 Tổng Hợp & Phân Tích Biểu Đồ — Customer Churn Prediction

Tài liệu này lưu trữ toàn bộ 7 biểu đồ được sinh ra từ [notebooks/customer_churn_experiments.ipynb](file:///c:/Study/HK1Nam3/ML/Project/notebooks/customer_churn_experiments.ipynb) kèm phân tích chi tiết cho từng biểu đồ.

---

## 1. Phân phối biến mục tiêu (`Churn`)

![Phân phối biến mục tiêu Churn](images/01_churn_distribution.png)

### Phân tích:
- **Mức độ mất cân bằng lớp:** Trong tổng số **7,043** khách hàng, có **5,174** khách hàng ở lại (`No`, chiếm **73.5%**) và **1,869** khách hàng rời bỏ (`Yes`, chiếm **26.5%**), tương ứng tỷ lệ xấp xỉ **2.77 : 1**.
- **Hệ quả kỹ thuật:**
  - Nếu dùng *Accuracy* làm thước đo chính, một mô hình đoán tất cả là `No` vẫn đạt ~73.5% nhưng hoàn toàn vô dụng.
  - Bắt buộc phải chia tập train/test có phân tầng (`stratify=y`), áp dụng trọng số lớp (`scale_pos_weight` / `class_weight="balanced"`), và đánh giá bằng **ROC-AUC** cùng **Recall**.

---

## 2. Mối quan hệ giữa `tenure`, `MonthlyCharges`, `Contract` với `Churn`

![Mối quan hệ giữa tenure, MonthlyCharges, Contract với Churn](images/02_eda_features_vs_churn.png)

### Phân tích:
- **`tenure` (Thời gian gắn bó):** Nhóm khách hàng rời bỏ có trung vị thời gian gắn bó chỉ **10 tháng**, thấp hơn gần 4 lần so với nhóm ở lại (**38 tháng**). Rủi ro rời bỏ tập trung cực cao ở giai đoạn 0–12 tháng đầu tiên.
- **`MonthlyCharges` (Cước hàng tháng):** Nhóm rời bỏ có trung vị cước phí là **79.65 USD/tháng**, cao hơn đáng kể so với **64.43 USD/tháng** của nhóm ở lại — cước phí cao tạo áp lực khiến khách hàng dễ chuyển sang đối thủ.
- **`Contract` (Loại hợp đồng):** Đây là yếu tố phân tách mạnh nhất:
  - `Month-to-month`: Tỷ lệ Churn lên tới **42.7%**.
  - `One year`: Giảm mạnh xuống **11.3%**.
  - `Two year`: Chỉ còn **2.8%**.

---

## 3. So sánh phân phối trước và sau `StandardScaler`

![So sánh trước và sau StandardScaler](images/03_standard_scaler_comparison.png)

### Phân tích:
- **Trước `StandardScaler` (trái):** Vì `TotalCharges` có giá trị lên tới gần `9,000 USD`, trục hoành bị kéo giãn tới `10,000`, ép `tenure` (`0–72`) và `MonthlyCharges` (`18–118`) thành 2 vạch đứng sát gốc `0`. Nếu không chuẩn hóa, `TotalCharges` sẽ áp đảo hoàn toàn các biến khác trong mô hình tuyến tính.
- **Sau `StandardScaler` (phải):** Cả 3 biến được đưa về cùng một thang đo chuẩn quanh tâm `0` (trong khoảng `[-2, +3]`) mà **vẫn giữ nguyên hình dạng phân phối**:
  - `tenure`: phân phối 2 đỉnh (*bimodal*) ở nhóm khách mới (`z ≈ -1.2`) và lâu năm (`z ≈ +1.5`).
  - `MonthlyCharges`: phân 2 cụm rõ (gói cơ bản quanh `z ≈ -1.4` và gói cao cấp quanh `z ≈ +0.5` đến `+1.5`).
  - `TotalCharges`: lệch phải (*right-skewed*), tập trung ở mức chi tiêu thấp và kéo đuôi dài về phía `+3`.

---

## 4. Đường cong ROC so sánh 4 mô hình

![So sánh đường cong ROC giữa 4 mô hình](images/04_roc_curves_comparison.png)

### Phân tích:
- Cả 4 mô hình đều có đường cong ROC vươn cao về góc trên bên trái, vượt xa đường cơ sở đoán ngẫu nhiên (`AUC = 0.5000`).
- **Xếp hạng hiệu năng theo ROC-AUC:**
  1. **XGBoost:** **0.8435** *(cao nhất)*
  2. **Logistic Regression:** **0.8415**
  3. **Random Forest:** **0.8414**
  4. **LightGBM:** **0.8414**
- Dù cả 4 thuật toán đạt năng lực phân tách tương đối sát nhau (~0.84), **XGBoost** nhỉnh hơn cả về `ROC-AUC` (`0.8435`) lẫn `Recall` (`0.8021`), nên được chọn làm mô hình triển khai chính thức.

---

## 5. Ma trận nhầm lẫn & Top 15 Feature Importances (XGBoost)

![Confusion Matrix và Feature Importance của XGBoost](images/05_confusion_matrix_feature_importance.png)

### Phân tích:
- **Confusion Matrix (trái — tập test 1,409 mẫu):**
  - **TN = 768, FP = 267, FN = 74, TP = 300**.
  - Mô hình phát hiện đúng **300 / 374** khách hàng thực sự rời bỏ (**Recall = 80.21%**), chỉ bỏ sót 74 trường hợp. Số báo động giả (`FP = 267`) là sự đánh đổi chủ đích từ `scale_pos_weight` để tối ưu khả năng giữ chân khách hàng.
- **Top Feature Importances (phải):**
  - `cat__Contract_Month-to-month` chiếm tỷ trọng áp đảo (~**52.5%**), khẳng định hợp đồng theo tháng là tín hiệu rủi ro số 1.
  - Tiếp theo là `cat__InternetService_Fiber optic` (~**9.9%**), `cat__OnlineSecurity_No` (~**4.6%**), `cat__TechSupport_No` (~**3.7%**) và `cat__InternetService_DSL` (~**3.0%**).
  - Kết quả này khớp hoàn toàn với EDA và làm cơ sở cho các luật khuyến nghị can thiệp trong `app/service.py` (khuyến khích nâng cấp hợp đồng dài hạn và bổ sung dịch vụ bảo mật/hỗ trợ kỹ thuật).

---

## 6. Biểu đồ SHAP Summary (Beeswarm) — Giải thích toàn cục (XGBoost)

*(Hiển thị ở Phần 4.3 trong [notebooks/customer_churn_experiments.ipynb](file:///c:/Study/HK1Nam3/ML/Project/notebooks/customer_churn_experiments.ipynb))*

### Phân tích:
- **Ý nghĩa trục & màu sắc:** Trục hoành biểu diễn giá trị SHAP (mức đóng góp theo log-odds: `> 0` đẩy xác suất Churn tăng, `< 0` kéo xác suất Churn giảm); màu đỏ là giá trị đặc trưng cao/`1`, màu xanh là giá trị thấp/`0`.
- **Top đặc trưng tác động mạnh nhất (theo trung bình `|SHAP|`):**
  1. `Contract_Month-to-month` (`0.7642`): Khi bằng `1` (đỏ), các điểm dồn hẳn sang phải làm tăng mạnh rủi ro rời bỏ; khi bằng `0` (xanh), kéo rủi ro giảm sâu.
  2. `tenure` (`0.4496`): Khách hàng mới (`tenure` thấp — màu xanh) tập trung ở vùng SHAP dương, còn khách gắn bó lâu (`tenure` cao — màu đỏ) nằm ở vùng SHAP âm giúp giữ chân.
  3. `MonthlyCharges` (`0.2679`): Cước tháng cao (đỏ) đẩy nguy cơ rời bỏ tăng lên.
  4. Nhóm dịch vụ & thanh toán: `OnlineSecurity_No` (`0.2550`), `InternetService_Fiber optic` (`0.1792`), `PaymentMethod_Electronic check` (`0.1759`) và `TechSupport_No` (`0.1752`) đều có xu hướng đẩy xác suất Churn tăng khi mang giá trị `1`.

---

## 7. Biểu đồ SHAP Waterfall — Giải thích cục bộ (Index 1090)

*(Hiển thị ở Phần 4.3 trong [notebooks/customer_churn_experiments.ipynb](file:///c:/Study/HK1Nam3/ML/Project/notebooks/customer_churn_experiments.ipynb))*

### Phân tích:
- **Đối tượng phân tích:** Khách hàng có xác suất Churn cao nhất trên tập Test (`index=1090`), mô hình dự đoán **97.00%** và nhãn thực tế là **Churn (`1`)**.
- **Diễn giải từng lực đẩy từ giá trị cơ sở ($E[f(x)] = -0.0027$ log-odds):**
  - `tenure = 1` tháng (`+0.9212`): Khách hàng mới dùng tháng đầu tiên là yếu tố đẩy rủi ro mạnh nhất.
  - `Contract_Month-to-month = 1` (`+0.6986`): Hợp đồng theo tháng, chưa có ràng buộc dài hạn.
  - `MonthlyCharges = 95.10 USD` (`+0.3614`) và `TotalCharges = 95.10 USD` (`+0.2164`): Cước phí tháng đầu cao.
  - Thiếu `OnlineSecurity` (`+0.2044`), thiếu `TechSupport` (`+0.1913`), thanh toán `Electronic check` (`+0.1579`) và dùng `Fiber optic` (`+0.1460`).
- **Giá trị ứng dụng:** Thay vì chỉ đưa ra con số `97.00%`, biểu đồ Waterfall chứng minh rõ lý do cụ thể cho từng khách hàng — đây chính là cơ sở khoa học cho biểu đồ yếu tố ảnh hưởng và gợi ý giữ chân trên Backend API (`app/service.py`).



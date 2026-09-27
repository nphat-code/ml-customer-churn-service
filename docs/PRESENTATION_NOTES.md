# 🎤 Kịch Bản & Cẩm Nang Thuyết Trình Đồ Án
## Đề tài: Customer Churn Prediction Service
**Môn học:** Machine Learning (Học máy) — HK1 Năm 3  
**Mục tiêu:** Tài liệu dàn ý thuyết trình từng slide, kịch bản nói (talking points) và bộ câu hỏi vấn đáp (Q&A Defense) dành cho bảo vệ đồ án.

---

## 📌 Khung Thời Gian Gợi Ý (10 - 15 phút)

1. **Đặt vấn đề & Mục tiêu dự án:** ~2 phút
2. **Khám phá dữ liệu & Tiền xử lý (Data Pipeline):** ~3 phút
3. **Huấn luyện mô hình & Benchmark:** ~4 phút
4. **Kiến trúc REST API Service & Demo:** ~3 phút
5. **Tổng kết & Hướng phát triển:** ~1 phút
6. **Vấn đáp với Giảng viên (Q&A):** ~3 - 5 phút

---

## Slide 1: Giới thiệu đề tài & Đặt vấn đề kinh doanh

* **Tiêu đề:** Xây dựng Dịch vụ Dự đoán Khách hàng Rời bỏ Mạng viễn thông (Customer Churn Prediction Service)
* **Ý chính trình bày:**
  * **Bài toán thực tế:** Trong ngành viễn thông, chi phí tìm kiếm một khách hàng mới (CAC) cao gấp 5 đến 7 lần so với chi phí giữ chân khách hàng cũ (Retention Cost).
  * **Mục tiêu kỹ thuật:** Không dừng lại ở việc chạy thử nghiệm trên Jupyter Notebook, đồ án xây dựng một **End-to-End Machine Learning Pipeline** hoàn chỉnh, đóng gói mô hình tối ưu thành dịch vụ **REST API độc lập chuẩn công nghiệp** có thể tích hợp trực tiếp vào hệ thống CRM của doanh nghiệp.
  * **Định nghĩa bài toán ML:** Học có giám sát (Supervised Learning), bài toán phân loại nhị phân (Binary Classification):
    * $y = 1$: Khách hàng rời bỏ dịch vụ (Churn).
    * $y = 0$: Khách hàng tiếp tục gắn bó (Retain).

---

## Slide 2: Dữ liệu & Thách thức tiền xử lý (Data Engineering)

* **Bộ dữ liệu:** Kaggle Telco Customer Churn (7,043 dòng, 21 thuộc tính).
* **3 Thách thức kỹ thuật và giải pháp xử lý:**
  1. **Dữ liệu khuyết thiếu ngầm (`TotalCharges`):**
     * *Vấn đề:* Có 11 dòng chứa chuỗi khoảng trắng `" "` thay vì giá trị số, ứng với khách hàng mới ký hợp đồng (`tenure = 0`).
     * *Giải pháp:* Ép kiểu số qua `pd.to_numeric(errors="coerce")` và gán `fillna(0.0)`.
  2. **Biến định danh đa dạng (16 Categorical Features):**
     * *Giải pháp:* Áp dụng `OneHotEncoder(handle_unknown="ignore", sparse_output=False)` để chuyển 16 cột chữ thành 43 cột nhị phân (0 và 1).
     * *Điểm nhấn kỹ thuật:* Không dùng Label Encoding (0, 1, 2) vì sẽ áp đặt thứ bậc toán học sai lệch lên các biến không có thứ tự tự nhiên (ví dụ loại hợp đồng, hình thức thanh toán).
  3. **Lệch thang đo nghiêm trọng (Scale Discrepancy):**
     * *Vấn đề:* `tenure` (0-72 tháng) so với `TotalCharges` (0-8,684 USD).
     * *Giải pháp:* Dùng `StandardScaler` đưa 3 biến số về phân phối Z-score ($\mu = 0, \sigma = 1$), ngăn hiện tượng **Scale Dominance** và giúp thuật toán Gradient Descent hội tụ ổn định.
  4. **Chống rò rỉ dữ liệu (Data Leakage):**
     * Đóng gói toàn bộ bước biến đổi trong `ColumnTransformer` và `Pipeline` của `scikit-learn`. Pipeline chỉ học tham số ($\mu, \sigma$, categories) trên tập Train và áp dụng nguyên vẹn lên tập Test/Inference.

---

## Slide 3: Chiến lược xử lý Mất cân bằng dữ liệu (Imbalanced Data)

* **Thực trạng dữ liệu:** Lớp Churn chiếm ~26.5%, lớp Retain chiếm ~73.5% (tỉ lệ xấp xỉ 1:3).
* **Hậu quả nếu bỏ qua:** Mô hình sẽ có xu hướng dự đoán toàn bộ là "Retain" để đạt Accuracy cao ảo (~73.5%), nhưng hoàn toàn thất bại trong việc phát hiện khách hàng rời bỏ.
* **Chiến lược tối ưu hóa hàm mất mát (Cost-sensitive Learning):**
  * Thay vì oversampling nhân tạo (SMOTE) dễ gây nhiễu biên quyết định, dự án sử dụng điều chỉnh trọng số mẫu trực tiếp trong hàm mục tiêu:
    * **Logistic Regression & Random Forest & LightGBM:** `class_weight="balanced"`.
    * **XGBoost:** `scale_pos_weight = \frac{N_{\text{negative}}}{N_{\text{positive}}} \approx 2.76`.
  * *Bản chất:* Phạt nặng mô hình mỗi khi phân loại sai một mẫu Churn, ép mô hình dịch chuyển ngưỡng phân tách để bao phủ tối đa nhóm thiểu số.

---

## Slide 4: Kết quả Benchmark Đa mô hình (Model Benchmarking)

* **Tiêu chí lựa chọn độ đo:**
  * **Recall:** Ưu tiên số 1 vì bỏ sót 1 khách rời bỏ (False Negative) gây tổn thất doanh thu nghiêm trọng hơn việc gửi nhầm ưu đãi cho khách ở lại (False Positive).
  * **ROC-AUC:** Đánh giá năng lực phân tách xác suất tổng quát độc lập với việc chọn ngưỡng cắt (threshold).

| Thuật toán | Accuracy | Precision | **Recall** | F1-Score | **ROC-AUC** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Mô hình chọn)** | **0.7580** | **0.5291** | **0.8021** | **0.6376** | **0.8435** |
| Random Forest | 0.7601 | 0.5331 | 0.7754 | 0.6318 | 0.8414 |
| LightGBM | 0.7580 | 0.5299 | 0.7807 | 0.6314 | 0.8414 |
| Logistic Regression | 0.7381 | 0.5043 | 0.7834 | 0.6136 | 0.8415 |

* **Kết luận chọn mô hình:**
  * **XGBoost** vượt trội với **ROC-AUC đạt 0.8435** và **Recall đạt 80.21%** (bắt đúng 300/374 khách hàng thực tế rời bỏ trên tập kiểm thử).
  * Mô hình chiến thắng được đóng gói và serialize thành file nhị phân `models/best_churn_pipeline.joblib`.

---

## Slide 5: Kiến trúc Triển khai REST API Service

* **Tech Stack:** Python 3.10+, **FastAPI**, **Pydantic V2**, **Uvicorn**.
* **Kiến trúc phân tầng chuyên nghiệp (Layered Architecture):**
  1. **Presentation Layer (`app/main.py`):** Xử lý HTTP requests, CORS, Swagger UI documentation (`/docs`), quản lý Lifespan nạp mô hình vào RAM một lần duy nhất lúc khởi động server.
  2. **Validation Layer (`app/schemas.py`):** Ép kiểu nghiêm ngặt bằng Pydantic schemas (ràng buộc giá trị hợp lệ của hợp đồng, phương thức thanh toán, chặn số âm cho `tenure` và chi phí).
  3. **Inference & Business Layer (`app/service.py`):**
     * Nhận dữ liệu sạch $\rightarrow$ Chạy inference qua pipeline.
     * Tính toán xác suất rời bỏ ($P \in [0, 1]$).
     * Phân tầng mức độ rủi ro (Risk Tiering): **Low** ($P < 0.35$), **Medium** ($0.35 \le P < 0.65$), **High** ($P \ge 0.65$).
     * **Engine khuyến nghị can thiệp tự động (Actionable Recommendations):** Đưa ra giải pháp giữ chân theo đặc điểm từng khách hàng (ví dụ: đề xuất hợp đồng dài hạn, tặng gói bảo mật mạng, đổi hình thức thanh toán).

---

## Slide 6: Kiểm thử tự động & Chất lượng phần mềm

* **Bộ kiểm thử tự động (`tests/test_api.py`):**
  * Kiểm thử hợp đồng API (Schema Contract Testing).
  * Kiểm tra phản hồi mã lỗi `422 Unprocessable Entity` khi dữ liệu đầu vào sai định dạng.
  * Kiểm tra tính sẵn sàng `GET /health` (`model_loaded: true`).
  * Kiểm thử luồng dự đoán thực tế `POST /api/v1/predict` (kết quả trả về đầy đủ nhãn, xác suất, rủi ro, khuyến nghị).
* **Kết quả:** Vượt qua **100% test cases (4/4 passed)** qua `pytest`.

---

## 🎯 Bộ Câu Hỏi Vấn Đáp Bảo Vệ Đồ Án (Dành cho Giảng viên & Cách trả lời)

### Câu 1: Tại sao nhóm không dùng SMOTE để cân bằng dữ liệu mà lại dùng `scale_pos_weight`?
* **Trả lời:**
  * SMOTE sinh mẫu nhân tạo dựa trên nội suy k-hàng-xóm gần nhất (k-NN) trong không gian liên tục. Với tập dữ liệu chứa phần lớn là **biến phân loại (16/19 cột)** sau One-Hot Encoding, SMOTE dễ tạo ra các điểm dữ liệu phi thực tế nằm giữa các giá trị nhị phân 0 và 1, đồng thời có nguy cơ làm nhiễu đường biên phân loại (decision boundary).
  * Việc dùng `scale_pos_weight` (hoặc `class_weight="balanced"`) là kỹ thuật can thiệp trực tiếp vào Loss Function (Cost-sensitive Learning). Nó bảo toàn 100% phân phối dữ liệu gốc, không làm tăng dung lượng tập train, và phạt mô hình trực tiếp theo tỉ lệ mất cân bằng $\frac{N_{\text{neg}}}{N_{\text{pos}}}$.

### Câu 2: Thuật toán dạng cây (XGBoost, Random Forest) không phụ thuộc vào thang đo của biến, tại sao nhóm vẫn cho `tenure` và `TotalCharges` qua `StandardScaler`?
* **Trả lời:**
  * Đúng về mặt lý thuyết thuật toán cây quyết định: việc chia nhánh chỉ dựa vào thứ tự giá trị chứ không dựa vào khoảng cách.
  * Tuy nhiên, trong đồ án, nhóm xây dựng **hệ thống benchmark thống nhất**. Nếu mỗi thuật toán có một pipeline tiền xử lý riêng lẻ thì mã nguồn sẽ bị phân mảnh và khó duy trì khi triển khai serving. `StandardScaler` là bắt buộc đối với mô hình tuyến tính (Logistic Regression). Khi đưa vào pipeline chung, nó không làm suy giảm hiệu năng của mô hình cây nhưng đảm bảo tính nhất quán và tái sử dụng mã nguồn (code reusability).

### Câu 3: Precision của mô hình tốt nhất chỉ đạt ~53%, con số này có phải là quá thấp trong thực tế không?
* **Trả lời:**
  * Đây là **sự đánh đổi có chủ đích (Trade-off)** giữa Precision và Recall.
  * Trong bài toán giữ chân khách hàng (Customer Retention):
    * **Hậu quả của False Negative (Bỏ sót khách churn):** Khách hàng hủy mạng, doanh nghiệp mất toàn bộ giá trị vòng đời khách hàng (Customer Lifetime Value - LTV hàng nghìn USD).
    * **Hậu quả của False Positive (Báo nhầm khách churn):** Doanh nghiệp chỉ tốn một chi phí rất nhỏ để gửi email chăm sóc, tặng voucher giảm giá cước hoặc gọi điện hỏi thăm.
  * Vì chi phí $C_{\text{FN}} \gg C_{\text{FP}}$, nhóm ưu tiên tối đa **Recall đạt trên 80%** thay vì đánh đổi để lấy Precision cao ảo mà bỏ lọt khách hàng.

### Câu 4: Làm thế nào nhóm đảm bảo mô hình không bị Data Leakage khi đưa vào phục vụ API?
* **Trả lời:**
  * Nhóm sử dụng cơ chế đóng gói hoàn chỉnh bằng `Pipeline(steps=[('preprocessor', ColumnTransformer), ('classifier', XGBClassifier)])`.
  * Toàn bộ các giá trị trung bình $\mu$, độ lệch chuẩn $\sigma$ và danh mục One-Hot chỉ được tính toán bằng phương thức `.fit()` duy nhất trên tập `X_train`.
  * Khi xuất ra file `.joblib`, đối tượng pipeline đã "đóng băng" toàn bộ tham số này. Khi API nhận một JSON mẫu mới từ người dùng, nó gọi trực tiếp `.predict_proba()` trên pipeline đã đóng băng, loại bỏ hoàn toàn khả năng tính toán lại thông số dựa trên dữ liệu suy luận.

### Câu 5: Sự khác biệt bản chất giữa Random Forest và XGBoost trong bài toán này là gì?
* **Trả lời:**
  * **Random Forest (Bagging):** Huấn luyện song song nhiều cây độc lập, mỗi cây học trên một tập con lấy mẫu có hoàn lại (bootstrap). Kết quả dự đoán dựa trên bầu chọn số đông (majority voting) nhằm **giảm phương sai (variance)**.
  * **XGBoost (Boosting):** Huấn luyện tuần tự các cây. Cây sau học trực tiếp từ phần dư (residual errors) và gradient bậc một, bậc hai của các cây trước để **giảm độ chệch (bias)**. XGBoost kết hợp thêm chính quy hóa (L1/L2 regularization) giúp kiểm soát overfitting tốt hơn, từ đó đạt ROC-AUC cao nhất trong các mô hình thử nghiệm.

# Tài Liệu Nguồn Cho NotebookLM Thiết Kế Slide Đồ Án

> **Hướng dẫn sử dụng:**
> 1. Tải file này (hoặc copy toàn bộ nội dung bên dưới) đưa vào **NotebookLM** làm nguồn (Source).
> 2. Chọn tính năng tạo Slide / Outline hoặc dán thêm **Prompt gợi ý** ở cuối file để NotebookLM xuất dàn ý slide đúng nhịp thuyết trình 5 phút.

---

## Slide 1: Giới Thiệu Đề Tài & Định Nghĩa Bài Toán
- **Bối cảnh:** Doanh nghiệp viễn thông cần phát hiện sớm khách hàng có nguy cơ hủy dịch vụ để nhân viên CSKH chủ động giữ chân kịp thời.
- **Định nghĩa bài toán Machine Learning:**
  - Học có giám sát (Supervised Learning) — Phân loại nhị phân (Binary Classification):
    - $y = 1$: Khách hàng rời bỏ dịch vụ (Churn).
    - $y = 0$: Khách hàng tiếp tục gắn bó (Retain).
- **Bộ dữ liệu:** Telco Customer Churn (7,043 khách hàng, 21 thuộc tính ban đầu; loại bỏ `customerID` còn 19 đặc trưng đầu vào và 1 nhãn mục tiêu).
- **Phạm vi sản phẩm:** Không chỉ dừng ở thực nghiệm trên Jupyter Notebook, dự án triển khai thành REST API (FastAPI), tích hợp giải thích TreeSHAP và giao diện web ChurnGuard.

---

## Slide 2: Khám Phá Dữ Liệu (EDA) & Tiền Xử Lý Chống Data Leakage
- **3 Vấn đề dữ liệu & Cách xử lý:**
  1. **Dữ liệu khuyết ngầm (`TotalCharges`):** 11 dòng chứa chuỗi rỗng `" "`, tất cả đều là khách hàng mới (`tenure = 0`, chưa phát sinh hóa đơn tích lũy). Không xóa bỏ mà ép kiểu số và điền `0.0` để bảo toàn đủ 7,043 mẫu.
  2. **16 Biến phân loại (Categorical):** Dùng `OneHotEncoder(handle_unknown="ignore")` chuyển thành 43 cột nhị phân `0/1`, tránh áp đặt thứ bậc toán học sai lệch như Label Encoding.
  3. **Chênh lệch thang đo ở 3 biến số:** `tenure` (0–72 tháng), `MonthlyCharges`, `TotalCharges` (lên tới >8,600) được chuẩn hóa về Z-score ($\mu = 0, \sigma = 1$) bằng `StandardScaler`.
- **Chống rò rỉ dữ liệu (Data Leakage):**
  - Chia dữ liệu **Stratified 80/20**: 5,634 mẫu Train / 1,409 mẫu Test (giữ nguyên tỷ lệ Churn).
  - Đóng gói toàn bộ `ColumnTransformer` + Mô hình vào `scikit-learn Pipeline`, chỉ `.fit()` trên tập Train rồi đóng băng thành file `.joblib`.
- **Gợi ý hình ảnh minh họa:** Biểu đồ phân phối nhãn Churn, EDA theo `tenure`/`Contract`, và so sánh phân phối trước–sau `StandardScaler`.

---

## Slide 3: Xử Lý Mất Cân Bằng Lớp & Lựa Chọn Chỉ Số Đánh Giá
- **Thực trạng mất cân bằng lớp:** Lớp Churn chiếm ~26.5%, lớp Retain chiếm ~73.5% (tỷ lệ ~1:3).
- **Giải pháp Cost-sensitive Learning:**
  - Điều chỉnh trọng số trực tiếp trong hàm mất mát: `scale_pos_weight ≈ 2.77` cho XGBoost và `class_weight="balanced"` cho Logistic Regression, Random Forest, LightGBM.
  - Mục đích: Phạt nặng hơn khi mô hình bỏ sót ca Churn.
- **Chỉ số đánh giá ưu tiên:**
  - Ưu tiên **Recall** và **ROC-AUC** thay vì Accuracy, vì bỏ sót một khách hàng rời bỏ (False Negative) gây thiệt hại lớn hơn nhiều so với gửi nhầm ưu đãi giữ chân (False Positive).

---

## Slide 4: Kết Quả Benchmark 4 Mô Hình & Chọn Mô Hình Tối Ưu
- **So sánh trên tập kiểm thử (1,409 mẫu: 1,035 Retain, 374 Churn):**

| Thuật toán | Accuracy | Precision | **Recall** | F1-Score | **ROC-AUC** |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **XGBoost (Mô hình chọn)** | 75.80% | 52.91% | **80.21%** | **0.6376** | **0.8435** |
| Logistic Regression | 73.81% | 50.43% | 78.34% | 0.6136 | 0.8415 |
| Random Forest | 76.01% | 53.31% | 77.54% | 0.6318 | 0.8414 |
| LightGBM | 75.80% | 52.99% | 78.07% | 0.6314 | 0.8414 |

- **Kết luận:** **XGBoost** đạt **ROC-AUC cao nhất (0.8435)** và **Recall cao nhất (80.21%)** — phát hiện đúng **300 / 374** khách hàng thực sự rời bỏ (chỉ bỏ sót 74 ca).
- **Gợi ý hình ảnh minh họa:** Đường cong ROC của 4 mô hình và Ma trận nhầm lẫn (Confusion Matrix) của XGBoost.

---

## Slide 5: Giải Thích Mô Hình Với TreeSHAP (Explainable AI)
- **Từ "Hộp đen" sang minh bạch:** Tích hợp **TreeSHAP** (`pred_contribs=True` của XGBoost) cả trong Notebook nghiên cứu lẫn Backend API.
- **Global Explainability (SHAP Beeswarm Plot):** Xác định các yếu tố tác động mạnh nhất trên toàn tập kiểm thử:
  - Tăng rủi ro Churn: Hợp đồng theo tháng (`Month-to-month`), thời gian gắn bó ngắn (`tenure` thấp), dịch vụ cáp quang (`Fiber optic`), thanh toán qua `Electronic check`, thiếu gói `TechSupport` / `OnlineSecurity`.
  - Giảm rủi ro Churn: Hợp đồng dài hạn (1 năm / 2 năm), `tenure` cao.
- **Local Explainability (SHAP Waterfall Plot):** Giải thích cụ thể cho từng khách hàng riêng lẻ (ví dụ ca rủi ro cao nhất tập Test có xác suất Churn 97.00%), giúp nhân viên CSKH biết lý do để tư vấn đúng trọng tâm.

---

## Slide 6: Kiến Trúc REST API (Input & Output) & Triển Khai
- **API Endpoints (`FastAPI` + `Pydantic V2`):** `GET /health`, `POST /api/v1/predict` (đơn lẻ) và `POST /api/v1/predict/batch` (hàng loạt), tích hợp Swagger UI (`/docs`).
- **Input (Request JSON):** 19 đặc trưng khách hàng, tự động validate kiểu dữ liệu, giá trị hợp lệ và chặn số âm (`422` nếu sai định dạng).
- **Output (Response JSON):**
  - `churn_prediction` (`Churn`/`Retain`), `churn_probability` (`0.0–1.0`), `risk_level` (**Low < 0.35**, **Medium 0.35–0.65**, **High ≥ 0.65**).
  - `top_factors` (Top 6 yếu tố TreeSHAP + chiều `increase`/`decrease`), `recommendation` (gợi ý giữ chân theo luật nghiệp vụ) và `model_version`.
- **Kiểm thử & Triển khai:** Kiểm thử tự động bằng `pytest` (6/6 passed), CI qua GitHub Actions, đóng gói Docker và deploy trên Render.


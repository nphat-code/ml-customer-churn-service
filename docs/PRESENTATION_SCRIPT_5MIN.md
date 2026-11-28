# Kịch Bản Lời Nói Theo Từng Slide (5 Phút)

> **Chuẩn bị trước khi trình bày:**
> - Mở sẵn link web Vercel (`https://ml-customer-churn-service.vercel.app`) trước 1–2 phút để Backend Render thức dậy.
> - Mở sẵn bộ 6 slide (khớp với [NOTEBOOKLM_SLIDE_CONTENT.md](NOTEBOOKLM_SLIDE_CONTENT.md)).

---

## Slide 1: Giới thiệu đề tài & Định nghĩa bài toán *(~30 giây)*

> *"Em chào thầy/cô, hôm nay em xin trình bày đồ án **Dự đoán khách hàng rời bỏ dịch vụ viễn thông (Customer Churn Prediction)**.*
>
> *Đây là bài toán phân loại nhị phân trên tập dữ liệu Telco 7,043 khách hàng, nhằm phát hiện sớm nhóm có nguy cơ rời bỏ để CSKH giữ chân kịp thời. Ngoài việc huấn luyện và so sánh mô hình trên Notebook, em đã đóng gói thành dịch vụ REST API kèm giải thích XAI và giao diện web để sử dụng thực tế."*

---

## Slide 2: Khám phá dữ liệu & Tiền xử lý chống Data Leakage *(~50 giây)*

> *"Về dữ liệu và tiền xử lý, em giải quyết 3 vấn đề chính:*
>
> *Thứ nhất, cột `TotalCharges` có 11 dòng chứa chuỗi rỗng — thực chất là khách hàng mới (`tenure = 0`), chưa phát sinh hóa đơn tích lũy, nên em không xóa mà điền `0.0` để giữ đủ 7,043 mẫu.*
>
> *Thứ hai, 16 biến phân loại được mã hóa bằng `OneHotEncoder` thành 43 cột nhị phân để tránh áp đặt thứ tự giả, còn 3 biến số được chuẩn hóa bằng `StandardScaler` để đồng bộ thang đo.*
>
> *Thứ ba, em chia dữ liệu Stratified 80/20 và đóng gói toàn bộ bước biến đổi vào `ColumnTransformer` + `Pipeline`, chỉ `.fit()` trên tập Train rồi đóng băng thành file `.joblib` để chống Data Leakage."*

---

## Slide 3: Xử lý mất cân bằng lớp & Lựa chọn độ đo *(~35 giây)*

> *"Tập dữ liệu bị mất cân bằng với khoảng 26.5% khách hàng rời bỏ. Để xử lý, em dùng Cost-sensitive Learning (`scale_pos_weight ≈ 2.77` cho XGBoost và `class_weight='balanced'` cho các mô hình còn lại) nhằm phạt nặng hơn khi bỏ sót nhóm Churn mà vẫn giữ nguyên phân phối dữ liệu thật.*
>
> *Về độ đo, vì bỏ sót một khách rời bỏ gây thiệt hại lớn hơn nhiều so với gửi nhầm ưu đãi giữ chân, em ưu tiên **Recall** và **ROC-AUC** thay vì Accuracy."*

---

## Slide 4: Kết quả Benchmark 4 mô hình & Chọn mô hình tối ưu *(~40 giây)*

> *"Em thử nghiệm 4 thuật toán trên cùng tập kiểm thử gồm 1,409 mẫu: Logistic Regression, Random Forest, LightGBM và XGBoost.*
>
> *Kết quả cho thấy **XGBoost** vượt trội nhất với **ROC-AUC đạt 0.8435** và **Recall đạt 80.21%** — tức phát hiện đúng **300 trên 374** khách hàng thực tế rời bỏ, chỉ bỏ sót 74 ca. Vì vậy, em chọn XGBoost làm mô hình chính thức cho hệ thống."*

---

## Slide 5: Giải thích mô hình với TreeSHAP (XAI) *(~40 giây)*

> *"Để mô hình không phải là hộp đen, em tích hợp **TreeSHAP** cả trong Notebook lẫn Backend API.*
>
> *Ở mức toàn cục (Beeswarm), các yếu tố đẩy rủi ro rời bỏ tăng mạnh nhất là hợp đồng theo tháng, thời gian gắn bó ngắn, dùng cáp quang, thanh toán qua Electronic check và thiếu gói hỗ trợ kỹ thuật.*
>
> *Ở mức cục bộ (Waterfall), hệ thống chỉ ra được lý do cụ thể cho từng khách hàng riêng lẻ — ví dụ ca rủi ro cao nhất tập Test đạt 97% — giúp nhân viên CSKH biết chính xác cần tư vấn gì."*

---

## Slide 6: Kiến trúc hệ thống & Demo ứng dụng thực tế *(~1 phút 45 giây — kết hợp demo)*

> *"Cuối cùng, em triển khai mô hình thành hệ thống End-to-End gồm Backend **FastAPI** và giao diện **React** cho nhân viên CSKH (đã deploy lên Render và Vercel).*
>
> *(Chuyển sang màn hình web demo):*
> - *Khi chọn 1 hồ sơ khách hàng, hệ thống trả về ngay xác suất rời bỏ, phân tầng rủi ro, biểu đồ các yếu tố SHAP và gợi ý giữ chân tự động bằng tiếng Việt.*
> - *Ở phần mô phỏng What-If, khi thử chuyển khách từ hợp đồng theo tháng sang 1 năm hoặc tặng hỗ trợ kỹ thuật, xác suất rời bỏ giảm ngay theo thời gian thực.*
> - *Với quản lý, tab Phân tích hàng loạt cho phép tải file CSV để thống kê tổng doanh thu có nguy cơ thất thoát, lọc nhóm rủi ro cao và xuất danh sách ưu tiên.*
>
> *Toàn bộ dự án đã có kiểm thử tự động bằng `pytest` (6/6 passed), CI trên GitHub Actions và đóng gói Docker Compose. Em xin kết thúc phần trình bày và rất mong nhận được góp ý từ thầy/cô ạ."*

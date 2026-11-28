# Kịch Bản Trình Bày Bằng Lời (5 Phút)

> **Lưu ý chuẩn bị trước khi lên trình bày:**
> - Bật sẵn Backend (`py -3.10 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`) và Frontend (`cd frontend; npm run dev`).
> - Mở sẵn 2 tab trên trình duyệt/màn hình:
>   1. Notebook [customer_churn_experiments.ipynb](../notebooks/customer_churn_experiments.ipynb) (hoặc thư mục `docs/images/`).
>   2. Giao diện Demo tại `http://localhost:5173`.

---

## 0:00 – 0:30 (30 giây) | Đặt vấn đề & Mục tiêu

> *"Em chào thầy/cô, hôm nay em xin trình bày đồ án **Dự đoán khách hàng rời bỏ mạng viễn thông (Customer Churn Prediction)**.*
>
> *Đây là bài toán phân loại nhị phân trên tập dữ liệu Telco gồm 7,043 khách hàng. Trong ngành viễn thông, chi phí tìm kiếm một khách hàng mới cao gấp 5 đến 7 lần chi phí giữ chân khách hàng cũ. Vì vậy, mục tiêu của em không chỉ dừng lại ở việc huấn luyện mô hình trên Jupyter Notebook, mà đóng gói thành một hệ thống End-to-End hoàn chỉnh: có REST API, có giải thích mô hình XAI và giao diện web để nhân viên chăm sóc khách hàng sử dụng được ngay."*

---

## 0:30 – 1:45 (1 phút 15 giây) | Dữ liệu & Chống Data Leakage

*(Mở nhanh Notebook Phần 1 & 2 hoặc các biểu đồ `01`, `02`, `03` trong `docs/images/`)*

> *"Về phần dữ liệu và tiền xử lý, em xử lý 3 vấn đề chính của tập dữ liệu gốc:*
>
> *Thứ nhất, cột `TotalCharges` có 11 dòng chứa chuỗi rỗng. Qua kiểm tra, cả 11 dòng này đều ứng với khách hàng mới có `tenure = 0`, chưa phát sinh kỳ thanh toán tích lũy. Thay vì xóa bỏ, em ép kiểu số và điền `0.0` để bảo toàn đủ 7,043 mẫu và khớp với dữ liệu khách mới ngoài thực tế.*
>
> *Thứ hai, với 16 biến phân loại, em dùng `OneHotEncoder` để tránh áp đặt thứ tự toán học giả lên các biến định danh như loại hợp đồng hay phương thức thanh toán; còn 3 biến số (`tenure`, `MonthlyCharges`, `TotalCharges`) được đưa qua `StandardScaler` để đồng bộ thang đo.*
>
> *Thứ ba, để chống rò rỉ dữ liệu (Data Leakage), em đóng gói toàn bộ bước tiền xử lý vào `ColumnTransformer` và `Pipeline` của `scikit-learn`. Pipeline chỉ `.fit()` trên tập Train 80% rồi đóng băng thành file `.joblib` để phục vụ dự đoán."*

---

## 1:45 – 3:15 (1 phút 30 giây) | Xử lý lệch lớp, Benchmark & TreeSHAP

*(Mở nhanh biểu đồ `04_roc_curves_comparison.png`, `05_confusion_matrix_feature_importance.png` và Phần 4.3 TreeSHAP ở cuối Notebook)*

> *"Tập dữ liệu bị mất cân bằng lớp với khoảng 26.5% khách hàng rời bỏ. Để xử lý, em dùng Cost-sensitive Learning (`scale_pos_weight ≈ 2.76` cho XGBoost và `class_weight='balanced'` cho các mô hình còn lại) nhằm phạt nặng hơn khi mô hình bỏ sót nhóm Churn mà vẫn giữ nguyên phân phối dữ liệu thật.*
>
> *Về độ đo, vì bỏ sót một khách rời bỏ gây thiệt hại doanh thu lớn hơn nhiều so với gửi nhầm một ưu đãi giữ chân, em ưu tiên **Recall** và **ROC-AUC** thay vì Accuracy. Khi benchmark 4 thuật toán (Logistic Regression, Random Forest, LightGBM và XGBoost), **XGBoost** cho kết quả tốt nhất với **Recall đạt 80.21%** — bắt đúng 300 trên 374 khách hàng rời bỏ ở tập kiểm thử — và **ROC-AUC đạt 0.8435**.*
>
> *Ngoài Feature Importance tổng thể, em tích hợp thêm **TreeSHAP** (biểu đồ Beeswarm và Waterfall) để giải thích minh bạch yếu tố nào đang đẩy rủi ro rời bỏ của từng khách hàng lên cao — ví dụ hợp đồng theo tháng, thời gian gắn bó ngắn, hay thanh toán qua Electronic check."*

---

## 3:15 – 4:45 (1 phút 30 giây) | Demo trực tiếp hệ thống End-to-End

*(Chuyển sang tab trình duyệt `http://localhost:5173`)*

> *"Bây giờ em xin demo nhanh hệ thống thực tế:*
>
> *(1. Bấm chọn 1 hồ sơ mẫu rủi ro cao)* — *Khi nhân viên CSKH chọn hoặc nhập thông tin một khách hàng, hệ thống gọi FastAPI và trả về ngay xác suất rời bỏ, phân tầng rủi ro, biểu đồ các yếu tố tác động chính từ TreeSHAP, cùng gợi ý giữ chân tự động bằng tiếng Việt nghiệp vụ.*
>
> *(2. Ở phần mô phỏng What-If, đổi Hợp đồng từ Theo tháng sang 1 năm hoặc bật Hỗ trợ kỹ thuật)* — *Nhân viên CSKH cũng có thể mô phỏng kịch bản can thiệp: khi thử chuyển khách hàng sang hợp đồng 1 năm và tặng hỗ trợ kỹ thuật, thầy/cô có thể thấy xác suất rời bỏ giảm ngay theo thời gian thực.*
>
> *(3. Chuyển sang tab Phân tích hàng loạt, chạy dữ liệu CSV mẫu)* — *Với quản lý kinh doanh, hệ thống hỗ trợ tải lên file CSV danh sách nhiều khách hàng cùng lúc, tính tổng doanh thu tháng có nguy cơ thất thoát, lọc nhanh nhóm rủi ro cao và xuất ra file CSV ưu tiên cho đội CSKH chăm sóc."*

---

## 4:45 – 5:00 (15 giây) | Chốt tổng kết

> *"Toàn bộ hệ thống đã được viết test tự động bằng `pytest`, kiểm tra qua GitHub Actions CI và đóng gói chạy đồng thời Backend–Frontend bằng Docker Compose. Em xin kết thúc phần trình bày tại đây và rất mong nhận được câu hỏi góp ý từ thầy/cô ạ."*


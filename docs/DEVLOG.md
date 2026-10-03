# 📅 Project DevLog — Nhật Ký Phát Triển Dự Án

File nhật ký theo dõi tiến trình thực hiện đồ án Customer Churn Prediction Service theo từng mốc thời gian thực tế, liên kết với các commit trên GitHub.

---

### 🗓️ [2026-10-03] — Đối chiếu yêu cầu môn học, hoàn thiện lý thuyết toán học & Hệ thống hóa Nhật ký

* **Nội dung công việc:**
  - **Lý thuyết mô hình:** Đào sâu bản chất toán học của thuật toán Logistic Regression: mô hình GLM, hàm liên kết Logit, hàm Sigmoid và tính chất đạo hàm vi phân, hàm mất mát Binary Cross-Entropy (chứng minh tính lồi ngặt so với MSE), ma trận Hessian xác định dương, thuật toán tối ưu Quasi-Newton L-BFGS, và ý nghĩa Odds Ratio trong bài toán churn.
  - **Định hướng đồ án:** Phân tích kỹ nội dung file `note.txt` (cơ cấu điểm 10-40-50, 3 Hợp phần: Backend REST API, Frontend Demo UI, Jupyter Notebooks).
  - **Quản lý tiến độ:** Cập nhật bảng đối chiếu công việc ĐÃ LÀM và CẦN LÀM vào `docs/PLAN.md`.
  - **Hệ thống hóa nhật ký:** Tạo mới `docs/EXPERIMENTS.md` (lưu vết 4 thử nghiệm mô hình theo yêu cầu môn học) và `docs/DEVLOG.md` (nhật ký tiến độ phát triển).
* **Git Commits:**
  - `f0e7cc7` — `docs: enrich mathematical theory and optimization details for Logistic Regression`
  - `cfeb7ec` — `docs: align project plan with course requirements and track tasks`
* **Vấn đề gặp phải & Giải pháp:**
  - *Vấn đề:* Shell Windows PowerShell không nhận cú pháp nối lệnh `&&` của Bash.
  - *Giải pháp:* Chuyển đổi sang dấu chấm phẩy `;` khi thực thi chuỗi lệnh git trong PowerShell.
* **Kế hoạch tiếp theo:**
  - Xây dựng Jupyter Notebook hoàn chỉnh: `notebooks/customer_churn_experiments.ipynb` phục vụ Project 3.
  - Xây dựng giao diện Streamlit tương tác người dùng phục vụ Project 2.

---

### 🗓️ [2026-09-27] — Hoàn thiện tài liệu thuyết trình, phản biện & Phân tích chuyên sâu tiền xử lý

* **Nội dung công việc:**
  - **Tài liệu thuyết trình:** Xây dựng `docs/PRESENTATION_NOTES.md` bao gồm dàn ý thuyết trình 10 phút, kịch bản demo API và bộ câu hỏi phản biện bảo vệ đồ án kèm câu trả lời mẫu.
  - **Kiến thức tiền xử lý:**
    - Chứng minh toán học kỳ vọng $E[z]=0$ và phương sai $\text{Var}(z)=1$ của phép biến đổi `StandardScaler`.
    - Phân tích hiện tượng *Scale Dominance*, *Ill-conditioned optimization* và sự bất công của Regularization khi không scale `TotalCharges`.
    - Phân tích bản chất trực giao hình học và cơ chế ghép nối vector cố định tọa độ của `OneHotEncoder`.
  - **Benchmark:** Xuất dữ liệu benchmark dạng JSON có cấu trúc vào `docs/model_benchmark.json`.
* **Git Commits:**
  - `cd1340a` — `docs: add benchmark results and httpx test dependency`
  - `279322d` — `docs: add project plan and progress tracking`
  - `d7b6f0b` — `docs: add ML knowledge notes for study reference`
  - `3d71683`, `6c59925`, `3a5df0b`, `0834d39`, `1cf59c6`, `ccdb5fa`.
* **Vấn đề gặp phải & Giải pháp:**
  - *Vấn đề:* Kiểm thử `TestClient` thiếu thư viện `httpx`.
  - *Giải pháp:* Đã bổ sung `httpx>=0.27.0` vào `requirements.txt` và cài đặt môi trường.

---

### 🗓️ [2026-09-26] — Khởi tạo nền tảng dự án, Huấn luyện mô hình & Triển khai FastAPI Service

* **Nội dung công việc:**
  - **Kiến trúc dự án:** Thiết lập cấu trúc thư mục chuẩn (`src/`, `app/`, `data/`, `models/`, `notebooks/`, `docs/`, `tests/`), cấu hình `.gitignore`, `requirements.txt`, và quy tắc phát triển trong `AGENTS.md`.
  - **Data Pipeline:** Xây dựng module đọc dữ liệu `src/data_loader.py`, xử lý chuỗi rỗng của `TotalCharges`, chia tập Stratified 80/20. Xây dựng `src/pipeline.py` với `ColumnTransformer`.
  - **Huấn luyện mô hình:** Viết script tự động `src/train.py` huấn luyện và đánh giá 4 mô hình: Logistic Regression, Random Forest, LightGBM, và XGBoost. Xử lý mất cân bằng qua `scale_pos_weight` và `class_weight="balanced"`.
  - **Model Selection & Export:** XGBoost đạt Recall 0.8021 và ROC-AUC 0.8435 cao nhất $\rightarrow$ serialize pipeline đầy đủ vào `models/best_churn_pipeline.joblib`.
  - **REST API (FastAPI):**
    - `app/schemas.py`: Định nghĩa input/output validation bằng Pydantic.
    - `app/service.py`: Service inference, phân tầng rủi ro (Low/Medium/High), khuyến nghị hành động.
    - `app/main.py`: Khai báo endpoints `/`, `/health`, `/api/v1/predict` và Swagger UI.
  - **Automated Testing:** Viết bộ test `tests/test_api.py` với `pytest` kiểm thử 4 kịch bản API, kết quả 4/4 passed.
* **Git Commits:**
  - `9e1e997` — `feat: initialize customer churn prediction ML project structure and docs`
  - `8484552` — `feat: setup project rules, ml pipeline, and fastapi service structure`

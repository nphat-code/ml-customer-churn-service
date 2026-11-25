# Project Rules & Guidelines

1. **Không comment trong code:**
   - Không viết chú thích (comments `#` hoặc docstrings giải thích thừa thãi) trong code trừ khi thật sự bắt buộc về mặt cú pháp.
   - Code phải tự tường minh qua cách đặt tên biến, hàm và cấu trúc rõ ràng.

2. **Quy trình Git (Bắt buộc tự động):**
   - Sau khi hoàn thành và kiểm thử pass bất kỳ phần/module nào (dữ liệu, train mô hình, Backend API, Frontend UI, Notebooks, tests, docs), **bắt buộc phải tự động `git add`, `git commit` và `git push` lên GitHub ngay lập tức** mà không cần chờ người dùng nhắc lại.
   - Commit message rõ ràng theo chuẩn Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

3. **Tiêu chuẩn ghi chép tài liệu (`docs/NOTES.md`):**
   - Chỉ ghi chép kiến thức chuyên sâu, cốt lõi: toán học, bản chất thuật toán Machine Learning, trade-offs kỹ thuật và kiến trúc hệ thống.
   - Tuyệt đối không ghi chép các thông tin vụn vặt, dịch thuật từ vựng tiếng Anh cơ bản (như dịch nghĩa tên cột) hoặc các nội dung hiển nhiên.

4. **Thiết kế giao diện hướng người dùng cuối (End-User First UI):**
   - Web UI (`frontend/`) phục vụ nhân viên CSKH và kinh doanh, sử dụng 100% ngôn ngữ nghiệp vụ tự nhiên, dễ hiểu.
   - Không hiển thị các chi tiết kỹ thuật thô lên màn hình làm việc (như đường dẫn API `/api/...`, tên thuật toán/pipeline nội bộ, chỉ số log-odds SHAP thô hay bảng benchmark mô hình — các nội dung kỹ thuật này thuộc về `notebooks/` và `docs/`).

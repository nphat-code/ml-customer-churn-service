# Đặc Tả Kỹ Thuật REST API (API Specification)
## Customer Churn Prediction Service

Dịch vụ cung cấp REST API cho các hệ thống bên ngoài gọi để dự đoán xác suất khách hàng rời bỏ dịch vụ viễn thông.

---

### 1. Thông tin chung
* **Base URL:** `http://localhost:8000`
* **Interactive Docs (Swagger UI):** `http://localhost:8000/docs`
* **Alternative Docs (ReDoc):** `http://localhost:8000/redoc`

---

### 2. Danh sách Endpoints

#### `GET /health`
Kiểm tra trạng thái sẵn sàng của dịch vụ và mô hình đã được tải vào bộ nhớ hay chưa.

* **Response (200 OK):**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "1.0.0"
}
```

---

#### `POST /api/v1/predict`
Dự đoán nguy cơ rời bỏ của một khách hàng cụ thể.

* **Request Headers:**
  * `Content-Type: application/json`

* **Request Body Example:**
```json
{
  "gender": "Female",
  "senior_citizen": 0,
  "partner": "Yes",
  "dependents": "No",
  "tenure": 12,
  "phone_service": "Yes",
  "multiple_lines": "No",
  "internet_service": "Fiber optic",
  "online_security": "No",
  "online_backup": "Yes",
  "device_protection": "No",
  "tech_support": "No",
  "streaming_tv": "Yes",
  "streaming_movies": "No",
  "contract": "Month-to-month",
  "paperless_billing": "Yes",
  "payment_method": "Electronic check",
  "monthly_charges": 85.5,
  "total_charges": 1026.0
}
```

* **Response (200 OK):**
```json
{
  "prediction": "Churn",
  "churn_probability": 0.742,
  "risk_level": "High",
  "recommendation": "Khách hàng có nguy cơ rời bỏ cao do dùng hợp đồng Month-to-month và thiếu gói Tech Support. Đề xuất ưu đãi nâng cấp lên hợp đồng 1 năm."
}
```

* **Error Responses:**
  * `422 Unprocessable Entity`: Dữ liệu đầu vào sai kiểu dữ liệu hoặc thiếu trường bắt buộc.
  * `500 Internal Server Error`: Lỗi xử lý nội bộ của mô hình suy luận.

---

#### `POST /api/v1/predict/batch`
Dự đoán nguy cơ rời bỏ cho danh sách nhiều khách hàng cùng lúc.

# Kịch Bản Test API (Thunder Client / Swagger UI)

Danh sách các JSON payload mẫu để gửi trực tiếp vào `POST /api/v1/predict` (Local: `http://localhost:8000/api/v1/predict` hoặc Render: `https://<url-render>/api/v1/predict`).

---

## 1. Khách hàng mới — Rủi ro cao (`High Risk` / `Churn`)
```json
{
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "No",
  "tenure": 12,
  "PhoneService": "Yes",
  "MultipleLines": "No",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No",
  "OnlineBackup": "Yes",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "Yes",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 85.5,
  "TotalCharges": 1026.0
}
```

---

## 2. Khách hàng trung thành (`Low Risk` / `Retain`)
*(Gắn bó 60 tháng, hợp đồng 2 năm, thanh toán tự động, đủ gói bảo mật & hỗ trợ)*
```json
{
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "Yes",
  "tenure": 60,
  "PhoneService": "Yes",
  "MultipleLines": "Yes",
  "InternetService": "DSL",
  "OnlineSecurity": "Yes",
  "OnlineBackup": "Yes",
  "DeviceProtection": "Yes",
  "TechSupport": "Yes",
  "StreamingTV": "Yes",
  "StreamingMovies": "No",
  "Contract": "Two year",
  "PaperlessBilling": "No",
  "PaymentMethod": "Credit card (automatic)",
  "MonthlyCharges": 68.5,
  "TotalCharges": 4110.0
}
```

---

## 3. Khách hàng nhóm cân nhắc (`Medium Risk`)
*(Đã dùng 14 tháng, có OnlineSecurity nhưng hợp đồng tháng, thanh toán điện tử, thiếu TechSupport)*
```json
{
  "gender": "Male",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "No",
  "tenure": 14,
  "PhoneService": "Yes",
  "MultipleLines": "Yes",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "Yes",
  "OnlineBackup": "No",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "No",
  "StreamingMovies": "No",
  "Contract": "Month-to-month",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 79.85,
  "TotalCharges": 1117.9
}
```

---

## 4. Trường hợp biên: Khách mới tháng đầu (`tenure = 0`, không dùng Internet)
*(Tương ứng 11 dòng `TotalCharges` rỗng trong tập dữ liệu)*
```json
{
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "No",
  "Dependents": "No",
  "tenure": 0,
  "PhoneService": "Yes",
  "MultipleLines": "No",
  "InternetService": "No",
  "OnlineSecurity": "No internet service",
  "OnlineBackup": "No internet service",
  "DeviceProtection": "No internet service",
  "TechSupport": "No internet service",
  "StreamingTV": "No internet service",
  "StreamingMovies": "No internet service",
  "Contract": "Two year",
  "PaperlessBilling": "No",
  "PaymentMethod": "Mailed check",
  "MonthlyCharges": 20.25,
  "TotalCharges": 0.0
}
```

---

## 5. Test Validation Error (`422 Unprocessable Entity`)
*(Chứng minh Pydantic V2 chặn dữ liệu sai ở tầng API: `tenure` âm và `Contract` không hợp lệ)*
```json
{
  "gender": "Female",
  "SeniorCitizen": 0,
  "Partner": "Yes",
  "Dependents": "No",
  "tenure": -5,
  "PhoneService": "Yes",
  "MultipleLines": "No",
  "InternetService": "Fiber optic",
  "OnlineSecurity": "No",
  "OnlineBackup": "Yes",
  "DeviceProtection": "No",
  "TechSupport": "No",
  "StreamingTV": "Yes",
  "StreamingMovies": "No",
  "Contract": "Invalid-contract",
  "PaperlessBilling": "Yes",
  "PaymentMethod": "Electronic check",
  "MonthlyCharges": 85.5,
  "TotalCharges": 1026.0
}
```

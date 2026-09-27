# 📝 Ghi Chú Kiến Thức — Customer Churn Prediction

> File ghi lại các khái niệm, kỹ thuật ML và engineering quan trọng được áp dụng trong dự án.
> Mục đích: ôn tập, thuyết trình, và tra cứu nhanh.

---

## 1. Tổng quan bài toán

### Binary Classification (Phân loại nhị phân)

- Bài toán **Supervised Learning** — cần dữ liệu có nhãn (label) `Churn = Yes/No`.
- Mục tiêu: dự đoán xác suất khách hàng **rời bỏ dịch vụ** (churn) hay **ở lại** (retain).
- Nhãn được mã hóa: `Yes → 1` (Churn), `No → 0` (Retain).

### Tại sao Recall quan trọng hơn Accuracy?

- Dữ liệu **mất cân bằng** (imbalanced): khoảng 73% Retain vs 27% Churn.
- Nếu mô hình dự đoán tất cả là "Retain" → Accuracy vẫn đạt ~73% nhưng **hoàn toàn vô dụng**.
- **Recall (Sensitivity)** đo khả năng phát hiện đúng khách hàng sắp rời bỏ — bỏ sót 1 khách hàng churn (False Negative) tốn kém hơn nhiều so với báo nhầm 1 khách hàng retain (False Positive).

---

## 2. Tiền xử lý dữ liệu (Preprocessing)

### Xử lý Missing Values

```python
data["TotalCharges"] = pd.to_numeric(data["TotalCharges"].astype(str).str.strip(), errors="coerce")
data["TotalCharges"] = data["TotalCharges"].fillna(0.0)
```

- Cột `TotalCharges` trong CSV gốc chứa chuỗi rỗng `" "` cho khách hàng mới (tenure = 0).
- `pd.to_numeric(..., errors="coerce")`: chuyển giá trị không hợp lệ thành `NaN` thay vì raise error.
- `fillna(0.0)`: khách hàng mới chưa phát sinh cước → điền 0 là hợp lý về mặt business.

### Phân loại Feature

| Loại | Features | Cách xử lý |
| :--- | :--- | :--- |
| **Numerical** (biến số) | `tenure`, `MonthlyCharges`, `TotalCharges` | `StandardScaler` |
| **Categorical** (biến phân loại) | `gender`, `Contract`, `PaymentMethod`, ... (16 cột) | `OneHotEncoder` |

### StandardScaler

$$z = \frac{x - \mu}{\sigma}$$

#### 1. Bản chất toán học của $\mu$ và $\sigma$
* **Kỳ vọng / Trung bình mẫu ($\mu$):** Xác định trọng tâm của phân phối dữ liệu:
  $$\mu = \frac{1}{N} \sum_{i=1}^{N} x_i$$
* **Độ lệch chuẩn ($\sigma$ - Standard Deviation):** Đo mức độ phân tán của dữ liệu quanh giá trị trung bình $\mu$:
  $$\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (x_i - \mu)^2}$$
  *(Phần bên trong căn $\sigma^2$ là Phương sai - Variance; bình phương $(x_i - \mu)^2$ giúp triệt tiêu dấu âm và phạt nặng các điểm lệch xa tâm).*
* **Lưu ý kỹ thuật:** `scikit-learn`'s `StandardScaler` tính $\sigma$ với bậc tự do `ddof=0` (chia cho $N$, tổng thể), khác với `pandas.Series.std()` mặc định `ddof=1` (chia cho $N-1$, hiệu chỉnh Bessel cho mẫu).

#### 2. Ý nghĩa cốt lõi của $\text{mean} = 0$ và $\text{std} = 1$
*Lưu ý: $\text{mean} = 0$ và $\text{std} = 1$ là thuộc tính của tập giá trị mới $z$ **sau khi chuẩn hóa**, không phải của dữ liệu gốc.*

* **Chứng minh toán học:**
  * Kỳ vọng của biến chuẩn hóa $z$:
    $$E[z] = E\left[\frac{X - \mu}{\sigma}\right] = \frac{E[X] - \mu}{\sigma} = \frac{\mu - \mu}{\sigma} = \mathbf{0}$$
  * Phương sai của biến chuẩn hóa $z$:
    $$\text{Var}(z) = \text{Var}\left(\frac{X - \mu}{\sigma}\right) = \frac{1}{\sigma^2} \text{Var}(X - \mu) = \frac{\text{Var}(X)}{\sigma^2} = \frac{\sigma^2}{\sigma^2} = \mathbf{1} \implies \text{Std}(z) = 1$$
* **$\text{mean} = 0$ (Dời tâm về gốc tọa độ):** Biến số `0` trở thành cột mốc quy chiếu trung bình (baseline). Điểm có $z = 0$ đại diện cho mức trung bình của toàn bộ dữ liệu; $z > 0$ là cao hơn trung bình, $z < 0$ là thấp hơn trung bình.
* **$\text{std} = 1$ (Chuẩn hóa đơn vị đo):** Chia cho $\sigma$ giúp chuyển đổi mọi thang đo vật lý (tháng, USD) thành cùng một thước đo trừu tượng: **"khoảng cách lệch bao nhiêu lần $\sigma$"**. Điểm $z = +2$ nghĩa là cao hơn trung bình đúng $2\sigma$.
* **Quy tắc thực nghiệm $3\sigma$ & Phát hiện ngoại lai (Outlier Detection):** Đối với dữ liệu gần phân phối chuẩn, $99.7\%$ giá trị sẽ rơi vào đoạn $[-3, +3]$. Một mẫu có $|z| > 3$ được xem là ngoại lai hiếm gặp (xác suất $< 0.3\%$).
* Cần thiết cho các mô hình tuyến tính / gradient-based (Logistic Regression). Tree-based (XGBoost, RF) không bắt buộc nhưng dùng chung pipeline để đồng nhất kiến trúc benchmark.

#### ❓ Tại sao không scale thì biến có giá trị lớn (như TotalCharges) làm dự đoán bị lệch?

So sánh miền giá trị thực tế trong tập dữ liệu:
* `tenure`: $0 \rightarrow 72$ (tháng)
* `MonthlyCharges`: $18.25 \rightarrow 118.75$ (USD)
* `TotalCharges`: $0 \rightarrow 8,684.80$ (USD) — **lớn hơn hàng trăm lần!**

Nếu để nguyên không chuẩn hóa, 3 vấn đề nghiêm trọng sẽ xảy ra:
1. **Lấn át tín hiệu (Scale Dominance):** Trong tổ hợp tuyến tính $z = w_1 x_1 + w_2 x_2 + \dots$, số hạng $w_{\text{total}} \cdot X_{\text{total}}$ (hàng nghìn) sẽ áp đảo hoàn toàn các biến nhỏ (như `tenure` hay biến nhị phân 0/1 từ One-Hot), khiến mô hình gần như bỏ qua tiếng nói của các đặc trưng khác.
2. **Lệch bước nhảy Gradient (Ill-conditioned optimization):** Đạo hàm cập nhật trọng số tỉ lệ thuận với giá trị đầu vào ($\frac{\partial L}{\partial w} \propto x$). Biến quá lớn làm mặt phẳng mất mát (loss surface) bị kéo dẹt theo một chiều, gradient dao động dữ dội, mô hình học rất chậm, khó hội tụ hoặc rơi vào nghiệm cục bộ sai lệch.
3. **Bị phạt bất công bởi Regularization (L1/L2):** Các hàm phạt L1/L2 phạt đều mọi trọng số $w$ theo cùng một hệ số $\lambda$. Vì $x_{\text{total}}$ quá lớn nên chỉ cần $w_{\text{total}}$ rất nhỏ là đủ ảnh hưởng; ngược lại các biến có scale nhỏ cần $w$ lớn hơn thì lại bị penalty triệt tiêu về gần 0 một cách bất công.

### OneHotEncoder

Phương pháp chuyển đổi biến định danh (Categorical Features) thành các vector nhị phân $\{0, 1\}$ trong không gian vector nhiều chiều.

#### 1. Tại sao phải tách mỗi giá trị thành một Feature (cột) riêng?
* **Độc lập trọng số:** Cho phép mô hình học một hệ số tác động $w$ riêng biệt cho từng trạng thái danh mục:
  $$z = (w_{\text{Month}} \cdot x_{\text{Month}}) + (w_{\text{1Year}} \cdot x_{\text{1Year}}) + (w_{\text{2Year}} \cdot x_{\text{2Year}}) + \dots$$
  Mô hình có thể tự do gán trọng số dương cao cho gói hợp đồng rủi ro ($w_{\text{Month}} > 0$) và trọng số âm cho gói giữ chân khách ($w_{\text{2Year}} < 0$).
* **Hỗ trợ phân nhánh nhị phân (Binary Split):** Trong các thuật toán dạng cây (XGBoost, Random Forest), mỗi cột nhị phân cho phép cây đặt câu hỏi rẽ nhánh đơn giản và tối ưu: *"Có phải là Month-to-month hay không?"* (Đúng rẽ trái, Sai rẽ phải).

#### 2. Cơ chế nhị phân $\{0, 1\}$ và Tính trực giao (Orthogonality)
* **Cơ chế công tắc đóng/ngắt (Switching Mechanism):**
  * Giá trị `1` (Hot): Kích hoạt trọng số tương ứng cộng vào hàm dự đoán ($w \cdot 1 = w$).
  * Giá trị `0` (Cold): Triệt tiêu hoàn toàn ảnh hưởng của các trạng thái không được chọn ($w \cdot 0 = 0$).
* **Tính bình đẳng hình học (Bản chất trực giao):**
  Các vector mã hóa (như $[1, 0, 0], [0, 1, 0], [0, 0, 1]$) vuông góc từng đôi một trong không gian $\mathbb{R}^k$ (tích vô hướng $= 0$) và có khoảng cách Euclid bằng nhau giữa mọi cặp ($\sqrt{2}$). Điều này loại bỏ hoàn toàn sự áp đặt thứ bậc toán học sai lệch so với Label Encoding (0, 1, 2).

#### 3. Cơ chế ghép nối vector (Feature Concatenation & Fixed Coordinates)
Khi nhiều đặc trưng cùng sinh ra vector nhị phân giống nhau (ví dụ: `Contract` và `InternetService` đều có trạng thái sinh ra `[1, 0, 0]`), mô hình không bị nhầm lẫn nhờ cơ chế:
* **Nối tiếp cố định tọa độ:** Toàn bộ $43$ cột One-Hot cùng $3$ cột số được ghép thành một vector đặc trưng duy nhất có số chiều cố định $D = 46$.
* **Trọng số gắn với chỉ số cột (Index):** Số `1` ở cột `Contract_Month` (vị trí $i$) nhân với $w_i$, hoàn toàn tách biệt với số `1` ở cột `Internet_DSL` (vị trí $j$) nhân với $w_j$ ($w_i \neq w_j$).

#### 4. Cấu hình kỹ thuật trong dự án ([src/pipeline.py](file:///c:/Study/HK1Nam3/ML/Project/src/pipeline.py#L15-L19))
* `handle_unknown="ignore"`: Khi dữ liệu suy luận (inference qua API) xuất hiện giá trị danh mục mới lạ, encoder tự động gán vector toàn số `0` thay vì báo lỗi dừng hệ thống.
* `sparse_output=False`: Xuất trực tiếp dense numpy array thay vì ma trận thưa (sparse matrix), tối ưu cho quá trình xử lý của XGBoost và LightGBM.

### ColumnTransformer

```python
ColumnTransformer(transformers=[
    ("num", numerical_pipeline, NUMERICAL_FEATURES),
    ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
])
```

- Cho phép áp dụng **transformation khác nhau** cho từng nhóm cột trong cùng 1 bước.
- Tránh data leakage: fit trên train, chỉ transform trên test.

---

## 3. Xử lý Imbalanced Data (Mất cân bằng lớp)

### Vấn đề

- Tỷ lệ Churn chiếm ~27%, Retain chiếm ~73%.
- Mô hình có xu hướng thiên về lớp đa số → Recall thấp cho lớp thiểu số (Churn).

### Giải pháp sử dụng trong dự án

**`class_weight="balanced"`** (Logistic Regression, Random Forest, LightGBM):

$$w_i = \frac{N}{k \cdot n_i}$$

- $N$: tổng số mẫu, $k$: số lớp, $n_i$: số mẫu lớp $i$.
- Tự động tăng trọng số cho lớp thiểu số trong loss function.

**`scale_pos_weight`** (XGBoost):

```python
scale_pos_weight = count(negative) / count(positive)
```

- Tương đương `class_weight="balanced"` nhưng dành riêng cho XGBoost.
- Trong code: `scale_pos_weight=(len(y_train) - sum(y_train)) / sum(y_train)`.

### Các phương pháp khác (không dùng nhưng nên biết)

- **SMOTE**: Tạo mẫu tổng hợp cho lớp thiểu số bằng nội suy k-nearest neighbors.
- **Random Under-sampling**: Giảm mẫu lớp đa số.
- **Focal Loss**: Giảm trọng số cho mẫu dễ, tăng cho mẫu khó.

---

## 4. Các thuật toán ML

### Logistic Regression (Baseline)

- Mô hình tuyến tính: $P(y=1|X) = \sigma(w^T X + b)$, với $\sigma$ là sigmoid function.
- Ưu điểm: nhanh, giải thích được (coefficients cho biết feature nào tác động tích cực/tiêu cực).
- Hạn chế: giả định quan hệ tuyến tính giữa features và log-odds.
- `max_iter=1000`: tăng số vòng lặp tối ưu để đảm bảo hội tụ.

### Random Forest

- **Ensemble** của nhiều Decision Trees, mỗi cây train trên bootstrap sample khác nhau.
- Dự đoán bằng **majority voting** (classification).
- `n_estimators=150`: số cây trong rừng.
- `max_depth=8`: giới hạn độ sâu cây để tránh overfitting.
- `n_jobs=-1`: sử dụng tất cả CPU cores để train song song.

### XGBoost (eXtreme Gradient Boosting)

- **Gradient Boosting**: train các cây **tuần tự**, mỗi cây học từ **residual error** của cây trước.
- Tối ưu hóa: sử dụng cả first-order và **second-order gradient** (Newton's method).
- Regularization tích hợp: L1 (alpha) + L2 (lambda) trên leaf weights.
- `learning_rate=0.05`: tốc độ học thấp → mô hình học chậm nhưng ổn định hơn (cần nhiều cây hơn).
- `eval_metric="logloss"`: sử dụng binary cross-entropy làm hàm đánh giá.

### LightGBM (Light Gradient Boosting Machine)

- Cải tiến từ XGBoost: dùng **Gradient-based One-Side Sampling (GOSS)** và **Exclusive Feature Bundling (EFB)**.
- GOSS: giữ mẫu có gradient lớn (hard examples), sample mẫu có gradient nhỏ → tăng tốc training.
- EFB: gộp các features hiếm khi cùng non-zero → giảm số chiều.
- Tốc độ train nhanh hơn XGBoost đáng kể trên dữ liệu lớn.
- `verbose=-1`: tắt log output khi training.

---

## 5. Evaluation Metrics (Các chỉ số đánh giá)

### Confusion Matrix

```
                Predicted
              Retain  Churn
Actual Retain   TN     FP
       Churn    FN     TP
```

| Thuật ngữ | Ý nghĩa |
| :--- | :--- |
| TP (True Positive) | Dự đoán đúng Churn |
| TN (True Negative) | Dự đoán đúng Retain |
| FP (False Positive) | Dự đoán nhầm là Churn (thực tế Retain) |
| FN (False Negative) | Bỏ sót Churn (thực tế Churn nhưng đoán Retain) — **nghiêm trọng nhất** |

### Các chỉ số

| Metric | Công thức | Ý nghĩa trong bài toán |
| :--- | :--- | :--- |
| **Accuracy** | $(TP + TN) / N$ | Tỷ lệ dự đoán đúng tổng thể — **không tin cậy khi imbalanced** |
| **Precision** | $TP / (TP + FP)$ | Trong số dự đoán Churn, bao nhiêu % đúng thật |
| **Recall** | $TP / (TP + FN)$ | Trong số thực tế Churn, mô hình phát hiện được bao nhiêu % |
| **F1-Score** | $2 \cdot \frac{P \cdot R}{P + R}$ | Trung bình điều hòa giữa Precision và Recall |
| **ROC-AUC** | Diện tích dưới đường ROC | Khả năng **phân biệt** giữa 2 lớp ở mọi ngưỡng (threshold-independent) |

### Tại sao chọn XGBoost là best model?

- **ROC-AUC = 0.8435** (cao nhất) → phân biệt tốt nhất giữa Churn và Retain.
- **Recall = 0.8021** (cao nhất) → phát hiện được 80% khách hàng thực sự muốn rời bỏ.
- Trade-off: Precision chỉ 0.5291 → gần 50% cảnh báo Churn là báo nhầm. Nhưng trong business, chi phí giữ chân nhầm << chi phí mất khách.

---

## 6. Scikit-Learn Pipeline

```python
Pipeline(steps=[
    ("preprocessor", ColumnTransformer(...)),
    ("classifier", XGBClassifier(...)),
])
```

### Tại sao dùng Pipeline?

1. **Tránh data leakage**: `pipeline.fit(X_train, y_train)` chỉ fit scaler/encoder trên train, tự động transform trên test.
2. **Reproducibility**: toàn bộ preprocessing + model đóng gói trong 1 object duy nhất.
3. **Deployment đơn giản**: `joblib.dump(pipeline, path)` → chỉ cần 1 file `.joblib` để serving.
4. **Consistency**: đảm bảo inference dùng đúng transform như khi training.

### Serialize với Joblib

```python
joblib.dump(pipeline, "best_churn_pipeline.joblib")
pipeline = joblib.load("best_churn_pipeline.joblib")
```

- `joblib` hiệu quả hơn `pickle` cho numpy arrays lớn (dùng memory-mapping).
- File `.joblib` chứa toàn bộ: scaler parameters, encoder categories, model weights.

---

## 7. Stratified Train/Test Split

```python
train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
```

- `stratify=y`: đảm bảo tỷ lệ Churn/Retain **giống nhau** ở cả train và test set.
- Nếu không stratify trên dữ liệu imbalanced → test set có thể chứa quá ít hoặc quá nhiều mẫu Churn → đánh giá thiên lệch.
- `random_state=42`: seed cố định để kết quả reproducible.

---

## 8. FastAPI & Pydantic (API Service)

### Pydantic Validation

- **Literal types**: `Contract: Literal["Month-to-month", "One year", "Two year"]` → chỉ chấp nhận đúng giá trị hợp lệ, reject ngay tại API layer.
- **Field constraints**: `tenure: int = Field(..., ge=0)` → tenure phải >= 0.
- Auto-generate JSON Schema → Swagger UI tự động có form nhập liệu.

### Risk Level Logic

```python
if churn_prob >= 0.65:  risk_level = "High"
elif churn_prob >= 0.35: risk_level = "Medium"
else:                    risk_level = "Low"
```

- Ngưỡng 0.50 cho dự đoán nhị phân (Churn/Retain).
- 3 mức rủi ro riêng cho business decision: Low/Medium/High → khác với ngưỡng dự đoán.
- Khách hàng "Medium" (0.35–0.65) vẫn cần can thiệp dù mô hình đoán "Retain".

### Recommendation Engine (Rule-based)

- Không dùng ML cho phần recommendation → **rule-based** dựa trên domain knowledge.
- Ví dụ: `Contract == "Month-to-month"` + churn probability cao → đề xuất chuyển hợp đồng dài hạn.
- Đơn giản, giải thích được, dễ mở rộng khi có thêm business rules.

---

## 9. Thuật ngữ nhanh (Quick Glossary)

| Thuật ngữ | Giải thích ngắn |
| :--- | :--- |
| **Overfitting** | Mô hình học quá kỹ dữ liệu train, kém trên dữ liệu mới |
| **Underfitting** | Mô hình quá đơn giản, không nắm được pattern |
| **Feature Engineering** | Tạo feature mới từ feature gốc để cải thiện mô hình |
| **Hyperparameter** | Tham số cấu hình mô hình (learning_rate, max_depth, ...) — không học từ dữ liệu |
| **Cross-Validation** | Chia dữ liệu thành k fold, train/evaluate k lần → đánh giá ổn định hơn |
| **Ensemble** | Kết hợp nhiều mô hình yếu thành 1 mô hình mạnh (Bagging, Boosting) |
| **Bagging** | Mỗi mô hình train trên bootstrap sample độc lập (Random Forest) |
| **Boosting** | Mô hình train tuần tự, mỗi mô hình sửa lỗi của mô hình trước (XGBoost, LightGBM) |
| **Data Leakage** | Thông tin từ test set rò rỉ vào quá trình training → metrics ảo cao |
| **Inference** | Quá trình dùng mô hình đã train để dự đoán trên dữ liệu mới |
| **SHAP** | Phương pháp giải thích mô hình dựa trên Shapley values từ lý thuyết trò chơi |

export type YesNo = 'Yes' | 'No'
export type InternetServiceOption = 'DSL' | 'Fiber optic' | 'No'
export type InternetAddonOption = 'No internet service' | 'No' | 'Yes'
export type MultipleLinesOption = 'No phone service' | 'No' | 'Yes'
export type ContractOption = 'Month-to-month' | 'One year' | 'Two year'
export type PaymentMethodOption =
  | 'Electronic check'
  | 'Mailed check'
  | 'Bank transfer (automatic)'
  | 'Credit card (automatic)'

export interface CustomerInput {
  gender: 'Male' | 'Female'
  SeniorCitizen: number
  Partner: YesNo
  Dependents: YesNo
  tenure: number
  PhoneService: YesNo
  MultipleLines: MultipleLinesOption
  InternetService: InternetServiceOption
  OnlineSecurity: InternetAddonOption
  OnlineBackup: InternetAddonOption
  DeviceProtection: InternetAddonOption
  TechSupport: InternetAddonOption
  StreamingTV: InternetAddonOption
  StreamingMovies: InternetAddonOption
  Contract: ContractOption
  PaperlessBilling: YesNo
  PaymentMethod: PaymentMethodOption
  MonthlyCharges: number
  TotalCharges: number
}

export interface FeatureContribution {
  feature: string
  value: string
  impact: number
  direction: 'increase' | 'decrease'
}

export interface ChurnPredictionResponse {
  churn_prediction: 'Churn' | 'Retain'
  churn_probability: number
  risk_level: 'Low' | 'Medium' | 'High'
  recommendation: string
  model_version: string
  top_factors: FeatureContribution[]
}

export interface BatchPredictionResponse {
  total_customers: number
  predictions: ChurnPredictionResponse[]
}

export interface HealthResponse {
  status: string
  model_loaded: boolean
  model_version: string
}

export interface CustomerPreset {
  id: string
  name: string
  tag: string
  description: string
  data: CustomerInput
}


import type {
  BatchPredictionResponse,
  ChurnPredictionResponse,
  CustomerInput,
  HealthResponse,
} from '../types/churn'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const errBody = await response.json()
      if (errBody?.detail) {
        message = typeof errBody.detail === 'string' ? errBody.detail : JSON.stringify(errBody.detail)
      }
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function fetchHealth(): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/health')
}

export function predictSingleCustomer(customer: CustomerInput): Promise<ChurnPredictionResponse> {
  return requestJson<ChurnPredictionResponse>('/api/v1/predict', {
    method: 'POST',
    body: JSON.stringify(customer),
  })
}

export function predictBatchCustomers(customers: CustomerInput[]): Promise<BatchPredictionResponse> {
  return requestJson<BatchPredictionResponse>('/api/v1/predict/batch', {
    method: 'POST',
    body: JSON.stringify({ customers }),
  })
}

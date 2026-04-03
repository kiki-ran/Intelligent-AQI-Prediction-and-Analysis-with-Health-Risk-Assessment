// API service layer — all calls go to Flask backend (proxied via Vite)
import axios from 'axios'

const BASE = '/api'

const api = axios.create({ baseURL: BASE, timeout: 120_000 })

export const getDashboardData = () =>
  api.get('/dashboard-data').then(r => r.data.data)

export const predictAqi = (hours = 24, area = null) => {
  const params = { hours }
  if (area) params.area = area
  return api.get('/predict', { params }).then(r => r.data.data)
}

export const getForecast = (area = null) => {
  const params = {}
  if (area) params.area = area
  return api.get('/forecast', { params }).then(r => r.data.data)
}

export const getHealthRisk = (payload) =>
  api.post('/health-risk', payload).then(r => r.data.data)

export const getCurrentAqi = (area = null) => {
  const params = {}
  if (area) params.area = area
  return api.get('/current-aqi', { params }).then(r => r.data.data)
}

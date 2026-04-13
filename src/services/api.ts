import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

export const apiV1 = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
    : '/api/v1',
})

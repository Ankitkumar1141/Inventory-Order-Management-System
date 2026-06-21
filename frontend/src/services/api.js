import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Products
export const productsApi = {
  getAll: (config = {}) => api.get('/products/', config),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Customers
export const customersApi = {
  getAll: () => api.get('/customers/'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers/', data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// Orders
export const ordersApi = {
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders/', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;

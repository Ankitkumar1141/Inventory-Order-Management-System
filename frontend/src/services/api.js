import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const productsApi = {
  getAll: (config = {}) => api.get('/products/', config),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const customersApi = {
  getAll: () => api.get('/customers/'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers/', data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const ordersApi = {
  getAll: () => api.get('/orders/'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders/', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;

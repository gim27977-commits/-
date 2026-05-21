import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: API_BASE });

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const origin = import.meta.env.VITE_API_ORIGIN || '';
  return `${origin}${url}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000'
});

// Har request mein token add karo
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const register = (data) => API.post('/api/auth/register', data);
export const login = (data) => API.post('/api/auth/login', data);

// Environment APIs
export const createEnvironment = (data) => API.post('/api/environment/create', data);
export const getEnvironments = () => API.get('/api/environment/list');
export const deleteEnvironment = (id) => API.delete(`/api/environment/${id}`);

// User APIs
export const getProfile = () => API.get('/api/user/profile');
export const getAllUsers = () => API.get('/api/user/list');
export const changeRole = (id, role) => API.put(`/api/user/${id}/role`, { role });
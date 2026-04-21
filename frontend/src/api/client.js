import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function getApiErrorMessage(error, fallbackMessage = 'Server error. Please try again.') {
  if (!error.response) {
    return 'Unable to reach server. Please check your internet connection.';
  }
  return error.response?.data?.message || fallbackMessage;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default apiClient;


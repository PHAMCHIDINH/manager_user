import axios from 'axios';

// Base URL từ environment variables
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm JWT token vào header
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage - check if window is available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Thêm Request ID
    config.headers['X-Request-ID'] = Date.now().toString();
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý response và error
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
    
    // Xử lý các lỗi chung
    if (error.response?.status === 401) {
      // Unauthorized - xóa token và redirect đến login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Use setTimeout to avoid synchronous redirect during render
        setTimeout(() => {
          window.location.href = '/login';
        }, 0);
      }
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access denied');
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      console.error('Too many requests. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
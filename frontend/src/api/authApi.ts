import apiClient from './axiosClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
  token: string;
  expires_in: number;
}

export type AuthUser = AuthResponse['user'];

export interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

class AuthAPI {
  // Đăng nhập
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      );
      
      // Lưu token và user info vào localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Đăng ký
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        userData
      );
      
      // Auto login sau khi đăng ký thành công
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Luôn xóa token dù API call có lỗi hay không
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/auth/refresh'
      );
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Nếu refresh fail thì logout
      this.logout();
      throw error;
    }
  }

  // Kiểm tra user đã login chưa
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Lấy thông tin user hiện tại
  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return null;
    }
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch (parseError) {
      console.error('Failed to parse stored user', parseError);
      return null;
    }
  }

  // Lấy token hiện tại
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export default new AuthAPI();
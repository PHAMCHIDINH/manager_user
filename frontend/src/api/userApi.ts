import apiClient from './axiosClient';

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  role?: string;
}

export interface UsersListResponse {
  users: User[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

class UserAPI {
  // Lấy danh sách users (Admin only)
  async getUsers(): Promise<UsersListResponse> {
    try {
      const response = await apiClient.get<UsersListResponse>('/users');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }

  // Lấy user theo ID
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw error;
    }
  }

  // Tạo user mới (Admin only)
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post<User>(
        '/users',
        userData
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  // Cập nhật user (Admin hoặc chính user đó)
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put<User>(
        `/users/${id}`,
        userData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  }

  // Xóa user (Admin only)
  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  }

  // Lấy profile của user hiện tại - REMOVE vì backend không có endpoint này
  // async getMyProfile(): Promise<User> {
  //   try {
  //     const response = await apiClient.get<User>('/users/me');
  //     return response.data;
  //   } catch (error) {
  //     console.error('Failed to fetch profile:', error);
  //     throw error;
  //   }
  // }

  // Cập nhật profile của user hiện tại - REMOVE vì backend không có endpoint này  
  // async updateMyProfile(userData: UpdateUserRequest): Promise<User> {
  //   try {
  //     const response = await apiClient.put<User>(
  //       '/users/me',
  //       userData
  //     );
  //     return response.data;
  //   } catch (error) {
  //     console.error('Failed to update profile:', error);
  //     throw error;
  //   }
  // }
}

export default new UserAPI();
import apiClient from './axiosClient';

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;  // Backend trả về user_id thay vì author_id
  username: string; // Backend trả về username thay vì author_username
  status?: 'draft' | 'published' | 'archived'; // Optional vì backend có thể không có
  created_at: {
    Time: string;
    Valid: boolean;
  };
  updated_at: {
    Time: string;
    Valid: boolean;
  };
}

export interface CreatePostRequest {
  title: string;
  content: string;
  status?: 'draft' | 'published';
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface PostsListResponse {
  posts: Post[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

class PostAPI {
  // Lấy danh sách posts
  async getPosts(page = 1, limit = 10): Promise<PostsListResponse> {
    try {
      const response = await apiClient.get<PostsListResponse>(
        `/posts?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  }

  // Lấy posts theo user ID
  async getPostsByUser(userId: number): Promise<PostsListResponse> {
    try {
      const response = await apiClient.get<PostsListResponse>(
        `/posts/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch posts for user ${userId}:`, error);
      throw error;
    }
  }

  // Lấy post theo ID
  async getPostById(id: number): Promise<Post> {
    try {
      const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch post ${id}:`, error);
      throw error;
    }
  }

  // Tạo post mới
  async createPost(postData: CreatePostRequest): Promise<Post> {
    try {
      const response = await apiClient.post<ApiResponse<Post>>(
        '/posts',
        postData
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  // Cập nhật post
  async updatePost(id: number, postData: UpdatePostRequest): Promise<Post> {
    try {
      const response = await apiClient.put<ApiResponse<Post>>(
        `/posts/${id}`,
        postData
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update post ${id}:`, error);
      throw error;
    }
  }

  // Xóa post
  async deletePost(id: number): Promise<void> {
    try {
      await apiClient.delete(`/posts/${id}`);
    } catch (error) {
      console.error(`Failed to delete post ${id}:`, error);
      throw error;
    }
  }

  // Lấy posts của user hiện tại
  async getMyPosts(): Promise<PostsListResponse> {
    try {
      const response = await apiClient.get<PostsListResponse>('/posts/me');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch my posts:', error);
      throw error;
    }
  }

  // Publish post
  async publishPost(id: number): Promise<Post> {
    try {
      const response = await apiClient.patch<ApiResponse<Post>>(
        `/posts/${id}/publish`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to publish post ${id}:`, error);
      throw error;
    }
  }

  // Archive post  
  async archivePost(id: number): Promise<Post> {
    try {
      const response = await apiClient.patch<ApiResponse<Post>>(
        `/posts/${id}/archive`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to archive post ${id}:`, error);
      throw error;
    }
  }
}

export default new PostAPI();
import apiClient from './axiosClient';

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  username: string;
  status?: 'draft' | 'published' | 'archived';
  created_at: { Time: string; Valid: boolean };
  updated_at: { Time: string; Valid: boolean };
}

export interface PostsListResponse {
  posts: Post[];
  totalCount?: number; // náº¿u BE chÆ°a tráº£, Ä‘á»ƒ optional
  total?: number;      // táº¡m giá»¯ Ä‘á»ƒ trĂ¡nh crash khi code chá»— khĂ¡c cĂ²n dĂ¹ng total
  page?: number;
  limit?: number;
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

export interface ApiResponse<T> {
  message?: string;
  data: T;
  success?: boolean;
}

class PostAPI {
  async getPosts(page = 1, limit = 10): Promise<PostsListResponse> {
    const response = await apiClient.get<PostsListResponse>(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getPostById(id: number): Promise<Post> {
    const res = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return res.data.data;
  }

  async createPost(postData: CreatePostRequest): Promise<Post> {
    const res = await apiClient.post<ApiResponse<Post>>(`/posts`, postData);
    return res.data.data;
  }

  async updatePost(id: number, postData: UpdatePostRequest): Promise<Post> {
    const res = await apiClient.put<ApiResponse<Post>>(`/posts/${id}`, postData);
    return res.data.data;
  }

  async deletePost(id: number): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  }
}

export default new PostAPI();

import { apiClient, ApiResponse } from './client';
import { User } from '../../types/user';

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

export const authApi = {
  register: (dto: { email: string; password: string }): Promise<ApiResponse<AuthResponseData>> =>
    apiClient<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  login: (dto: { email: string; password: string }): Promise<ApiResponse<AuthResponseData>> =>
    apiClient<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  logout: (): Promise<ApiResponse<{ message: string }>> =>
    apiClient<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: (): Promise<ApiResponse<User>> =>
    apiClient<User>('/auth/me'),
};

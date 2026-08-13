import { apiClient, ApiResponse } from './client';
import { User } from '../../types/user';

export const authApi = {
  getUserProfile: (id: string): Promise<ApiResponse<User>> =>
    apiClient<User>(`/users/${id}`),
};

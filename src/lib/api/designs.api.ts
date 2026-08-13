import { apiClient, ApiResponse } from './client';
import { Design } from '../../types/design';

export const designsApi = {
  getDesignById: (id: string): Promise<ApiResponse<Design>> =>
    apiClient<Design>(`/designs/${id}`),
};

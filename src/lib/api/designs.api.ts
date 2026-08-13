import { apiClient, ApiResponse } from './client';
import { Design } from '../../types/design';

export interface AnalysisResponseData {
  design: Design;
  result: {
    layout: {
      width: number;
      height: number;
      sections: Array<{
        id: string;
        type: string;
        order?: number;
        bounds: { x: number; y: number; width: number; height: number };
      }>;
    };
    placeholders: Array<{
      id: string;
      type: 'text' | 'image' | 'link' | 'button';
      role: string;
      section_id: string;
      bounds: { x: number; y: number; width: number; height: number };
      content_hint?: string;
    }>;
  };
}

export interface ProcessingResponseData {
  designId: string;
  userId: string;
  extractedDir: string;
  fileInventory: Array<{
    path: string;
    type: 'svg' | 'image' | 'font' | 'other';
    size: number;
    metadata: Record<string, unknown>;
  }>;
  summary: {
    totalFiles: number;
    svgCount: number;
    imageCount: number;
    fontCount: number;
    otherCount: number;
  };
}

export const designsApi = {
  uploadDesign: (file: File, name: string): Promise<ApiResponse<Design>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    return apiClient<Design>('/designs/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getDesigns: (): Promise<ApiResponse<Design[]>> =>
    apiClient<Design[]>('/designs'),

  getDesignById: (id: string): Promise<ApiResponse<Design>> =>
    apiClient<Design>(`/designs/${id}`),

  deleteDesign: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient<{ message: string }>(`/designs/${id}`, {
      method: 'DELETE',
    }),

  processDesign: (id: string): Promise<ApiResponse<ProcessingResponseData>> =>
    apiClient<ProcessingResponseData>(`/designs/${id}/process`, {
      method: 'POST',
    }),

  analyzeDesign: (id: string): Promise<ApiResponse<AnalysisResponseData>> =>
    apiClient<AnalysisResponseData>(`/designs/${id}/analyze`, {
      method: 'POST',
    }),

  getAnalysis: (id: string): Promise<ApiResponse<AnalysisResponseData>> =>
    apiClient<AnalysisResponseData>(`/designs/${id}/analysis`),
};

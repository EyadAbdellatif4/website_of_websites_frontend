import { apiClient, ApiResponse } from './client';
import { env } from '../config/env';
import { Design } from '../../types/design';
import { DesignAnalysisResult, DesignPlaceholder } from '../../types/analysis';

export interface AnalysisResponseData {
  design: Design;
  result: DesignAnalysisResult;
}

export interface PlaceholderUpdateResponseData {
  placeholder: DesignPlaceholder;
  totalFilled: number;
  totalCount: number;
}

export interface GeneratedProjectManifest {
  generationId: string;
  designId: string;
  userId: string;
  designName: string;
  generatedAt: string;
  projectTarget: string;
  totalFiles: number;
  sectionsCount: number;
  placeholdersCount: number;
  assetsCount: number;
  files: string[];
}

export interface GenerationResponseData {
  success: boolean;
  project: {
    generationId: string;
    designId: string;
    designName: string;
    status: string;
    generatedAt: string;
    totalFiles: number;
    manifest: GeneratedProjectManifest;
  };
}

export type PreviewStatusType =
  | 'NOT_READY'
  | 'STARTING'
  | 'RUNNING'
  | 'STOPPING'
  | 'STOPPED'
  | 'FAILED';

export interface PreviewStatusResponseData {
  designId: string;
  status: PreviewStatusType;
  url: string | null;
  port: number | null;
  startedAt: string | null;
  errorMessage: string | null;
  activePreviewsCount: number;
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

  getPlaceholders: (id: string): Promise<ApiResponse<DesignPlaceholder[]>> =>
    apiClient<DesignPlaceholder[]>(`/designs/${id}/placeholders`),

  updatePlaceholderValue: (
    designId: string,
    placeholderId: string,
    value: unknown,
  ): Promise<ApiResponse<PlaceholderUpdateResponseData>> =>
    apiClient<PlaceholderUpdateResponseData>(
      `/designs/${designId}/placeholders/${placeholderId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      },
    ),

  uploadPlaceholderImage: (
    designId: string,
    placeholderId: string,
    file: File,
  ): Promise<ApiResponse<PlaceholderUpdateResponseData>> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient<PlaceholderUpdateResponseData>(
      `/designs/${designId}/placeholders/${placeholderId}/image`,
      {
        method: 'POST',
        body: formData,
      },
    );
  },

  clearPlaceholderValue: (
    designId: string,
    placeholderId: string,
  ): Promise<ApiResponse<PlaceholderUpdateResponseData>> =>
    apiClient<PlaceholderUpdateResponseData>(
      `/designs/${designId}/placeholders/${placeholderId}/value`,
      {
        method: 'DELETE',
      },
    ),

  getPlaceholderImageUrl: (designId: string, placeholderId: string): string => {
    return `${env.apiBaseUrl}/designs/${designId}/placeholders/${placeholderId}/image`;
  },

  updateSectionStyles: (
    designId: string,
    sectionId: string,
    styles: {
      background_color?: string;
      text_color?: string;
      primary_color?: string;
      secondary_color?: string;
    },
  ): Promise<ApiResponse<{ sectionId: string; styles: Record<string, unknown>; layout: Record<string, unknown> }>> =>
    apiClient<{ sectionId: string; styles: Record<string, unknown>; layout: Record<string, unknown> }>(
      `/designs/${designId}/sections/${sectionId}/styles`,
      {
        method: 'PATCH',
        body: JSON.stringify(styles),
      },
    ),

  generateWebsite: (
    designId: string,
  ): Promise<ApiResponse<GenerationResponseData>> =>
    apiClient<GenerationResponseData>(`/designs/${designId}/generate`, {
      method: 'POST',
    }),

  getLatestGeneration: (
    designId: string,
  ): Promise<ApiResponse<GeneratedProjectManifest>> =>
    apiClient<GeneratedProjectManifest>(`/designs/${designId}/generation`),

  getGenerationDownloadUrl: (designId: string): string => {
    return `${env.apiBaseUrl}/designs/${designId}/generation/download`;
  },

  downloadGenerationZip: async (
    designId: string,
    filename: string,
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${env.apiBaseUrl}/designs/${designId}/generation/download`, {
        credentials: 'include',
      });
      if (!res.ok) {
        return false;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  },

  startPreview: (
    designId: string,
  ): Promise<ApiResponse<PreviewStatusResponseData>> =>
    apiClient<PreviewStatusResponseData>(`/designs/${designId}/preview`, {
      method: 'POST',
    }),

  getPreviewStatus: (
    designId: string,
  ): Promise<ApiResponse<PreviewStatusResponseData>> =>
    apiClient<PreviewStatusResponseData>(`/designs/${designId}/preview`),

  stopPreview: (
    designId: string,
  ): Promise<ApiResponse<PreviewStatusResponseData>> =>
    apiClient<PreviewStatusResponseData>(`/designs/${designId}/preview`, {
      method: 'DELETE',
    }),
};

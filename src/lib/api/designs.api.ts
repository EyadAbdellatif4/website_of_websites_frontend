import { apiClient, ApiResponse } from '../api-client';
import {
  DesignAnalysisResult,
  DesignPlaceholder,
} from '../../types/analysis';
import { env } from '../env';

export interface DesignDto {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingResponseData {
  designId: string;
  status: string;
  summary: {
    totalFiles: number;
    svgCount: number;
    imageCount: number;
    fontCount: number;
    otherCount: number;
  };
}

export interface AnalysisResponseData {
  design: DesignDto;
  result: DesignAnalysisResult;
}

export interface PlaceholderUpdateResponseData {
  placeholder: DesignPlaceholder;
  totalFilled: number;
  totalCount: number;
}

export interface GeneratedProjectFile {
  path: string;
  size: number;
  type: 'code' | 'asset' | 'config';
}

export interface GeneratedProjectManifest {
  designId: string;
  generationId: string;
  projectPath: string;
  framework: string;
  language: string;
  styling: string;
  generatedAt: string;
  files: GeneratedProjectFile[];
  summary: {
    totalFiles: number;
    sectionsCount: number;
    assetsCount: number;
  };
}

export interface GenerationResponseData {
  design: DesignDto;
  manifest: GeneratedProjectManifest;
  instructions: {
    unzipCommand: string;
    installCommand: string;
    devCommand: string;
  };
}

export interface PreviewStatusResponseData {
  designId: string;
  status: 'NOT_READY' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'FAILED';
  port: number | null;
  url: string | null;
  startedAt: string | null;
  error?: string | null;
}

export const designsApi = {
  getDesigns: (): Promise<ApiResponse<DesignDto[]>> =>
    apiClient<DesignDto[]>('/designs'),

  getDesign: (id: string): Promise<ApiResponse<DesignDto>> =>
    apiClient<DesignDto>(`/designs/${id}`),

  uploadDesign: (
    file: File,
    name: string,
  ): Promise<ApiResponse<DesignDto>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    return apiClient<DesignDto>('/designs/upload', {
      method: 'POST',
      body: formData,
    });
  },

  deleteDesign: (id: string): Promise<ApiResponse<{ message: string }>> =>
    apiClient<{ message: string }>(`/designs/${id}`, {
      method: 'DELETE',
    }),

  getProcessingResult: (
    id: string,
  ): Promise<ApiResponse<ProcessingResponseData>> =>
    apiClient<ProcessingResponseData>(`/designs/${id}/processing`),

  processDesign: (
    id: string,
  ): Promise<ApiResponse<ProcessingResponseData>> =>
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

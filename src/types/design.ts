export type DesignStatus =
  | 'UPLOADED'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED'
  | 'uploaded'
  | 'processing'
  | 'ready'
  | 'failed';

export interface Design {
  id: string;
  name: string;
  fileName?: string;
  file_name?: string;
  fileSize?: number;
  file_size?: number;
  status: DesignStatus;
  layoutData?: Record<string, unknown> | null;
  layout_data?: Record<string, unknown> | null;
  placeholdersData?: Array<Record<string, unknown>> | null;
  placeholders_data?: Array<Record<string, unknown>> | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

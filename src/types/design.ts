import { DesignAnalysisResult } from './analysis';

export type DesignStatus = 'pending' | 'uploaded' | 'processing' | 'analyzed' | 'failed';

export interface Design {
  id: string;
  user_id: string;
  name: string;
  file_name: string;
  storage_key: string;
  file_size: number;
  status: DesignStatus;
  layout_data: DesignAnalysisResult['layout'] | null;
  placeholders_data: DesignAnalysisResult['placeholders'] | null;
  created_at: string;
  updated_at: string;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SectionStyles {
  background_color?: string;
  text_color?: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface DesignSection {
  id: string;
  type: string;
  order?: number;
  bounds: Bounds;
  styles?: SectionStyles;
}

export interface DesignLayout {
  width: number;
  height: number;
  sections: DesignSection[];
}

export type PlaceholderType =
  | 'text'
  | 'image'
  | 'link'
  | 'button'
  | 'icon'
  | 'video'
  | 'logo'
  | 'repeated-item'
  | string;

export interface ImagePlaceholderValue {
  storage_key: string;
  file_name: string;
  width: number | null;
  height: number | null;
  size: number;
  mime_type: string;
}

export interface ButtonPlaceholderValue {
  text: string;
  url?: string;
}

export interface LinkPlaceholderValue {
  text: string;
  url: string;
}

export type PlaceholderValue =
  | string
  | ImagePlaceholderValue
  | ButtonPlaceholderValue
  | LinkPlaceholderValue
  | unknown;

export interface DesignPlaceholder {
  id: string;
  type: PlaceholderType;
  role: string;
  section_id: string;
  bounds: Bounds;
  content_hint?: string;
  value?: PlaceholderValue | null;
}

export interface DesignAnalysisResult {
  layout: DesignLayout;
  placeholders: DesignPlaceholder[];
}

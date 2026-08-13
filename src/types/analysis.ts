export interface DesignSection {
  id: string;
  name: string;
  type: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DesignLayout {
  width: number;
  height: number;
  sections: DesignSection[];
}

export interface DesignPlaceholder {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'image' | 'color' | 'font';
  defaultValue?: string;
}

export interface DesignAnalysisResult {
  layout: DesignLayout;
  placeholders: DesignPlaceholder[];
}

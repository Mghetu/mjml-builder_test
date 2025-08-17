export interface MJMLComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  category: 'head' | 'body';
  attributes: Record<string, any>;
  children?: MJMLComponent[];
  content?: string;
}

export interface EmailStructure {
  head: {
    title?: string;
    preview?: string;
    fonts: string[];
    styles: string;
  };
  body: MJMLComponent[];
}

export interface CompilationResult {
  html: string;
  mjml: string;
  errors: string[];
  success: boolean;
}

export type ViewMode = 'edit' | 'preview';
export type DeviceType = 'desktop' | 'tablet' | 'mobile';
export type PreviewTab = 'visual' | 'mjml' | 'html';
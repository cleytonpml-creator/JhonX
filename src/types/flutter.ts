export type DeviceType = 'iphone-16' | 'pixel-9' | 'borderless';
export type AppThemeStyle = 'material3' | 'cupertino';
export type StudioTab = 'preview' | 'code' | 'inspector' | 'terminal';

export interface FlutterColorSeed {
  name: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  surface: string;
  surfaceDark: string;
}

export interface TaskItem {
  id: string;
  title: string;
  category: 'Engineering' | 'Design' | 'Mobile' | 'AI';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface WidgetNode {
  id: string;
  name: string;
  type: string;
  properties: Record<string, string | number | boolean>;
  children?: WidgetNode[];
}

export interface TerminalEntry {
  id: string;
  type: 'input' | 'output' | 'success' | 'error' | 'info';
  text: string;
  timestamp: string;
}

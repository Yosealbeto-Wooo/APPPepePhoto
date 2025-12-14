export interface FilterSettings {
  brightness: number; // 100 is default
  contrast: number; // 100 is default
  saturation: number; // 100 is default
  grayscale: number; // 0-100
  sepia: number; // 0-100
  blur: number; // 0
  hueRotate: number; // 0
  rotate: number; // 0 (degrees)
  scale: number; // 1 (100%)
  sharpen: number; // 0-100 (Amount)
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface EditorState {
  originalImage: string | null;
  currentImage: string | null; // The processed image (result of applying filters/edits)
  history: string[];
  historyIndex: number;
  filename: string;
  settings: FilterSettings;
  dimensions: ImageDimensions;
}

export const DEFAULT_SETTINGS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  hueRotate: 0,
  rotate: 0,
  scale: 1,
  sharpen: 0,
};

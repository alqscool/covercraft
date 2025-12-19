

export enum ProcessingTool {
  NONE = 'NONE',
  REMOVE_WATERMARK = 'REMOVE_WATERMARK',
  ADD_TEXT = 'ADD_TEXT',
  ADD_LOGO = 'ADD_LOGO',
  ADD_MASK = 'ADD_MASK',
  CHANGE_RATIO = 'CHANGE_RATIO',
  CUSTOM_EDIT = 'CUSTOM_EDIT'
}

export enum AspectRatio {
  SQUARE = '1:1',
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
  STANDARD_LANDSCAPE = '4:3',
  STANDARD_PORTRAIT = '3:4'
}

export enum ResizeMode {
  FIT = 'FIT',   // Smart blur background
  FILL = 'FILL'  // Crop to fill/cover
}

export enum ImageResolution {
  RES_1K = '1K',
  RES_2K = '2K', // Requires Pro
  RES_4K = '4K'  // Requires Pro
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview'
}

export type TextAlignment = 'left' | 'center' | 'right';

export interface TextSettings {
  size: number;      // 10 to 200 (scale factor)
  color: string;     // Hex code
  alignment: TextAlignment;
  positionX?: number; // 0-100 percentage
  positionY?: number; // 0-100 percentage
  strokeWidth?: number; // 0-20 scale relative to font size
  shadowBlur?: number;  // 0-100 scale relative to font size
  shadowColor?: string; // Hex code
  fontFamily?: string; // Font family name
}

export interface EnhanceSettings {
  brightness: number; // -50 to 50
  contrast: number;   // -50 to 50
  saturation: number; // -50 to 50
}

export type MaskMode = 'blur' | 'pixelate' | 'fill' | 'inpaint';

export interface MaskSettings {
  x: number;      // 0-100 %
  y: number;      // 0-100 %
  width: number;  // 0-100 % relative to canvas width
  height: number; // 0-100 % relative to canvas height
  intensity: number;   // 0-100 (Blur radius or Pixel size)
  mode: MaskMode;      // Type of masking
  fillColor?: string;  // For fill mode
}

export interface LogoSettings {
  data: string;       // Base64 string of the logo
  size: number;       // 1-100 scale relative to canvas
  opacity: number;    // 0-100
  positionX: number;  // 0-100 percentage
  positionY: number;  // 0-100 percentage
}

export interface ProcessingConfig {
  activeTools: ProcessingTool[];
  prompt: string;
  aspectRatio: AspectRatio;
  resizeMode: ResizeMode;
  resolution: ImageResolution;
  model: ModelType;
  textSettings?: TextSettings;
  enhanceSettings?: EnhanceSettings;
  maskSettings?: MaskSettings;
  logoSettings?: LogoSettings;
  previewMode?: boolean;
}

export interface GeneratedImage {
  data: string; // Base64
  mimeType: string;
}
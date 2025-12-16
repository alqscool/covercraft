
import React, { useState, useRef, useEffect } from 'react';
import {
  ProcessingTool,
  AspectRatio,
  ImageResolution,
  ModelType,
  ProcessingConfig,
  TextAlignment,
  ResizeMode,
  LogoSettings,
  MaskSettings,
  MaskMode
} from './types';
import { processImageLocal, removeWatermarkWithGemini } from './services/geminiService';

// --- Icons ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const LargeUploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const TextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const EnhanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EraseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const AlignLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M9 18h6" />
  </svg>
);

const AlignRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M13 18h7" />
  </svg>
);

const MagicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// --- Translations ---
const TRANSLATIONS = {
  zh: {
    appName: "智能封面工坊",
    uploadTitle: "点击上传图片",
    uploadDesc: "支持 JPG, PNG 格式",
    replaceImage: "更换图片",
    toolEnhance: "增强/去水印",
    toolText: "添加文字",
    toolLogo: "添加 Logo",
    toolMask: "手动消除",
    processing: "处理中...",
    download: "导出封面",
    ratio: "比例",
    resolution: "分辨率",
    fitMode: "画面适配",
    fit: "留白模糊",
    fill: "全屏填充",
    textPlaceholder: "输入您的文字...",
    typography: "排版",
    effects: "特效",
    position: "位置",
    posX: "水平",
    posY: "垂直",
    textSize: "大小",
    textColor: "颜色",
    textStroke: "描边",
    shadowBlur: "阴影",
    shadowColor: "颜色",
    logoSize: "Logo 大小",
    logoOpacity: "不透明度",
    uploadLogo: "上传 Logo",
    dragText: "拖拽文字或使用滑块调整位置",
    dragLogo: "拖拽 Logo 或使用滑块调整位置",
    dragMask: "拖拽消除框覆盖水印",
    settings: "设置",
    enhance: "增强/去水印",
    text: "文字",
    logo: "Logo",
    mask: "手动消除",
    watermarkDesc: "使用 AI 智能擦除水印，或使用下方滑块调节画面。",
    startAiRemove: "✨ AI 智能一键消除",
    aiRemoving: "AI 正在擦除中...",
    aiRemoved: "已完成消除",
    revert: "还原原图",
    manualEnhance: "手动调色",
    brightness: "亮度",
    contrast: "对比度",
    saturation: "饱和度",
    reset: "重置",
    compareOriginal: "原图",
    compareAi: "AI 净化",
    compareFinal: "最终效果",
    compareTip: "按住对比",
    maskSize: "消除范围",
    maskIntensity: "纹理噪点 (模拟背景质感)",
    modeBlur: "模糊",
    modePixel: "马赛克",
    modeFill: "纯色",
    modeInpaint: "智能修复",
    fillColor: "填充颜色"
  },
  en: {
    appName: "Smart CoverCraft",
    uploadTitle: "Click to Upload Image",
    uploadDesc: "Supports JPG, PNG",
    replaceImage: "Replace Image",
    toolEnhance: "Enhance/Remove Watermark",
    toolText: "Add Text",
    toolLogo: "Add Logo",
    toolMask: "Manual Erase",
    processing: "Processing...",
    download: "Export Cover",
    ratio: "Aspect Ratio",
    resolution: "Resolution",
    fitMode: "Fit Mode",
    fit: "Smart Fit",
    fill: "Full Fill",
    textPlaceholder: "Enter your text...",
    typography: "Typography",
    effects: "Effects",
    position: "Position",
    posX: "H-Pos",
    posY: "V-Pos",
    textSize: "Size",
    textColor: "Color",
    textStroke: "Stroke",
    shadowBlur: "Shadow",
    shadowColor: "Color",
    logoSize: "Logo Size",
    logoOpacity: "Opacity",
    uploadLogo: "Upload Logo",
    dragText: "Drag text or use sliders",
    dragLogo: "Drag logo or use sliders",
    dragMask: "Drag box to cover watermark",
    settings: "Settings",
    enhance: "Enhance/Removal",
    text: "Text",
    logo: "Logo",
    mask: "Manual Erase",
    watermarkDesc: "Use AI to erase watermarks, or adjust sliders below.",
    startAiRemove: "✨ AI Magic Remove",
    aiRemoving: "AI is erasing...",
    aiRemoved: "Removal Complete",
    revert: "Revert to Original",
    manualEnhance: "Manual Adjustments",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    reset: "Reset",
    compareOriginal: "Original",
    compareAi: "AI Clean",
    compareFinal: "Final",
    compareTip: "Hold to View",
    maskSize: "Area Size",
    maskIntensity: "Texture Noise (Realism)",
    modeBlur: "Blur",
    modePixel: "Pixelate",
    modeFill: "Color",
    modeInpaint: "Smart Repair",
    fillColor: "Fill Color"
  }
};

const App = () => {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const t = TRANSLATIONS[language];

  // Image State
  const [image, setImage] = useState<string | null>(null); // Original Upload
  const [processedBaseImage, setProcessedBaseImage] = useState<string | null>(null); // AI Cleaned Image
  const [processedImage, setProcessedImage] = useState<string | null>(null); // Final Composition

  // Preview Source State for Comparison
  const [previewSource, setPreviewSource] = useState<'original' | 'cleaned' | 'final'>('final');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiRemoving, setIsAiRemoving] = useState(false);

  // Tools & Config State
  const [activeTools, setActiveTools] = useState<ProcessingTool[]>([ProcessingTool.REMOVE_WATERMARK]);
  const [activeTab, setActiveTab] = useState<'enhance' | 'text' | 'logo' | 'mask'>('enhance');

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [resizeMode, setResizeMode] = useState<ResizeMode>(ResizeMode.FIT);
  const [resolution, setResolution] = useState<ImageResolution>(ImageResolution.RES_1K);

  // Settings State
  const [prompt, setPrompt] = useState('CoverCraft Demo');
  const [textSettings, setTextSettings] = useState({
    size: 50,
    color: '#ffffff',
    alignment: 'center' as TextAlignment,
    positionX: 50,
    positionY: 50,
    strokeWidth: 4,
    shadowBlur: 10,
    shadowColor: '#000000'
  });

  const [enhanceSettings, setEnhanceSettings] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0
  });

  const [maskSettings, setMaskSettings] = useState<MaskSettings>({
    x: 50,
    y: 50,
    width: 20,
    height: 10,
    intensity: 15, // Default noise amount
    mode: 'inpaint', // Default to Smart Repair
    fillColor: '#ffffff'
  });

  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    data: '',
    size: 20,
    opacity: 100,
    positionX: 50,
    positionY: 50
  });

  // Interaction State
  const [dragTarget, setDragTarget] = useState<'text' | 'logo' | 'mask' | null>(null);
  const [resizeTarget, setResizeTarget] = useState<'text' | 'logo' | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImage(ev.target.result as string);
          setProcessedBaseImage(null); // Reset AI processing on new upload
          setPreviewSource('final');
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setLogoSettings(prev => ({ ...prev, data: ev.target!.result as string }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleTool = (tool: ProcessingTool) => {
    setActiveTools(prev => {
      const exists = prev.includes(tool);
      let newTools;

      if (exists) {
        newTools = prev.filter(t => t !== tool);
        if (activeTab === getTabForTool(tool)) {
          const remaining = newTools.find(t => getTabForTool(t) !== undefined);
          if (remaining) setActiveTab(getTabForTool(remaining)!);
        }
      } else {
        newTools = [...prev, tool];
        const newTab = getTabForTool(tool);
        if (newTab) setActiveTab(newTab);
      }
      return newTools;
    });
  };

  const getTabForTool = (tool: ProcessingTool): 'enhance' | 'text' | 'logo' | 'mask' | undefined => {
    if (tool === ProcessingTool.REMOVE_WATERMARK) return 'enhance';
    if (tool === ProcessingTool.ADD_TEXT) return 'text';
    if (tool === ProcessingTool.ADD_LOGO) return 'logo';
    if (tool === ProcessingTool.ADD_MASK) return 'mask';
    return undefined;
  };

  // Re-run composition when settings change
  useEffect(() => {
    if (image) {
      runProcessing(true); // Run in preview mode
    }
  }, [image, processedBaseImage, activeTools, aspectRatio, resizeMode, prompt, textSettings, enhanceSettings, logoSettings, maskSettings]);

  const handleAiRemove = async () => {
    if (!image) return;
    setIsAiRemoving(true);
    try {
      const cleanImage = await removeWatermarkWithGemini(image);
      setProcessedBaseImage(cleanImage);
    } catch (e) {
      console.error(e);
      alert("AI processing failed. Please check your API key or try again.");
    } finally {
      setIsAiRemoving(false);
    }
  };

  const handleRevert = () => {
    setProcessedBaseImage(null);
  };

  const runProcessing = async (isPreview: boolean) => {
    if (!image) return;

    try {
      const config: ProcessingConfig = {
        activeTools,
        prompt: activeTools.includes(ProcessingTool.ADD_TEXT) ? prompt : "",
        aspectRatio,
        resizeMode,
        resolution: isPreview ? ImageResolution.RES_1K : resolution,
        model: ModelType.FLASH,
        textSettings,
        enhanceSettings,
        logoSettings,
        maskSettings,
        previewMode: isPreview
      };

      // Use the AI cleaned image if available, otherwise original
      const sourceImage = processedBaseImage || image;
      const result = await processImageLocal(sourceImage, config);
      setProcessedImage(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      setIsProcessing(true);
      const config: ProcessingConfig = {
        activeTools,
        prompt: activeTools.includes(ProcessingTool.ADD_TEXT) ? prompt : "",
        aspectRatio,
        resizeMode,
        resolution,
        model: ModelType.FLASH,
        textSettings,
        enhanceSettings,
        logoSettings,
        maskSettings,
        previewMode: false
      };

      const sourceImage = processedBaseImage || image;
      const finalImage = await processImageLocal(sourceImage, config);

      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `covercraft_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, target: 'text' | 'logo' | 'mask') => {
    e.preventDefault();
    e.stopPropagation();
    setDragTarget(target);
    if (target === 'text') setActiveTab('text');
    if (target === 'logo') setActiveTab('logo');
    if (target === 'mask') setActiveTab('mask');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((!dragTarget && !resizeTarget) || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();

    // Handle Resizing
    if (resizeTarget) {
      const settings = resizeTarget === 'text' ? textSettings : logoSettings;
      // @ts-ignore - positionX/Y exist on both
      const centerX = rect.left + rect.width * (settings.positionX / 100);
      // @ts-ignore
      const centerY = rect.top + rect.height * (settings.positionY / 100);

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Convert distance to percentage of width (assuming handle is at radius = size/2 %)
      const distPercent = (dist / rect.width) * 100;
      const newSize = distPercent * 2;

      if (resizeTarget === 'text') {
        setTextSettings(prev => ({ ...prev, size: Math.min(150, Math.max(10, newSize)) }));
      } else {
        setLogoSettings(prev => ({ ...prev, size: Math.min(50, Math.max(5, newSize)) }));
      }
      return;
    }

    // Handle Moving
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    if (dragTarget === 'text') {
      setTextSettings(prev => ({ ...prev, positionX: clampedX, positionY: clampedY }));
    } else if (dragTarget === 'logo') {
      setLogoSettings(prev => ({ ...prev, positionX: clampedX, positionY: clampedY }));
    } else if (dragTarget === 'mask') {
      setMaskSettings(prev => ({ ...prev, x: clampedX, y: clampedY }));
    }
  };

  const handleMouseUp = () => {
    setDragTarget(null);
    setResizeTarget(null);
  };

  // Logic to determine which image to display based on comparison state
  const getDisplayImage = () => {
    if (previewSource === 'original' && image) return image;
    if (previewSource === 'cleaned' && processedBaseImage) return processedBaseImage;
    return processedImage || image; // Default final
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'enhance':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* AI Removal Section */}
            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex flex-col items-center text-center space-y-3">
              <div className="flex items-center space-x-2 text-primary">
                <MagicIcon />
                <span className="text-xs font-bold uppercase tracking-wider">{t.enhance}</span>
              </div>

              {!processedBaseImage ? (
                <button
                  onClick={handleAiRemove}
                  disabled={isAiRemoving}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-fuchsia-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center space-x-2"
                >
                  {isAiRemoving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.aiRemoving}</span>
                    </>
                  ) : (
                    <span>{t.startAiRemove}</span>
                  )}
                </button>
              ) : (
                <div className="w-full space-y-2">
                  <div className="w-full py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t.aiRemoved}</span>
                  </div>
                  <button
                    onClick={handleRevert}
                    className="text-xs text-ink-400 underline hover:text-ink-600"
                  >
                    {t.revert}
                  </button>
                </div>
              )}
              <p className="text-[10px] text-sky-700 leading-tight px-1">
                {t.watermarkDesc}
              </p>
            </div>

            {/* Manual Enhancement Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">{t.manualEnhance}</h3>
                {(enhanceSettings.brightness !== 0 || enhanceSettings.contrast !== 0 || enhanceSettings.saturation !== 0) && (
                  <button
                    onClick={() => setEnhanceSettings({ brightness: 0, contrast: 0, saturation: 0 })}
                    className="text-[10px] text-primary hover:text-primary/80"
                  >
                    {t.reset}
                  </button>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-ink-700">{t.brightness}</label>
                  <span className="text-[10px] text-ink-400">{enhanceSettings.brightness}</span>
                </div>
                <input type="range" min="-50" max="50" value={enhanceSettings.brightness} onChange={(e) => setEnhanceSettings(prev => ({ ...prev, brightness: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-ink-700">{t.contrast}</label>
                  <span className="text-[10px] text-ink-400">{enhanceSettings.contrast}</span>
                </div>
                <input type="range" min="-50" max="50" value={enhanceSettings.contrast} onChange={(e) => setEnhanceSettings(prev => ({ ...prev, contrast: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-ink-700">{t.saturation}</label>
                  <span className="text-[10px] text-ink-400">{enhanceSettings.saturation}</span>
                </div>
                <input type="range" min="-50" max="50" value={enhanceSettings.saturation} onChange={(e) => setEnhanceSettings(prev => ({ ...prev, saturation: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
            </div>
          </div>
        );
      case 'mask':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Mode Selector */}
            <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex space-x-1">
              {(['inpaint', 'blur', 'pixelate', 'fill'] as MaskMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setMaskSettings(prev => ({ ...prev, mode }))}
                  className={`flex-1 py-1.5 text-[9px] sm:text-[10px] font-bold rounded-lg transition-all ${maskSettings.mode === mode ? 'bg-white shadow text-primary ring-1 ring-black/5' : 'text-ink-500 hover:text-ink-900'}`}
                >
                  {mode === 'blur' ? t.modeBlur : mode === 'pixelate' ? t.modePixel : mode === 'fill' ? t.modeFill : t.modeInpaint}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">{t.maskSize}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-8">W</span>
                <input type="range" min="5" max="100" value={maskSettings.width} onChange={(e) => setMaskSettings(prev => ({ ...prev, width: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-8">H</span>
                <input type="range" min="5" max="100" value={maskSettings.height} onChange={(e) => setMaskSettings(prev => ({ ...prev, height: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
            </div>

            {maskSettings.mode !== 'fill' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">{t.maskIntensity}</span>
                <div className="flex items-center space-x-2">
                  <input type="range" min="0" max="50" value={maskSettings.intensity} onChange={(e) => setMaskSettings(prev => ({ ...prev, intensity: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
              </div>
            )}

            {maskSettings.mode === 'fill' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3 flex items-center justify-between">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">{t.fillColor}</span>
                <input type="color" value={maskSettings.fillColor} onChange={(e) => setMaskSettings(prev => ({ ...prev, fillColor: e.target.value }))} className="h-6 w-8 p-0 border-0 rounded cursor-pointer" />
              </div>
            )}

            {/* Position Controls */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">{t.position}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-12">{t.posX}</span>
                <input type="range" min="0" max="100" value={maskSettings.x} onChange={(e) => setMaskSettings(prev => ({ ...prev, x: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-12">{t.posY}</span>
                <input type="range" min="0" max="100" value={maskSettings.y} onChange={(e) => setMaskSettings(prev => ({ ...prev, y: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
            </div>

            <p className="text-[10px] text-center text-ink-400 mt-1">{t.dragMask}</p>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t.textPlaceholder} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none bg-slate-50 text-ink-900 resize-none h-20" />

            {/* Position Controls */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">{t.position}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-12">{t.posX}</span>
                <input type="range" min="0" max="100" value={textSettings.positionX} onChange={(e) => setTextSettings(prev => ({ ...prev, positionX: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                <span className="text-[10px] text-ink-400 w-6 text-right">{Math.round(textSettings.positionX)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-12">{t.posY}</span>
                <input type="range" min="0" max="100" value={textSettings.positionY} onChange={(e) => setTextSettings(prev => ({ ...prev, positionY: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                <span className="text-[10px] text-ink-400 w-6 text-right">{Math.round(textSettings.positionY)}%</span>
              </div>
            </div>

            {/* Typography - Modular Style */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">{t.typography}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-8">{t.textSize}</span>
                <input type="range" min="10" max="150" value={textSettings.size} onChange={(e) => setTextSettings(prev => ({ ...prev, size: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1 bg-white border border-slate-200 rounded-lg p-0.5">
                  {(['left', 'center', 'right'] as TextAlignment[]).map((align) => (
                    <button
                      key={align}
                      onClick={() => setTextSettings(prev => ({ ...prev, alignment: align }))}
                      className={`p-1.5 rounded-md transition-colors ${textSettings.alignment === align ? 'bg-primary/10 text-primary shadow-sm' : 'text-ink-400 hover:text-ink-700'}`}
                    >
                      {align === 'left' ? <AlignLeftIcon /> : align === 'center' ? <AlignCenterIcon /> : <AlignRightIcon />}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                  <span className="text-xs text-ink-500">{t.textColor}</span>
                  <input type="color" value={textSettings.color} onChange={(e) => setTextSettings(prev => ({ ...prev, color: e.target.value }))} className="h-5 w-6 p-0 border-0 rounded cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Effects - Modular Style */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">{t.effects}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-8">{t.textStroke}</span>
                <input type="range" min="0" max="20" value={textSettings.strokeWidth || 0} onChange={(e) => setTextSettings(prev => ({ ...prev, strokeWidth: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-8">{t.shadowBlur}</span>
                <input type="range" min="0" max="50" value={textSettings.shadowBlur || 0} onChange={(e) => setTextSettings(prev => ({ ...prev, shadowBlur: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                <input type="color" value={textSettings.shadowColor} onChange={(e) => setTextSettings(prev => ({ ...prev, shadowColor: e.target.value }))} className="h-5 w-6 p-0 border-0 rounded cursor-pointer" />
              </div>
            </div>

            <p className="text-[10px] text-center text-ink-400 mt-1">{t.dragText}</p>
          </div>
        );
      case 'logo':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-white transition-colors">
              {logoSettings.data ? <img src={logoSettings.data} alt="logo preview" className="h-16 object-contain" /> : (
                <>
                  <UploadIcon />
                  <span className="text-xs text-ink-500 mt-1">{t.uploadLogo}</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>

            {/* Position Controls */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
              <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block mb-1">{t.position}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-12">{t.posX}</span>
                <input type="range" min="0" max="100" value={logoSettings.positionX} onChange={(e) => setLogoSettings(prev => ({ ...prev, positionX: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                <span className="text-[10px] text-ink-400 w-6 text-right">{Math.round(logoSettings.positionX)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-ink-500 w-12">{t.posY}</span>
                <input type="range" min="0" max="100" value={logoSettings.positionY} onChange={(e) => setLogoSettings(prev => ({ ...prev, positionY: Number(e.target.value) }))} className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                <span className="text-[10px] text-ink-400 w-6 text-right">{Math.round(logoSettings.positionY)}%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">{t.logoSize}</label>
              <input type="range" min="5" max="50" value={logoSettings.size} onChange={(e) => setLogoSettings(prev => ({ ...prev, size: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">{t.logoOpacity}</label>
              <input type="range" min="10" max="100" value={logoSettings.opacity} onChange={(e) => setLogoSettings(prev => ({ ...prev, opacity: Number(e.target.value) }))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
            <p className="text-[10px] text-center text-ink-400 mt-1">{t.dragLogo}</p>
          </div>
        );
      default:
        return <div className="text-center text-ink-400 py-4 text-sm">Select a tool</div>;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-sky-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 font-sans text-slate-600">

      {/* App Window - Boxed Layout */}
      <div className="w-full max-w-[1200px] h-full lg:h-[85vh] bg-white rounded-3xl shadow-2xl shadow-sky-200/50 border border-white/50 flex flex-col overflow-hidden relative">

        {/* Header - Now part of the box */}
        <header className="flex-none bg-white/50 backdrop-blur-sm border-b border-sky-100/50 z-20 h-14 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-sky-200 text-sm">
              C
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                {t.appName}
              </h1>
            </div>
          </div>
          <button
            onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
            className="text-xs font-medium text-ink-500 hover:text-primary px-3 py-1 rounded-full border border-slate-200 hover:border-primary transition-colors bg-white/50"
          >
            {language === 'zh' ? 'English' : '中文'}
          </button>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* Left Sidebar */}
          <aside className="w-full lg:w-[300px] flex-shrink-0 flex flex-col bg-white/60 border-b lg:border-b-0 lg:border-r border-sky-100 overflow-y-auto z-10 backdrop-blur-sm order-2 lg:order-1 max-h-[40vh] lg:max-h-full">
            <div className="p-4 space-y-4">

              {/* Tool Selection Grid */}
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-sky-100">
                <h2 className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-2 px-1">{t.settings}</h2>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => toggleTool(ProcessingTool.REMOVE_WATERMARK)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${activeTools.includes(ProcessingTool.REMOVE_WATERMARK) ? 'bg-primary/10 text-primary ring-1 ring-primary' : 'bg-slate-50 text-ink-500 hover:bg-slate-100'}`}
                  >
                    <EnhanceIcon />
                    <span className="text-[10px] mt-1 font-medium leading-tight text-center">{t.enhance}</span>
                  </button>
                  <button
                    onClick={() => toggleTool(ProcessingTool.ADD_MASK)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${activeTools.includes(ProcessingTool.ADD_MASK) ? 'bg-primary/10 text-primary ring-1 ring-primary' : 'bg-slate-50 text-ink-500 hover:bg-slate-100'}`}
                  >
                    <EraseIcon />
                    <span className="text-[10px] mt-1 font-medium leading-tight text-center">{t.mask}</span>
                  </button>
                  <button
                    onClick={() => toggleTool(ProcessingTool.ADD_TEXT)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${activeTools.includes(ProcessingTool.ADD_TEXT) ? 'bg-primary/10 text-primary ring-1 ring-primary' : 'bg-slate-50 text-ink-500 hover:bg-slate-100'}`}
                  >
                    <TextIcon />
                    <span className="text-[10px] mt-1 font-medium">{t.text}</span>
                  </button>
                  <button
                    onClick={() => toggleTool(ProcessingTool.ADD_LOGO)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${activeTools.includes(ProcessingTool.ADD_LOGO) ? 'bg-primary/10 text-primary ring-1 ring-primary' : 'bg-slate-50 text-ink-500 hover:bg-slate-100'}`}
                  >
                    <LogoIcon />
                    <span className="text-[10px] mt-1 font-medium">{t.logo}</span>
                  </button>
                </div>
              </div>

              {/* Settings Panel with Tabs */}
              {activeTools.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">

                  {/* Tab Navigation */}
                  {activeTools.length > 1 && (
                    <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
                      {activeTools.includes(ProcessingTool.REMOVE_WATERMARK) && (
                        <button
                          onClick={() => setActiveTab('enhance')}
                          className={`flex-1 min-w-[60px] py-2 text-[10px] font-bold uppercase tracking-wide text-center transition-colors whitespace-nowrap ${activeTab === 'enhance' ? 'text-primary border-b-2 border-primary bg-sky-50/50' : 'text-ink-400 hover:bg-slate-50'}`}
                        >
                          {t.enhance}
                        </button>
                      )}
                      {activeTools.includes(ProcessingTool.ADD_MASK) && (
                        <button
                          onClick={() => setActiveTab('mask')}
                          className={`flex-1 min-w-[60px] py-2 text-[10px] font-bold uppercase tracking-wide text-center transition-colors whitespace-nowrap ${activeTab === 'mask' ? 'text-primary border-b-2 border-primary bg-sky-50/50' : 'text-ink-400 hover:bg-slate-50'}`}
                        >
                          {t.mask}
                        </button>
                      )}
                      {activeTools.includes(ProcessingTool.ADD_TEXT) && (
                        <button
                          onClick={() => setActiveTab('text')}
                          className={`flex-1 min-w-[60px] py-2 text-[10px] font-bold uppercase tracking-wide text-center transition-colors whitespace-nowrap ${activeTab === 'text' ? 'text-primary border-b-2 border-primary bg-sky-50/50' : 'text-ink-400 hover:bg-slate-50'}`}
                        >
                          {t.text}
                        </button>
                      )}
                      {activeTools.includes(ProcessingTool.ADD_LOGO) && (
                        <button
                          onClick={() => setActiveTab('logo')}
                          className={`flex-1 min-w-[60px] py-2 text-[10px] font-bold uppercase tracking-wide text-center transition-colors whitespace-nowrap ${activeTab === 'logo' ? 'text-primary border-b-2 border-primary bg-sky-50/50' : 'text-ink-400 hover:bg-slate-50'}`}
                        >
                          {t.logo}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tab Content Body */}
                  <div className="p-4">
                    {renderTabContent()}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative order-1 lg:order-2">

            {/* Preview Canvas Area - Vertical Flex Layout */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-100/50">

              {/* Replace Image Button (Absolute Positioned in Top Right) */}
              {image && (
                <div className="absolute top-4 right-6 z-20">
                  <label className="cursor-pointer flex items-center space-x-2 text-xs font-medium text-ink-600 hover:text-primary transition-all bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
                    <UploadIcon />
                    <span>{t.replaceImage}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              )}

              {/* Top: Image Area (Flexible Height) */}
              <div className="flex-1 w-full min-h-0 relative flex items-center justify-center p-6">
                {/* Container constraint - Hugs the image content */}
                <div className="w-full h-full relative flex items-center justify-center">
                  {image ? (
                    <div
                      className="relative shadow-2xl rounded-sm border border-white/50 overflow-hidden flex"
                      ref={previewRef}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        aspectRatio: 'auto'
                      }}
                    >
                      {/* Checkered Canvas Background - Only behind the image */}
                      <div className="absolute inset-0 z-0"
                        style={{
                          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                          backgroundColor: 'white'
                        }}
                      />

                      <img
                        src={getDisplayImage() || ''}
                        alt="Preview"
                        className="relative z-10 block max-w-full max-h-full object-contain"
                        style={{ maxHeight: 'calc(100vh - 280px)' }}
                        draggable={false}
                      />

                      {/* Draggable Anchors - Absolute to the image container */}
                      {previewSource === 'final' && activeTools.includes(ProcessingTool.ADD_MASK) && (
                        <div
                          className="absolute border-2 border-red-400/50 bg-red-400/10 cursor-move z-20 hover:bg-red-400/20 transition-colors shadow-sm"
                          style={{
                            left: `calc(${maskSettings.x}% - ${maskSettings.width / 2}%)`,
                            top: `calc(${maskSettings.y}% - ${maskSettings.height / 2}%)`,
                            width: `${maskSettings.width}%`,
                            height: `${maskSettings.height}%`
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'mask')}
                          title={t.dragMask}
                        >
                          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      )}
                      {previewSource === 'final' && activeTools.includes(ProcessingTool.ADD_TEXT) && (
                        (() => {
                          // Estimate Text Dimensions for Bounding Box
                          const lines = prompt.split('\n');
                          const maxLineLen = Math.max(...lines.map(l => l.length), 1);
                          const fontSizePercent = textSettings.size / 5; // Based on size/500 * 100
                          const lineHeightPercent = fontSizePercent * 1.2;

                          // Width estimation: char width approx 0.6em
                          const widthPercent = maxLineLen * fontSizePercent * 0.6;
                          const heightPercent = lines.length * lineHeightPercent;

                          return (
                            <>
                              {/* Bounding Box */}
                              <div
                                className="absolute border-2 border-dashed border-primary/50 pointer-events-none z-10"
                                style={{
                                  left: `calc(${textSettings.positionX}% - ${widthPercent / 2}%)`,
                                  top: `calc(${textSettings.positionY}% - ${heightPercent / 2}%)`,
                                  width: `${widthPercent}%`,
                                  height: `${heightPercent}%`,
                                }}
                              >
                                {/* Resize Handle (Bottom Right) */}
                                <div
                                  className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-primary rounded-full shadow-sm cursor-nwse-resize z-20 pointer-events-auto hover:scale-125 transition-transform"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setResizeTarget('text');
                                    setActiveTab('text');
                                  }}
                                  title={t.textSize}
                                />
                              </div>

                              {/* Center Move Handle */}
                              <div
                                className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md cursor-move z-20 hover:scale-125 transition-transform"
                                style={{ left: `calc(${textSettings.positionX}% - 8px)`, top: `calc(${textSettings.positionY}% - 8px)` }}
                                onMouseDown={(e) => handleMouseDown(e, 'text')}
                                title={t.dragText}
                              >
                                <div className="absolute inset-0.5 bg-primary rounded-full opacity-20"></div>
                              </div>
                            </>
                          );
                        })()
                      )}
                      {previewSource === 'final' && activeTools.includes(ProcessingTool.ADD_LOGO) && logoSettings.data && (
                        <>
                          {/* Bounding Box */}
                          <div
                            className="absolute border-2 border-dashed border-secondary/50 pointer-events-none z-10"
                            style={{
                              left: `calc(${logoSettings.positionX}% - ${logoSettings.size / 2}%)`,
                              top: `calc(${logoSettings.positionY}% - ${logoSettings.size / 2}%)`, // Assuming square for guide
                              width: `${logoSettings.size}%`,
                              height: `${logoSettings.size}%`,
                            }}
                          >
                            {/* Resize Handle (Bottom Right) */}
                            <div
                              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-secondary rounded-full shadow-sm cursor-nwse-resize z-20 pointer-events-auto hover:scale-125 transition-transform"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setResizeTarget('logo');
                                setActiveTab('logo');
                              }}
                              title={t.logoSize}
                            />
                          </div>

                          {/* Center Move Handle */}
                          <div
                            className="absolute w-4 h-4 bg-white border-2 border-secondary rounded-full shadow-md cursor-move z-20 hover:scale-125 transition-transform"
                            style={{ left: `calc(${logoSettings.positionX}% - 8px)`, top: `calc(${logoSettings.positionY}% - 8px)` }}
                            onMouseDown={(e) => handleMouseDown(e, 'logo')}
                            title={t.dragLogo}
                          >
                            <div className="absolute inset-0.5 bg-secondary rounded-full opacity-20"></div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/40 transition-colors z-20 rounded-3xl border-2 border-dashed border-slate-300 bg-white/50">
                      <div className="p-5 bg-white rounded-full shadow-xl shadow-sky-100/50 mb-3 group-hover:scale-110 transition-transform duration-300">
                        <div className="text-primary"><LargeUploadIcon /></div>
                      </div>
                      <span className="text-base font-semibold text-ink-700">{t.uploadTitle}</span>
                      <span className="text-xs text-ink-400 mt-1">{t.uploadDesc}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* Bottom: Comparison Dock (Fixed Height, No Overlap) */}
              <div className="flex-none h-auto w-full flex items-center justify-center pb-6 z-10">
                {image && (
                  <div className="bg-white/90 backdrop-blur border border-sky-200 p-2 rounded-2xl shadow-lg flex items-center space-x-3 transition-all hover:scale-105">
                    {/* Original */}
                    <button
                      className={`flex flex-col items-center space-y-1 outline-none transition-opacity ${previewSource === 'original' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                      onMouseEnter={() => setPreviewSource('original')}
                      onMouseLeave={() => setPreviewSource('final')}
                      onTouchStart={() => setPreviewSource('original')}
                      onTouchEnd={() => setPreviewSource('final')}
                      title={t.compareTip}
                    >
                      <div className={`w-8 h-8 rounded-lg border-2 overflow-hidden ${previewSource === 'original' ? 'border-primary' : 'border-slate-300'}`}>
                        <img src={image} className="w-full h-full object-cover" alt="Original" />
                      </div>
                      <span className="text-[9px] font-bold text-ink-500 uppercase tracking-tight">{t.compareOriginal}</span>
                    </button>

                    {processedBaseImage && (
                      <>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <button
                          className={`flex flex-col items-center space-y-1 outline-none transition-opacity ${previewSource === 'cleaned' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                          onMouseEnter={() => setPreviewSource('cleaned')}
                          onMouseLeave={() => setPreviewSource('final')}
                          onTouchStart={() => setPreviewSource('cleaned')}
                          onTouchEnd={() => setPreviewSource('final')}
                          title={t.compareTip}
                        >
                          <div className={`w-8 h-8 rounded-lg border-2 overflow-hidden ${previewSource === 'cleaned' ? 'border-secondary' : 'border-slate-300'}`}>
                            <img src={processedBaseImage} className="w-full h-full object-cover" alt="AI Clean" />
                          </div>
                          <span className="text-[9px] font-bold text-secondary uppercase tracking-tight">{t.compareAi}</span>
                        </button>
                      </>
                    )}

                    <div className="w-px h-6 bg-slate-200"></div>

                    {/* Final */}
                    <button
                      className={`flex flex-col items-center space-y-1 outline-none ${previewSource === 'final' ? 'opacity-100' : 'opacity-60'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg border-2 overflow-hidden ${previewSource === 'final' ? 'border-primary' : 'border-slate-300'}`}>
                        <img src={processedImage || image || ''} className="w-full h-full object-cover" alt="Final" />
                      </div>
                      <span className="text-[9px] font-bold text-primary uppercase tracking-tight">{t.compareFinal}</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Bar: Settings & Export - Optimized */}
            <div className="flex-none bg-white border-t border-sky-100 p-3 lg:px-6 z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Left Group: Global Image Settings */}
                <div className="flex flex-wrap gap-2 lg:gap-4 items-center justify-center sm:justify-start w-full sm:w-auto">
                  {/* Aspect Ratio */}
                  <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <div className="flex space-x-0.5">
                      {[AspectRatio.LANDSCAPE, AspectRatio.PORTRAIT, AspectRatio.SQUARE].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${aspectRatio === ratio ? 'bg-white shadow-sm text-primary ring-1 ring-black/5' : 'text-ink-500 hover:text-ink-900'}`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resize Mode */}
                  <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <div className="flex space-x-0.5">
                      {[ResizeMode.FIT, ResizeMode.FILL].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setResizeMode(mode)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap ${resizeMode === mode ? 'bg-white shadow-sm text-primary ring-1 ring-black/5' : 'text-ink-500 hover:text-ink-900'}`}
                        >
                          {mode === ResizeMode.FIT ? t.fit : t.fill}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution - Moved here to balance layout */}
                  <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 h-[34px]">
                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">{t.resolution}</span>
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value as ImageResolution)}
                      className="bg-transparent text-ink-700 text-xs font-medium focus:outline-none cursor-pointer pr-1"
                    >
                      <option value={ImageResolution.RES_1K}>1K</option>
                      <option value={ImageResolution.RES_2K}>2K</option>
                      <option value={ImageResolution.RES_4K}>4K</option>
                    </select>
                  </div>
                </div>

                {/* Right Group: Action */}
                <div className="w-full sm:w-auto flex justify-center">
                  <button
                    onClick={handleDownload}
                    disabled={!image || isProcessing || isAiRemoving}
                    className="w-full sm:w-auto px-8 bg-gradient-to-r from-primary to-secondary hover:from-sky-400 hover:to-cyan-400 text-white py-2 rounded-lg text-sm font-medium shadow-md shadow-sky-200 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap h-[36px]"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <DownloadIcon />
                    )}
                    <span>{t.download}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

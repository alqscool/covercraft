
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageResolution, ProcessingConfig, ProcessingTool, ResizeMode } from "../types";

/**
 * Load an image from a base64 string.
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Failed to load image"));
    img.src = src;
  });
};

/**
 * Parse Aspect Ratio string to width/height ratio.
 */
const getAspectRatioValue = (ar: AspectRatio): number => {
  const [w, h] = ar.split(':').map(Number);
  return w / h;
};

/**
 * Get target dimensions based on resolution and aspect ratio.
 */
const getTargetDimensions = (resolution: ImageResolution, aspectRatio: number, previewMode: boolean = false): { width: number, height: number } => {
  let baseSize = 1024; // 1K

  if (previewMode) {
    baseSize = 800; // Fixed small size for fast preview
  } else {
    if (resolution === ImageResolution.RES_2K) baseSize = 2048;
    if (resolution === ImageResolution.RES_4K) baseSize = 3840;
  }

  // Assume baseSize is the larger dimension
  if (aspectRatio > 1) {
    return { width: baseSize, height: Math.round(baseSize / aspectRatio) };
  } else {
    return { width: Math.round(baseSize * aspectRatio), height: baseSize };
  }
};

/**
 * Call Gemini API to remove watermark
 */
export const removeWatermarkWithGemini = async (imageBase64: string): Promise<string> => {
  // Extract base64 data
  const base64Data = imageBase64.split(',')[1];
  const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Remove all watermarks, logos, and copyright text overlays from this image. Inpaint the area to match the surrounding background naturally. Return only the clean image."
          }
        ]
      }
    });

    // Extract image from response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image returned from AI");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Process an image locally using HTML5 Canvas.
 */
export const processImageLocal = async (
  imageBase64: string,
  config: ProcessingConfig
): Promise<string> => {

  const img = await loadImage(imageBase64);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error("Could not get canvas context");

  // 1. Determine Target Size
  const ratioValue = getAspectRatioValue(config.aspectRatio);
  const { width: targetW, height: targetH } = getTargetDimensions(config.resolution, ratioValue, config.previewMode);

  canvas.width = targetW;
  canvas.height = targetH;

  // 2. Clear Canvas (Black base)
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, targetW, targetH);

  // PREPARE FILTERS (Enhance) - Legacy basic filters (optional now that we have AI)
  let filterString = "none";
  if (config.activeTools.includes(ProcessingTool.REMOVE_WATERMARK) && config.enhanceSettings) {
    let { brightness = 0, contrast = 0, saturation = 0 } = config.enhanceSettings;

    // Only apply if values are non-zero (user manually adjusted)
    if (brightness !== 0 || contrast !== 0 || saturation !== 0) {
      const b = 100 + brightness;
      const c = 100 + contrast;
      const s = 100 + saturation;
      filterString = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
    }
  }

  // 3. Resize Logic (Fit vs Fill)
  const imgRatio = img.width / img.height;
  const targetRatio = targetW / targetH;
  const isSameRatio = Math.abs(imgRatio - targetRatio) < 0.05;

  // Apply filters for the main image drawing
  ctx.filter = filterString;

  if (isSameRatio) {
    // Exact match, just draw
    ctx.drawImage(img, 0, 0, targetW, targetH);
  } else {
    if (config.resizeMode === ResizeMode.FILL) {
      // --- FILL / COVER MODE (Crop to fill) ---
      let drawW, drawH, offsetX, offsetY;

      if (imgRatio > targetRatio) {
        // Image is wider than target: Crop left/right
        drawH = targetH;
        drawW = targetH * imgRatio;
        offsetX = (targetW - drawW) / 2;
        offsetY = 0;
      } else {
        // Image is taller than target: Crop top/bottom
        drawW = targetW;
        drawH = targetW / imgRatio;
        offsetX = 0;
        offsetY = (targetH - drawH) / 2;
      }
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    } else {
      // --- FIT MODE (Blur Background + Contain) ---

      // 1. Draw Blurred Background (Remove filter for background, or apply different one)
      ctx.save();
      ctx.filter = "blur(40px) brightness(0.6)"; // Background is always blurred and darkened
      ctx.drawImage(img, 0, 0, targetW, targetH);
      ctx.restore();

      // 2. Calculate contained dimensions
      let drawW = targetW;
      let drawH = targetW / imgRatio;

      if (drawH > targetH) {
        drawH = targetH;
        drawW = targetH * imgRatio;
      }

      const offsetX = (targetW - drawW) / 2;
      const offsetY = (targetH - drawH) / 2;

      // 3. Draw main image centered
      // We re-apply the filter here for the main image to ensure enhancements apply
      ctx.filter = filterString;

      // Add a subtle shadow to separate from background
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 20;

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      ctx.shadowBlur = 0;
    }
  }

  ctx.filter = "none";

  // Step 4: Add Manual Erase Mask (Blur/Pixelate/Fill/Inpaint)
  if (config.activeTools.includes(ProcessingTool.ADD_MASK) && config.maskSettings) {
    const { x, y, width, height, intensity, mode, fillColor } = config.maskSettings;

    const mx = (targetW * x) / 100;
    const my = (targetH * y) / 100;
    const mw = (targetW * width) / 100;
    const mh = (targetH * height) / 100;

    // Ensure rect is within bounds for safety
    const boxX = mx - mw / 2;
    const boxY = my - mh / 2;
    const boxW = mw;
    const boxH = mh;

    ctx.save();
    // Define the clipping region for the mask
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    if (mode === 'fill') {
      // --- Solid Fill ---
      ctx.fillStyle = fillColor || '#ffffff';
      ctx.fillRect(boxX, boxY, boxW, boxH);
    }
    else if (mode === 'pixelate' && intensity > 0) {
      // --- Mosaic / Pixelate ---
      const factor = Math.max(1, Math.floor((intensity / 100) * 50) + 2);
      const sw = Math.max(1, Math.floor(boxW / factor));
      const sh = Math.max(1, Math.floor(boxH / factor));

      const tempC = document.createElement('canvas');
      tempC.width = sw;
      tempC.height = sh;
      const tCtx = tempC.getContext('2d');

      if (tCtx) {
        tCtx.imageSmoothingEnabled = false;
        tCtx.drawImage(canvas, boxX, boxY, boxW, boxH, 0, 0, sw, sh);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempC, boxX, boxY, boxW, boxH);
        ctx.imageSmoothingEnabled = true;
      }
    }
    else if (mode === 'inpaint') {
      // --- Smart Repair (Gradient Inpaint with Texture Noise) ---

      const patchW = boxW;
      const patchH = boxH;

      // Helper to create a gradient-faded stretched edge
      const createGradientOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number, direction: 'vertical' | 'horizontal') => {
        const grad = ctx.createLinearGradient(0, 0, direction === 'horizontal' ? w : 0, direction === 'horizontal' ? 0 : h);
        grad.addColorStop(0, 'rgba(0,0,0,0)'); // Transparent at start (top/left)
        grad.addColorStop(1, 'rgba(0,0,0,1)'); // Opaque at end (bottom/right)
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
      };

      // 1. Prepare Vertical Gradient Interpolation
      const vCanvas = document.createElement('canvas'); vCanvas.width = patchW; vCanvas.height = patchH;
      const vCtx = vCanvas.getContext('2d');

      if (vCtx) {
        let hasTop = false;
        let hasBottom = false;

        // Top Edge (Primary Fill)
        if (boxY > 0) {
          vCtx.drawImage(canvas, boxX, boxY - 1, boxW, 1, 0, 0, patchW, patchH);
          hasTop = true;
        }

        // Bottom Edge (Overlay with Gradient)
        if (boxY + boxH < targetH) {
          const bCanvas = document.createElement('canvas'); bCanvas.width = patchW; bCanvas.height = patchH;
          const bCtx = bCanvas.getContext('2d');
          if (bCtx) {
            bCtx.drawImage(canvas, boxX, boxY + boxH, boxW, 1, 0, 0, patchW, patchH);
            if (hasTop) {
              createGradientOverlay(bCtx, patchW, patchH, 'vertical');
              vCtx.drawImage(bCanvas, 0, 0);
            } else {
              // If no top, just fill with bottom
              vCtx.drawImage(bCanvas, 0, 0);
            }
            hasBottom = true;
          }
        }

        // If neither, we rely on H pass, or just blur what's there (shouldn't happen with correct bounds)
      }

      // 2. Prepare Horizontal Gradient Interpolation
      const hCanvas = document.createElement('canvas'); hCanvas.width = patchW; hCanvas.height = patchH;
      const hCtx = hCanvas.getContext('2d');
      if (hCtx) {
        let hasLeft = false;

        // Left Edge
        if (boxX > 0) {
          hCtx.drawImage(canvas, boxX - 1, boxY, 1, boxH, 0, 0, patchW, patchH);
          hasLeft = true;
        }
        // Right Edge
        if (boxX + boxW < targetW) {
          const rCanvas = document.createElement('canvas'); rCanvas.width = patchW; rCanvas.height = patchH;
          const rCtx = rCanvas.getContext('2d');
          if (rCtx) {
            rCtx.drawImage(canvas, boxX + boxW, boxY, 1, boxH, 0, 0, patchW, patchH);
            if (hasLeft) {
              createGradientOverlay(rCtx, patchW, patchH, 'horizontal');
              hCtx.drawImage(rCanvas, 0, 0);
            } else {
              hCtx.drawImage(rCanvas, 0, 0);
            }
          }
        }
      }

      // 3. Blend H and V
      // Draw V first
      ctx.drawImage(vCanvas, boxX, boxY);

      // Blend H on top with 50% opacity to average them
      ctx.globalAlpha = 0.5;
      ctx.drawImage(hCanvas, boxX, boxY);
      ctx.globalAlpha = 1.0;

      // 4. Subtle Blur to mix the seams
      // We blur the patch on the main canvas slightly
      ctx.filter = 'blur(2px)';
      ctx.drawImage(canvas, boxX, boxY, boxW, boxH, boxX, boxY, boxW, boxH);
      ctx.filter = 'none';

      // 5. Add Noise / Texture
      // Intensity slider controls noise amount (0-50 -> 0-100 scale factor)
      // Default intensity of 20 gives reasonable texture.
      if (intensity > 0) {
        const iData = ctx.getImageData(boxX, boxY, boxW, boxH);
        const data = iData.data;
        const noiseFactor = intensity * 2; // Strengthen impact

        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * noiseFactor;
          // Add noise while clamping
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
          // Alpha unchanged
        }
        ctx.putImageData(iData, boxX, boxY);
      }
    }
    else {
      // --- Gaussian Blur ---
      if (intensity > 0) {
        ctx.filter = `blur(${intensity}px)`;
        ctx.drawImage(canvas, 0, 0);
      }
    }

    ctx.restore();
    ctx.filter = "none";
  }

  // Step 5: Add Logo
  if (config.activeTools.includes(ProcessingTool.ADD_LOGO) && config.logoSettings && config.logoSettings.data) {
    try {
      const logoImg = await loadImage(config.logoSettings.data);
      const { size = 20, opacity = 100, positionX = 50, positionY = 50 } = config.logoSettings;

      // Calculate dimensions
      // Size 20 means 20% of canvas width (or height, whichever is smaller usually, or just width)
      // Let's use width for scaling consistency
      const logoW = (targetW * size) / 100;
      const logoH = logoW * (logoImg.height / logoImg.width);

      const x = (targetW * positionX) / 100 - (logoW / 2); // Center anchor
      const y = (targetH * positionY) / 100 - (logoH / 2); // Center anchor

      ctx.globalAlpha = opacity / 100;
      ctx.drawImage(logoImg, x, y, logoW, logoH);
      ctx.globalAlpha = 1.0;
    } catch (e) {
      console.warn("Failed to draw logo", e);
    }
  }

  // Step 6: Add Text
  if (config.activeTools.includes(ProcessingTool.ADD_TEXT)) {
    const text = config.prompt || "CoverCraft";
    const {
      size = 50,
      color = "#ffffff",
      alignment = 'center',
      positionX = 50,
      positionY = 50,
      strokeWidth = 4,
      shadowBlur = 10,
      shadowColor = "#000000",
      fontFamily = "Microsoft YaHei"
    } = config.textSettings || {};

    const baseFontSize = (targetW * size) / 500;
    const lineHeight = baseFontSize * 1.2;

    ctx.font = `bold ${baseFontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = alignment;

    const x = (targetW * positionX) / 100;
    const centerY = (targetH * positionY) / 100;

    const lines = text.split('\n');

    lines.forEach((line, index) => {
      const y = centerY + (index - (lines.length - 1) / 2) * lineHeight;

      if (strokeWidth > 0) {
        ctx.lineWidth = baseFontSize * (strokeWidth / 100);
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, x, y);
      }

      if (shadowBlur > 0) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = (baseFontSize * shadowBlur) / 100;
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }

      ctx.fillStyle = color;
      ctx.fillText(line, x, y);

      ctx.shadowBlur = 0;
    });
  }

  return canvas.toDataURL('image/png', 0.95);
};

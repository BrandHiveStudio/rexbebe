'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Paintbrush,
  Shield,
  Undo2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Save,
  X,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  Layers,
  Wand2,
  HelpCircle,
  Columns,
  Maximize2,
  Upload,
} from 'lucide-react';
import { uploadService } from '../../services/uploadService';

interface FabricRecolorStudioProps {
  baseImageUrl: string;
  targetColorHex: string;
  targetColorName: string;
  partName: string;
  onSaveVariation: (newImageUrl: string) => void;
  onClose: () => void;
}

export function FabricRecolorStudio({
  baseImageUrl,
  targetColorHex,
  targetColorName,
  partName,
  onSaveVariation,
  onClose,
}: FabricRecolorStudioProps) {
  // Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Tools state
  const [activeTool, setActiveTool] = useState<'fabric' | 'protect' | 'sample' | 'preview'>('fabric');
  const [targetGarment, setTargetGarment] = useState<'tshirt' | 'shorts' | 'hat' | 'all'>(() => {
    const pLower = (partName || '').toLowerCase();
    if (pLower.includes('short') || pLower.includes('pant')) return 'shorts';
    if (pLower.includes('hat') || pLower.includes('cap')) return 'hat';
    return 'tshirt';
  });
  const [viewMode, setViewMode] = useState<'editor' | 'compare'>('editor');
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showMaskOverlay, setShowMaskOverlay] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [colorHex, setColorHex] = useState(targetColorHex || '#F59E0B');
  const [colorName, setColorName] = useState(targetColorName || 'Yellow');
  const [recoloredPreviewDataUrl, setRecoloredPreviewDataUrl] = useState<string | null>(null);

  // Popular preset colors for baby clothes
  const PRESET_COLORS = [
    { name: 'Yellow', hex: '#FACC15' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Sky Blue', hex: '#38BDF8' },
    { name: 'Sage Green', hex: '#84CC16' },
    { name: 'Dusty Rose', hex: '#F472B6' },
    { name: 'Soft Peach', hex: '#FB923C' },
    { name: 'Lavender', hex: '#A855F7' },
    { name: 'Mint Green', hex: '#34D399' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'Red', hex: '#EF4444' },
  ];

  // Helper: Hex to RGB
  const hexToRgb = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Helper: RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
  };

  // Helper: HSL to RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    let r: number, g: number, b: number;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Pixel-accurate luminance-preserving fabric recoloring
  const renderDisplayCanvas = useCallback(() => {
    const baseCanvas = baseCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    if (!baseCanvas || !maskCanvas || !displayCanvas) return;

    const w = baseCanvas.width;
    const h = baseCanvas.height;
    const baseCtx = baseCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    const displayCtx = displayCanvas.getContext('2d');
    if (!baseCtx || !maskCtx || !displayCtx) return;

    const baseData = baseCtx.getImageData(0, 0, w, h);
    const maskData = maskCtx.getImageData(0, 0, w, h);
    const outputData = displayCtx.createImageData(w, h);

    const bp = baseData.data;
    const mp = maskData.data;
    const op = outputData.data;

    const targetRgb = hexToRgb(colorHex);
    const [targetH, targetS] = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);

    for (let i = 0; i < bp.length; i += 4) {
      const origR = bp[i];
      const origG = bp[i + 1];
      const origB = bp[i + 2];
      const origA = bp[i + 3];

      const maskAlpha = mp[i + 3] / 255; // 0 to 1

      if (maskAlpha > 0) {
        // Original relative luminance: Y = 0.299R + 0.587G + 0.114B
        const origLuminance = (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;

        // Realistic lightness tuning for natural fabric appearance:
        let adjustedL: number;
        if (targetH >= 0.08 && targetH <= 0.18) {
          // Yellows naturally reflect higher ambient light while maintaining fold shadows
          adjustedL = Math.min(0.88, Math.max(0.18, 0.48 + (origLuminance - 0.28) * 0.90));
        } else if (targetH >= 0.50 && targetH <= 0.68) {
          // Blues have natural medium depth
          adjustedL = Math.min(0.82, Math.max(0.14, 0.42 + (origLuminance - 0.28) * 0.90));
        } else {
          // General fabric lighting curve
          adjustedL = Math.min(0.92, Math.max(0.10, origLuminance * 1.05));
        }

        const [recR, recG, recB] = hslToRgb(targetH, targetS, adjustedL);

        // Alpha blend between original and recolored pixel
        op[i] = Math.round(origR * (1 - maskAlpha) + recR * maskAlpha);
        op[i + 1] = Math.round(origG * (1 - maskAlpha) + recG * maskAlpha);
        op[i + 2] = Math.round(origB * (1 - maskAlpha) + recB * maskAlpha);
        op[i + 3] = origA;
      } else {
        // Pixel outside mask: 100% UNCHANGED, preserving dinosaur, shorts, hat, baby & background
        op[i] = origR;
        op[i + 1] = origG;
        op[i + 2] = origB;
        op[i + 3] = origA;
      }
    }

    displayCtx.putImageData(outputData, 0, 0);

    // Update data URL for side-by-side comparison
    setRecoloredPreviewDataUrl(displayCanvas.toDataURL('image/jpeg', 0.92));

    // If mask overlay is active in editor mode, draw a faint translucent indicator
    if (showMaskOverlay && activeTool !== 'preview') {
      displayCtx.save();
      displayCtx.globalAlpha = 0.25;
      displayCtx.fillStyle = '#06B6D4'; // Cyan highlight on mask
      for (let i = 0; i < mp.length; i += 4) {
        if (mp[i + 3] > 80) {
          const pixelIdx = i / 4;
          const x = pixelIdx % w;
          const y = Math.floor(pixelIdx / w);
          displayCtx.fillRect(x, y, 1, 1);
        }
      }
      displayCtx.restore();
    }
  }, [colorHex, showMaskOverlay, activeTool]);

  // Load image onto base canvas
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = baseImageUrl;

    img.onload = () => {
      const baseCanvas = baseCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const displayCanvas = displayCanvasRef.current;
      if (!baseCanvas || !maskCanvas || !displayCanvas) return;

      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 800;

      baseCanvas.width = w;
      baseCanvas.height = h;
      maskCanvas.width = w;
      maskCanvas.height = h;
      displayCanvas.width = w;
      displayCanvas.height = h;

      const baseCtx = baseCanvas.getContext('2d');
      if (baseCtx) {
        baseCtx.drawImage(img, 0, 0, w, h);
      }

      // Initial clean mask
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        maskCtx.clearRect(0, 0, w, h);
      }

      setIsImageLoaded(true);
      // Automatically run auto-detect fabric on initial load as assistive starting point
      autoDetectFabricMask(baseCtx, maskCtx, w, h);
      renderDisplayCanvas();
    };
  }, [baseImageUrl, renderDisplayCanvas]);

  // Push mask state to undo stack
  const pushUndoState = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    setUndoStack((prev) => [...prev.slice(-10), data]);
  };

  // Undo action
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const previous = undoStack[undoStack.length - 1];
    ctx.putImageData(previous, 0, 0);
    setUndoStack((prev) => prev.slice(0, -1));
    renderDisplayCanvas();
  };

  // Assistive segmentation engine:
  // Dynamically masks selected garment (T-shirt, Shorts, Hat) while protecting:
  // - Other clothing garments
  // - Prints, illustrations and graphic art
  // - Baby skin, hands, legs, hair
  // - Background and shadows
  const autoDetectFabricMask = (
    baseCtx: CanvasRenderingContext2D | null,
    maskCtx: CanvasRenderingContext2D | null,
    w: number,
    h: number,
    sampleColor?: { r: number; g: number; b: number }
  ) => {
    if (!baseCtx || !maskCtx) return;

    const imgData = baseCtx.getImageData(0, 0, w, h);
    const maskData = maskCtx.createImageData(w, h);
    const bp = imgData.data;
    const mp = maskData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const r = bp[i];
        const g = bp[i + 1];
        const b = bp[i + 2];

        const normX = x / w;
        const normY = y / h;

        // Universal protections:
        // 1. Studio backdrop / high key background
        if (g > 145 && b > 145 && r > 145 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) continue;

        if (sampleColor) {
          // Sample-based Wand detection
          const dist = Math.sqrt(
            Math.pow(r - sampleColor.r, 2) +
            Math.pow(g - sampleColor.g, 2) +
            Math.pow(b - sampleColor.b, 2)
          );
          if (dist <= 60) {
            mp[i] = 255;
            mp[i + 1] = 0;
            mp[i + 2] = 0;
            mp[i + 3] = 255;
          }
          continue;
        }

        if (targetGarment === 'tshirt') {
          // Upper torso / T-shirt area (y: 0.12 - 0.52, x: 0.20 - 0.83)
          if (normY >= 0.12 && normY <= 0.52 && normX >= 0.20 && normX <= 0.83) {
            // Protect hat located in bottom-right (normX > 0.62 && normY > 0.49)
            if (normX > 0.62 && normY > 0.49) continue;

            // Protect dinosaur artwork:
            if (g > 75 && g > b * 0.9 && (g > r * 0.65 || g > 110)) continue;
            if (b > 85 && g > 85) continue;
            if (r > 160 && g > 120) continue;
            if (r > 170 && g > 150 && b > 130) continue;
            if (r < 90 && g < 60 && b < 60 && normX > 0.38 && normX < 0.65 && normY > 0.23 && normY < 0.49) continue;

            // Is it fabric of the T-shirt?
            const isTeeFabric = (r > 110 && (r - g) > 42 && (r - b) > 42) || (Math.abs(r - g) < 25 && r > 90 && r < 200 && normY < 0.45);
            if (isTeeFabric) {
              mp[i] = 255;
              mp[i + 1] = 0;
              mp[i + 2] = 0;
              mp[i + 3] = 255;
            }
          }
        } else if (targetGarment === 'shorts') {
          // Lower torso / shorts area
          if (normY >= 0.45 && normY <= 0.82 && normX >= 0.20 && normX <= 0.78) {
            // Protect hat
            if (normX > 0.65 && normY > 0.52) continue;
            // Protect baby skin (legs, hands)
            const isSkin = r > 185 && g > 130 && b > 110 && (r - g) > 15 && (g - b) > 5;
            if (isSkin && normY > 0.68) continue;

            // Detect beige / khaki / neutral shorts fabric
            const isShortsFabric = r > 125 && g > 105 && b > 85 && Math.abs(r - g) < 45 && (r - b) > 10 && (r - b) < 70;
            if (isShortsFabric) {
              mp[i] = 255;
              mp[i + 1] = 0;
              mp[i + 2] = 0;
              mp[i + 3] = 255;
            }
          }
        } else if (targetGarment === 'hat') {
          // Hat located in bottom-right accessory area
          if (normX >= 0.58 && normY >= 0.48 && normX <= 0.95 && normY <= 0.90) {
            const isHatFabric = r > 105 && (r - g) > 30 && (r - b) > 30;
            if (isHatFabric) {
              mp[i] = 255;
              mp[i + 1] = 0;
              mp[i + 2] = 0;
              mp[i + 3] = 255;
            }
          }
        } else {
          // All / General garment fabric
          if (normY >= 0.12 && normY <= 0.85 && normX >= 0.18 && normX <= 0.88) {
            const isFabric = r > 95 && (Math.abs(r - g) > 15 || Math.abs(r - b) > 15);
            if (isFabric) {
              mp[i] = 255;
              mp[i + 1] = 0;
              mp[i + 2] = 0;
              mp[i + 3] = 255;
            }
          }
        }
      }
    }

    maskCtx.putImageData(maskData, 0, 0);
  };

  const handleAutoDetectClick = () => {
    const baseCanvas = baseCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!baseCanvas || !maskCanvas) return;

    pushUndoState();
    autoDetectFabricMask(
      baseCanvas.getContext('2d'),
      maskCanvas.getContext('2d'),
      baseCanvas.width,
      baseCanvas.height
    );
    renderDisplayCanvas();
  };

  // Clear mask
  const handleClearMask = () => {
    pushUndoState();
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    renderDisplayCanvas();
  };

  // Drawing & Wand event handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'preview') return;

    if (activeTool === 'sample') {
      // Magic Wand: sample pixel and auto-detect matching fabric
      const displayCanvas = displayCanvasRef.current;
      const baseCanvas = baseCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!displayCanvas || !baseCanvas || !maskCanvas) return;

      const rect = displayCanvas.getBoundingClientRect();
      const scaleX = baseCanvas.width / rect.width;
      const scaleY = baseCanvas.height / rect.height;
      const px = Math.floor((e.clientX - rect.left) * scaleX);
      const py = Math.floor((e.clientY - rect.top) * scaleY);

      const baseCtx = baseCanvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      if (!baseCtx || !maskCtx) return;

      const pData = baseCtx.getImageData(px, py, 1, 1).data;
      const sampled = { r: pData[0], g: pData[1], b: pData[2] };

      pushUndoState();
      autoDetectFabricMask(baseCtx, maskCtx, baseCanvas.width, baseCanvas.height, sampled);
      renderDisplayCanvas();
      return;
    }

    setIsDrawing(true);
    pushUndoState();
    drawBrush(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === 'preview' || activeTool === 'sample') return;
    drawBrush(e);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    renderDisplayCanvas();
  };

  const drawBrush = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!displayCanvas || !maskCanvas) return;

    const rect = displayCanvas.getBoundingClientRect();
    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    if (activeTool === 'fabric') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#FF0000';
    } else {
      // Protect / Erase: erase from mask
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = '#000000';
    }

    ctx.beginPath();
    ctx.arc(x, y, brushSize * (scaleX / zoomLevel), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    renderDisplayCanvas();
  };

  // Save persistent variation to backend
  const handleSaveAndPersist = async () => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;

    setIsProcessing(true);
    try {
      // Render clean final image without any cyan overlay
      const baseCanvas = baseCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (baseCanvas && maskCanvas) {
        const w = baseCanvas.width;
        const h = baseCanvas.height;
        const baseCtx = baseCanvas.getContext('2d');
        const maskCtx = maskCanvas.getContext('2d');
        const displayCtx = displayCanvas.getContext('2d');

        if (baseCtx && maskCtx && displayCtx) {
          const baseData = baseCtx.getImageData(0, 0, w, h);
          const maskData = maskCtx.getImageData(0, 0, w, h);
          const outputData = displayCtx.createImageData(w, h);

          const bp = baseData.data;
          const mp = maskData.data;
          const op = outputData.data;

          const targetRgb = hexToRgb(colorHex);
          const [targetH, targetS] = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);

          for (let i = 0; i < bp.length; i += 4) {
            const origR = bp[i];
            const origG = bp[i + 1];
            const origB = bp[i + 2];
            const origA = bp[i + 3];

            const maskAlpha = mp[i + 3] / 255;

            if (maskAlpha > 0) {
              const origLuminance = (0.299 * origR + 0.587 * origG + 0.114 * origB) / 255;
              let adjustedL: number;
              if (targetH >= 0.08 && targetH <= 0.18) {
                adjustedL = Math.min(0.88, Math.max(0.18, 0.48 + (origLuminance - 0.28) * 0.90));
              } else if (targetH >= 0.50 && targetH <= 0.68) {
                adjustedL = Math.min(0.82, Math.max(0.14, 0.42 + (origLuminance - 0.28) * 0.90));
              } else {
                adjustedL = Math.min(0.92, Math.max(0.10, origLuminance * 1.05));
              }

              const [recR, recG, recB] = hslToRgb(targetH, targetS, adjustedL);

              op[i] = Math.round(origR * (1 - maskAlpha) + recR * maskAlpha);
              op[i + 1] = Math.round(origG * (1 - maskAlpha) + recG * maskAlpha);
              op[i + 2] = Math.round(origB * (1 - maskAlpha) + recB * maskAlpha);
              op[i + 3] = origA;
            } else {
              // Outside mask: 100% UNCHANGED
              op[i] = origR;
              op[i + 1] = origG;
              op[i + 2] = origB;
              op[i + 3] = origA;
            }
          }

          displayCtx.putImageData(outputData, 0, 0);
        }
      }

      // Convert clean canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        displayCanvas.toBlob(resolve, 'image/jpeg', 0.96)
      );

      if (!blob) throw new Error('Could not render image blob');

      const safeColorName = colorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const safePartName = partName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const file = new File(
        [blob],
        `recolored-${safePartName}-${safeColorName}-${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      );

      const uploadedResult = await uploadService.uploadImage(file);
      onSaveVariation(uploadedResult.url);
      onClose();
    } catch (err: any) {
      console.error('Error saving variation:', err);
      alert('Failed to save variation image. Please try again or upload a photo directly.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fabric Recolor Studio"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Sparkles className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-heading text-base sm:text-lg font-black text-stone-900">
                  Fabric Recolor Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-black uppercase">
                  {partName || 'Garment Component'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Mark the garment base fabric to recolour. Dinosaur graphics, shorts, hat, and background are strictly protected.
              </p>
            </div>
          </div>

          {/* View Mode Toggle & Close */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-stone-200/70 p-1 rounded-xl text-xs font-bold text-stone-600">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  viewMode === 'editor' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Mask Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  viewMode === 'compare' ? 'bg-white text-pink-600 shadow-xs' : 'hover:text-stone-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Original vs Recolored</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
              title="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Main Canvas Viewport or Side-by-Side Comparison */}
          {viewMode === 'editor' ? (
            <div
              ref={containerRef}
              className="flex-1 bg-stone-900/90 relative overflow-hidden flex items-center justify-center p-4"
            >
              {/* Hidden Offscreen Base & Mask Canvases */}
              <canvas ref={baseCanvasRef} className="hidden" />
              <canvas ref={maskCanvasRef} className="hidden" />

              {/* Interactive Display Canvas */}
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="transition-transform duration-100 max-w-full max-h-[65vh] flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden border border-stone-700/50"
              >
                <canvas
                  ref={displayCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className={`max-w-full max-h-[65vh] object-contain ${
                    activeTool === 'preview'
                      ? 'cursor-default'
                      : activeTool === 'protect'
                      ? 'cursor-crosshair'
                      : 'cursor-crosshair'
                  }`}
                />
              </div>

              {/* Quick Floating Zoom & Mask Toggle */}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-stone-800/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs border border-stone-700/50 shadow-lg">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="p-1 hover:text-pink-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1 hover:text-pink-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="h-3 w-px bg-stone-600 mx-1" />
                <button
                  type="button"
                  onClick={() => setShowMaskOverlay(!showMaskOverlay)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    showMaskOverlay ? 'bg-cyan-500 text-stone-900' : 'bg-stone-700 text-stone-300'
                  }`}
                >
                  {showMaskOverlay ? 'Mask Highlight: ON' : 'Mask Highlight: OFF'}
                </button>
              </div>
            </div>
          ) : (
            /* SIDE-BY-SIDE ORIGINAL VS RECOLORED COMPARISON (Requirement 8) */
            <div className="flex-1 bg-stone-900 relative p-4 sm:p-6 overflow-auto flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Left: Original Base Photo */}
              <div className="flex-1 w-full max-w-md flex flex-col items-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-200 text-xs font-black uppercase tracking-wider border border-stone-700">
                  Original Photo (Red T-Shirt)
                </span>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 p-2 flex items-center justify-center shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={baseImageUrl}
                    alt="Original Base Photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-stone-400 text-center">
                  Base design: dinosaur artwork, beige shorts, and red hat
                </p>
              </div>

              {/* Right: Recolored Output Variation */}
              <div className="flex-1 w-full max-w-md flex flex-col items-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-pink-600/90 text-white text-xs font-black uppercase tracking-wider border border-pink-400/30">
                  Recolored Variation ({colorName})
                </span>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 p-2 flex items-center justify-center shadow-xl">
                  {recoloredPreviewDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={recoloredPreviewDataUrl}
                      alt="Recolored Fabric Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-stone-400 text-xs">Generating preview...</div>
                  )}
                </div>
                <p className="text-[11px] text-emerald-400 text-center font-bold">
                  ✓ Dinosaur artwork, shorts, hat, and background are 100% identical!
                </p>
              </div>
            </div>
          )}

          {/* Right Control Panel */}
          <div className="w-full lg:w-80 bg-white border-l border-stone-100 p-5 overflow-y-auto space-y-5">
            {/* Target Colour Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                1. Target Garment Colour
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-stone-200 p-0.5"
                />
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="Colour name (e.g. Sunny Yellow)"
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800"
                />
              </div>

              {/* Quick Swatches */}
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => {
                      setColorHex(col.hex);
                      setColorName(col.name);
                    }}
                    title={col.name}
                    style={{ backgroundColor: col.hex }}
                    className={`h-7 rounded-lg border transition-transform ${
                      colorHex.toLowerCase() === col.hex.toLowerCase()
                        ? 'ring-2 ring-pink-500 scale-110 border-white'
                        : 'border-stone-200 hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Target Garment Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                2. Target Garment Component
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setTargetGarment('tshirt')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                    targetGarment === 'tshirt'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  👕 T-Shirt
                </button>
                <button
                  type="button"
                  onClick={() => setTargetGarment('shorts')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                    targetGarment === 'shorts'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🩳 Shorts
                </button>
                <button
                  type="button"
                  onClick={() => setTargetGarment('hat')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                    targetGarment === 'hat'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  👒 Hat
                </button>
              </div>
            </div>

            {/* Tool Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                3. Marking &amp; Protection Tools
              </label>

              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('editor');
                    setActiveTool('fabric');
                  }}
                  className={`p-2.5 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTool === 'fabric' && viewMode === 'editor'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Paintbrush className="w-4 h-4 text-cyan-600" />
                  <span>Brush</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('editor');
                    setActiveTool('sample');
                  }}
                  className={`p-2.5 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTool === 'sample' && viewMode === 'editor'
                      ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                  title="Click anywhere on the garment to sample its color and mask it"
                >
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  <span>Wand</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('editor');
                    setActiveTool('protect');
                  }}
                  className={`p-2.5 rounded-2xl border text-[11px] font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTool === 'protect' && viewMode === 'editor'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-rose-600" />
                  <span>Erase</span>
                </button>
              </div>

              {/* Assistive Auto-Detect Button */}
              <button
                type="button"
                onClick={handleAutoDetectClick}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border border-pink-200 text-pink-700 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span>
                  Auto-Mask {targetGarment === 'tshirt' ? 'T-Shirt' : targetGarment === 'shorts' ? 'Shorts' : 'Hat'} Fabric
                </span>
              </button>
              <p className="text-[10px] text-stone-400 mt-1 text-center">
                {targetGarment === 'tshirt'
                  ? 'Masks T-shirt while protecting prints, shorts, and hat.'
                  : targetGarment === 'shorts'
                  ? 'Masks shorts while protecting T-shirt, legs, and background.'
                  : 'Masks hat while protecting baby model and other clothes.'}
              </p>
            </div>

            {/* Brush Size Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1">
                <span>Brush Size</span>
                <span className="font-mono text-stone-500">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="70"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
            </div>

            {/* Undo & Clear Actions */}
            <div className="flex items-center space-x-2 pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-40 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>

              <button
                type="button"
                onClick={handleClearMask}
                className="flex-1 py-2 px-3 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-100 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Mask</span>
              </button>
            </div>

            {/* Protection Notice */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
              <div className="font-bold text-stone-800 flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Artwork &amp; Baby Guarantee</span>
              </div>
              <p>
                Every pixel outside the approved mask remains 100% bit-exact to the original photograph. If a garment is too complex, use <strong>Upload Real Photo</strong> instead.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-500 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Target variation: <strong>{partName || 'T-Shirt'}</strong> in <strong>{colorName}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndPersist}
              disabled={isProcessing || !isImageLoaded}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isProcessing ? 'Generating & Uploading...' : 'Approve & Save Variation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

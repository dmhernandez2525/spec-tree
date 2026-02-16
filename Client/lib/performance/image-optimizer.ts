/**
 * Image optimization utilities.
 * Provides client-side image resizing, format conversion,
 * and size estimation for reducing upload payload sizes.
 */

export type ImageFormat = 'webp' | 'jpeg' | 'png' | 'avif';

export interface OptimizationOptions {
  maxWidth: number;
  maxHeight: number;
  /** Quality factor between 0 and 1 */
  quality: number;
  format: ImageFormat;
}

export const DEFAULT_OPTIONS: OptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'webp',
};

/** Default file size threshold in bytes (100 KB) */
const DEFAULT_THRESHOLD = 100 * 1024;

/** Maps each format to its corresponding canvas MIME type */
const FORMAT_MIME: Record<ImageFormat, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};

/**
 * Typical compression ratios relative to the original file size.
 * These are rough estimates used for quick size predictions.
 */
const COMPRESSION_RATIOS: Record<ImageFormat, number> = {
  webp: 0.35,
  jpeg: 0.45,
  png: 0.8,
  avif: 0.3,
};

/**
 * Loads a File as an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Calculates scaled dimensions that fit within the max bounds
 * while preserving the original aspect ratio.
 */
function scaleDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/**
 * Optimizes an image file by scaling it down and converting to
 * the specified format. Returns a Blob containing the result.
 */
export async function optimizeImage(
  file: File,
  options?: Partial<OptimizationOptions>
): Promise<Blob> {
  const config: OptimizationOptions = { ...DEFAULT_OPTIONS, ...options };
  const img = await loadImage(file);

  const { width, height } = scaleDimensions(
    img.naturalWidth,
    img.naturalHeight,
    config.maxWidth,
    config.maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas 2D context');
  }

  ctx.drawImage(img, 0, 0, width, height);

  const mime = FORMAT_MIME[config.format];

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob returned null'));
        }
      },
      mime,
      config.quality
    );
  });
}

/**
 * Returns the natural width and height of an image file.
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Estimates the compressed file size based on typical compression
 * ratios for the given format.
 */
export function estimateCompressedSize(
  originalSize: number,
  format: ImageFormat
): number {
  const ratio = COMPRESSION_RATIOS[format] ?? 0.5;
  return Math.round(originalSize * ratio);
}

/**
 * Returns true if the file exceeds the given size threshold
 * and would benefit from optimization.
 */
export function shouldOptimize(
  file: File,
  threshold = DEFAULT_THRESHOLD
): boolean {
  return file.size > threshold;
}

export type CompressionStage =
  | "queued"
  | "decoding"
  | "resizing"
  | "encoding"
  | "optimizing"
  | "complete";

export interface CompressionProgress {
  stage: CompressionStage;
  percent: number;
  message: string;
  originalBytes: number;
  currentBytes?: number;
  savedPercent?: number;
}

export interface ImageCompressionOptions {
  maxBytes?: number;
  maxDimension?: number;
  mimeType?: "image/webp" | "image/jpeg";
  initialQuality?: number;
  minQuality?: number;
  maxIterations?: number;
}

export interface CompressedImageResult {
  blob: Blob;
  file: File;
  objectUrl: string;
  originalBytes: number;
  compressedBytes: number;
  savedBytes: number;
  savedPercent: number;
  width: number;
  height: number;
  mimeType: string;
  quality: number;
}

type DrawableImage = HTMLImageElement | ImageBitmap;
type ProgressHandler = (progress: CompressionProgress) => void;

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 2400;
const DEFAULT_INITIAL_QUALITY = 0.86;
const DEFAULT_MIN_QUALITY = 0.48;
const DEFAULT_MAX_ITERATIONS = 14;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {},
  onProgress?: ProgressHandler,
): Promise<CompressedImageResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be compressed.");
  }

  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const mimeType = options.mimeType ?? "image/webp";
  const initialQuality = options.initialQuality ?? DEFAULT_INITIAL_QUALITY;
  const minQuality = options.minQuality ?? DEFAULT_MIN_QUALITY;
  const maxIterations = options.maxIterations ?? DEFAULT_MAX_ITERATIONS;

  report(onProgress, {
    stage: "queued",
    percent: 4,
    message: "Preparing image",
    originalBytes: file.size,
  });

  const decoded = await decodeImage(file);

  try {
    report(onProgress, {
      stage: "decoding",
      percent: 18,
      message: "Reading pixels",
      originalBytes: file.size,
    });

    const baseSize = fitWithinBounds(decoded.image.width, decoded.image.height, maxDimension);
    let scale = 1;
    let quality = initialQuality;
    let best: EncodedCandidate | undefined;

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      const dimensions = {
        width: Math.max(1, Math.round(baseSize.width * scale)),
        height: Math.max(1, Math.round(baseSize.height * scale)),
      };

      report(onProgress, {
        stage: iteration === 0 ? "resizing" : "optimizing",
        percent: Math.min(88, 24 + iteration * 5),
        message: iteration === 0 ? "Resizing canvas" : "Tuning output",
        originalBytes: file.size,
        currentBytes: best?.blob.size,
        savedPercent: best ? calculateSavedPercent(file.size, best.blob.size) : undefined,
      });

      const canvas = renderToCanvas(decoded.image, dimensions.width, dimensions.height);
      const blob = await canvasToBlob(canvas, mimeType, quality);
      const candidate = {
        blob,
        width: dimensions.width,
        height: dimensions.height,
        quality,
      };

      if (!best || candidate.blob.size < best.blob.size) {
        best = candidate;
      }

      report(onProgress, {
        stage: "encoding",
        percent: Math.min(94, 30 + iteration * 5),
        message: `Encoded ${formatBytes(blob.size)}`,
        originalBytes: file.size,
        currentBytes: blob.size,
        savedPercent: calculateSavedPercent(file.size, blob.size),
      });

      if (blob.size <= maxBytes) {
        best = candidate;
        break;
      }

      if (quality > minQuality) {
        quality = Math.max(minQuality, quality - 0.08);
      } else {
        scale *= 0.88;
      }
    }

    if (!best) {
      throw new Error("Image compression did not produce an output.");
    }

    const compressedBytes = best.blob.size;
    const savedBytes = Math.max(0, file.size - compressedBytes);
    const savedPercent = calculateSavedPercent(file.size, compressedBytes);
    const outputFile = new File([best.blob], toCompressedFileName(file.name, best.blob.type), {
      type: best.blob.type,
      lastModified: Date.now(),
    });

    report(onProgress, {
      stage: "complete",
      percent: 100,
      message: `Saved ${formatBytes(savedBytes)}`,
      originalBytes: file.size,
      currentBytes: compressedBytes,
      savedPercent,
    });

    return {
      blob: best.blob,
      file: outputFile,
      objectUrl: URL.createObjectURL(best.blob),
      originalBytes: file.size,
      compressedBytes,
      savedBytes,
      savedPercent,
      width: best.width,
      height: best.height,
      mimeType: best.blob.type || mimeType,
      quality: best.quality,
    };
  } finally {
    decoded.dispose();
  }
}

interface EncodedCandidate {
  blob: Blob;
  width: number;
  height: number;
  quality: number;
}

interface DecodedImage {
  image: DrawableImage;
  dispose: () => void;
}

function report(
  handler: ProgressHandler | undefined,
  progress: CompressionProgress,
): void {
  handler?.(progress);
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);

      return {
        image: bitmap,
        dispose: () => bitmap.close(),
      };
    } catch {
      // Fall through to the HTMLImageElement decoder for broader browser coverage.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;
  await image.decode();

  return {
    image,
    dispose: () => URL.revokeObjectURL(objectUrl),
  };
}

function fitWithinBounds(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const ratio = Math.min(1, maxDimension / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function renderToCanvas(
  image: DrawableImage,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", {
    alpha: false,
    colorSpace: "srgb",
  });

  if (!context) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  return canvas;
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        if (!blob) {
          reject(new Error("Canvas failed to encode the image."));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function calculateSavedPercent(originalBytes: number, compressedBytes: number): number {
  if (originalBytes <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100));
}

function toCompressedFileName(originalName: string, mimeType: string): string {
  const extension = mimeType.includes("jpeg") ? "jpg" : "webp";
  const nameWithoutExtension = originalName.replace(/\.[^.]+$/, "");

  return `${nameWithoutExtension || "neuflorest-image"}.${extension}`;
}

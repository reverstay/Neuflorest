import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactElement,
} from "react";
import {
  compressImage,
  formatBytes,
  type CompressedImageResult,
  type CompressionProgress,
} from "../../utils/imageCompression";

interface ImageDropzoneProps {
  label: string;
  currentUrl: string;
  variant: "cover" | "avatar";
  onImageReady: (result: CompressedImageResult) => void;
}

export function ImageDropzone({
  label,
  currentUrl,
  variant,
  onImageReady,
}: ImageDropzoneProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [error, setError] = useState<string>("");

  async function handleFiles(files: FileList | null): Promise<void> {
    const file = files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      const result = await compressImage(file, {}, setProgress);
      onImageReady(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Image compression failed.");
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    void handleFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(event.dataTransfer.files);
  }

  function openPicker(): void {
    inputRef.current?.click();
  }

  const savedLabel =
    progress?.stage === "complete" && progress.currentBytes
      ? `${progress.savedPercent ?? 0}% saved, ${formatBytes(progress.currentBytes)} final`
      : progress?.message;

  return (
    <div
      className={`image-dropzone image-dropzone--${variant} ${isDragging ? "is-dragging" : ""}`}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDrop={handleDrop}
    >
      <img src={currentUrl} alt="" className="image-dropzone__image" />
      <div className="image-dropzone__veil" />
      <button className="image-dropzone__button" onClick={openPicker} type="button">
        {label}
      </button>
      <input
        ref={inputRef}
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
        type="file"
      />
      {progress && progress.stage !== "queued" ? (
        <div className="compression-meter" aria-live="polite">
          <span>{savedLabel}</span>
          <div className="compression-meter__track">
            <span style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}

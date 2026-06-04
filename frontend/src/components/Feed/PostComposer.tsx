import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import type { CreatePostInput } from "../../types/social";
import {
  compressImage,
  formatBytes,
  type CompressedImageResult,
  type CompressionProgress,
} from "../../utils/imageCompression";

interface PostComposerProps {
  onCreatePost: (input: CreatePostInput) => void;
}

export function PostComposer({ onCreatePost }: PostComposerProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [body, setBody] = useState<string>("");
  const [image, setImage] = useState<CompressedImageResult | null>(null);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function handleFiles(files: FileList | null): Promise<void> {
    const file = files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      const result = await compressImage(file, {}, setProgress);
      setImage((current) => {
        if (current) {
          URL.revokeObjectURL(current.objectUrl);
        }

        return result;
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Image compression failed.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!body.trim() && !image) {
      return;
    }

    onCreatePost({
      body: body.trim(),
      imageUrl: image?.objectUrl,
      compressionSavedPercent: image?.savedPercent,
    });

    setBody("");
    setImage(null);
    setProgress(null);
    setError("");
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    void handleFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLFormElement>): void {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(event.dataTransfer.files);
  }

  return (
    <form
      className={`post-composer ${isDragging ? "is-dragging" : ""}`}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDrop={handleDrop}
      onSubmit={handleSubmit}
    >
      <textarea
        aria-label="Post text"
        onChange={(event) => setBody(event.currentTarget.value)}
        placeholder="Share a greenhouse note..."
        value={body}
      />
      {image ? (
        <figure className="composer-preview">
          <img src={image.objectUrl} alt="" />
          <figcaption>
            {image.savedPercent}% saved from {formatBytes(image.originalBytes)}
          </figcaption>
        </figure>
      ) : null}
      {progress ? (
        <div className="compression-meter" aria-live="polite">
          <span>{progress.message}</span>
          <div className="compression-meter__track">
            <span style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
      <div className="composer-actions">
        <button className="btn-subtle" onClick={() => inputRef.current?.click()} type="button">
          Add image
        </button>
        <button className="btn-primary" type="submit">
          Publish
        </button>
      </div>
      <input
        ref={inputRef}
        accept="image/*"
        className="sr-only"
        onChange={handleInputChange}
        type="file"
      />
    </form>
  );
}

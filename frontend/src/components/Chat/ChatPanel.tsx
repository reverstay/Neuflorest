import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from "react";
import { useSocialRealtime } from "../../context/SocialRealtimeContext";
import type { ChatAttachment, ConnectionStatus } from "../../types/social";
import {
  compressImage,
  type CompressedImageResult,
  type CompressionProgress,
} from "../../utils/imageCompression";

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: "Connecting",
  connected: "Live",
  reconnecting: "Reconnecting",
  offline: "Offline",
};

export function ChatPanel(): ReactElement {
  const {
    status,
    messages,
    isTyping,
    sendMessage,
    markMessagesRead,
    unreadMessageCount,
  } = useSocialRealtime();
  const [draft, setDraft] = useState<string>("");
  const [attachment, setAttachment] = useState<CompressedImageResult | null>(null);
  const [progress, setProgress] = useState<CompressionProgress | null>(null);
  const [error, setError] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleImage(files: FileList | null): Promise<void> {
    const file = files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      const result = await compressImage(file, { maxDimension: 1600 }, setProgress);
      setAttachment((current) => {
        if (current) {
          URL.revokeObjectURL(current.objectUrl);
        }

        return result;
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Image compression failed.");
    }
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>): void {
    void handleImage(event.currentTarget.files);
    event.currentTarget.value = "";
  }

  function submitMessage(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const chatAttachment: ChatAttachment | undefined = attachment
      ? {
          url: attachment.objectUrl,
          mimeType: attachment.mimeType,
          originalName: attachment.file.name,
        }
      : undefined;

    sendMessage({
      text: draft,
      attachment: chatAttachment,
    });
    setDraft("");
    setAttachment(null);
    setProgress(null);
    setError("");
  }

  return (
    <aside className="chat-panel" aria-label="Realtime chat" onFocus={markMessagesRead}>
      <header className="chat-panel__header">
        <div>
          <div className="section-kicker">WebSocket room</div>
          <h2>Care Chat</h2>
        </div>
        <span className={`connection-pill connection-pill--${status}`}>
          {statusLabels[status]}
        </span>
      </header>
      {unreadMessageCount > 0 ? (
        <button className="unread-chip" onClick={markMessagesRead} type="button">
          {unreadMessageCount} unread
        </button>
      ) : null}
      <div className="message-list">
        {messages.map((message) => (
          <article className={`message message--${message.direction}`} key={message.id}>
            <img src={message.participant.avatarUrl} alt="" />
            <div className="message__bubble">
              {message.text ? <p>{message.text}</p> : null}
              {message.attachment ? (
                <img className="message__attachment" src={message.attachment.url} alt="" />
              ) : null}
              <span>{message.delivery}</span>
            </div>
          </article>
        ))}
        {isTyping ? (
          <div className="typing-indicator" aria-live="polite">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        <div ref={messagesEndRef} />
      </div>
      {attachment ? (
        <figure className="chat-attachment-preview">
          <img src={attachment.objectUrl} alt="" />
          <figcaption>{attachment.savedPercent}% saved</figcaption>
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
      <form className="chat-form" onSubmit={submitMessage}>
        <button className="btn-icon" onClick={() => inputRef.current?.click()} type="button">
          +
        </button>
        <input
          aria-label="Message"
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder="Write a care note..."
          type="text"
          value={draft}
        />
        <button className="btn-primary" type="submit">
          Send
        </button>
      </form>
      <input
        ref={inputRef}
        accept="image/*"
        className="sr-only"
        onChange={handleAttachmentChange}
        type="file"
      />
    </aside>
  );
}

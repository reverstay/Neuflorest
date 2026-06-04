import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChatMessage,
  ChatParticipant,
  ConnectionStatus,
  OutgoingMessageInput,
} from "../types/social";

interface UseSimulatedWebSocketOptions {
  onMessageReceived?: (message: ChatMessage) => void;
}

interface UseSimulatedWebSocketResult {
  status: ConnectionStatus;
  messages: ChatMessage[];
  isTyping: boolean;
  unreadMessageCount: number;
  sendMessage: (input: OutgoingMessageInput) => void;
  markMessagesRead: () => void;
}

const currentUser: ChatParticipant = {
  id: "greenhouse-operator",
  name: "Ramon",
  role: "member",
  avatarUrl:
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&q=80",
};

const concierge: ChatParticipant = {
  id: "plant-concierge",
  name: "Lina",
  role: "bot",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
};

const scriptedReplies = [
  "Moisture drift looks stable. I would keep irrigation on the softer cadence today.",
  "New media synced. The compression pass kept the gallery light without flattening the detail.",
  "Follower activity is warming up around the Monstera care notes.",
  "I am seeing a calm telemetry window. No urgent plant-care action needed.",
];

const initialMessages: ChatMessage[] = [
  {
    id: "message-seed-1",
    participant: concierge,
    text: "Morning check is clean. Your greenhouse feed is ready for publishing.",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    direction: "incoming",
    delivery: "read",
    read: true,
  },
  {
    id: "message-seed-2",
    participant: currentUser,
    text: "Queue the profile media and keep the compression budget below five megabytes.",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    direction: "outgoing",
    delivery: "read",
    read: true,
  },
];

export function useSimulatedWebSocket(
  options: UseSimulatedWebSocketOptions = {},
): UseSimulatedWebSocketResult {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const optionsRef = useRef<UseSimulatedWebSocketOptions>(options);
  const replyIndex = useRef<number>(0);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const schedule = useCallback((callback: () => void, delay: number): void => {
    const timer = setTimeout(callback, delay);
    timers.current.push(timer);
  }, []);

  useEffect(() => {
    schedule(() => setStatus("connected"), 650);

    const interval = setInterval(() => {
      setStatus("reconnecting");
      schedule(() => setStatus("connected"), 1200);
    }, 36000);

    return () => {
      clearInterval(interval);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [schedule]);

  const updateDelivery = useCallback((messageId: string, delivery: ChatMessage["delivery"]) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId
          ? {
              ...message,
              delivery,
              read: delivery === "read" ? true : message.read,
            }
          : message,
      ),
    );
  }, []);

  const receiveReply = useCallback(
    (replyTo: OutgoingMessageInput): void => {
      const replyText = scriptedReplies[replyIndex.current % scriptedReplies.length];
      replyIndex.current += 1;

      const incoming: ChatMessage = {
        id: createId("message"),
        participant: concierge,
        text: replyTo.attachment
          ? "Image received. I will keep the preview in the care thread."
          : replyText,
        createdAt: new Date().toISOString(),
        direction: "incoming",
        delivery: "delivered",
        read: false,
      };

      setMessages((current) => [...current, incoming]);
      optionsRef.current.onMessageReceived?.(incoming);
    },
    [],
  );

  const sendMessage = useCallback(
    (input: OutgoingMessageInput): void => {
      const trimmedText = input.text.trim();

      if (!trimmedText && !input.attachment) {
        return;
      }

      const messageId = createId("message");
      const outgoing: ChatMessage = {
        id: messageId,
        participant: currentUser,
        text: trimmedText,
        createdAt: new Date().toISOString(),
        direction: "outgoing",
        delivery: "sending",
        read: false,
        attachment: input.attachment,
      };

      setMessages((current) => [...current, outgoing]);

      if (status !== "connected") {
        setStatus("reconnecting");
      }

      schedule(() => updateDelivery(messageId, "sent"), 320);
      schedule(() => updateDelivery(messageId, "delivered"), 960);
      schedule(() => setIsTyping(true), 1250);
      schedule(() => {
        setIsTyping(false);
        receiveReply(input);
      }, 2850);
      schedule(() => updateDelivery(messageId, "read"), 4200);
    },
    [receiveReply, schedule, status, updateDelivery],
  );

  const markMessagesRead = useCallback((): void => {
    setMessages((current) =>
      current.map((message) =>
        message.direction === "incoming"
          ? {
              ...message,
              delivery: "read",
              read: true,
            }
          : message,
      ),
    );
  }, []);

  const unreadMessageCount = useMemo(
    () => messages.filter((message) => message.direction === "incoming" && !message.read).length,
    [messages],
  );

  return {
    status,
    messages,
    isTyping,
    unreadMessageCount,
    sendMessage,
    markMessagesRead,
  };
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

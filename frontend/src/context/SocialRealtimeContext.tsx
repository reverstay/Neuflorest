import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from "react";
import { useSimulatedWebSocket } from "../hooks/useSimulatedWebSocket";
import type { NotificationChannel, NotificationCounts } from "../types/social";

interface SocialRealtimeContextValue extends ReturnType<typeof useSimulatedWebSocket> {
  notifications: NotificationCounts;
  clearNotifications: (channel?: NotificationChannel) => void;
  registerLike: () => void;
  registerFollower: () => void;
}

const emptyNotifications: NotificationCounts = {
  messages: 0,
  likes: 0,
  followers: 0,
};

const SocialRealtimeContext = createContext<SocialRealtimeContextValue | undefined>(undefined);

export function SocialRealtimeProvider({ children }: PropsWithChildren): ReactElement {
  const [notifications, setNotifications] = useState<NotificationCounts>(emptyNotifications);

  const increment = useCallback((channel: NotificationChannel, amount = 1): void => {
    setNotifications((current) => ({
      ...current,
      [channel]: current[channel] + amount,
    }));
  }, []);

  const socket = useSimulatedWebSocket({
    onMessageReceived: () => increment("messages"),
  });

  const clearNotifications = useCallback((channel?: NotificationChannel): void => {
    setNotifications((current) => {
      if (!channel) {
        return emptyNotifications;
      }

      return {
        ...current,
        [channel]: 0,
      };
    });
  }, []);

  const registerLike = useCallback((): void => {
    increment("likes");
  }, [increment]);

  const registerFollower = useCallback((): void => {
    increment("followers");
  }, [increment]);

  const markMessagesRead = useCallback((): void => {
    socket.markMessagesRead();
    clearNotifications("messages");
  }, [clearNotifications, socket]);

  useEffect(() => {
    const likeTimer = setInterval(() => increment("likes"), 24000);
    const followerTimer = setInterval(() => increment("followers"), 41000);

    return () => {
      clearInterval(likeTimer);
      clearInterval(followerTimer);
    };
  }, [increment]);

  const value = useMemo<SocialRealtimeContextValue>(
    () => ({
      ...socket,
      markMessagesRead,
      notifications,
      clearNotifications,
      registerLike,
      registerFollower,
    }),
    [
      socket,
      markMessagesRead,
      notifications,
      clearNotifications,
      registerLike,
      registerFollower,
    ],
  );

  return (
    <SocialRealtimeContext.Provider value={value}>{children}</SocialRealtimeContext.Provider>
  );
}

export function useSocialRealtime(): SocialRealtimeContextValue {
  const context = useContext(SocialRealtimeContext);

  if (!context) {
    throw new Error("useSocialRealtime must be used within SocialRealtimeProvider.");
  }

  return context;
}

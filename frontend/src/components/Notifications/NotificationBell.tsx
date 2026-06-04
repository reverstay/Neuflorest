import type { ReactElement } from "react";
import { useSocialRealtime } from "../../context/SocialRealtimeContext";
import type { ConnectionStatus, NotificationChannel } from "../../types/social";

const notificationLabels: Record<NotificationChannel, string> = {
  messages: "Messages",
  likes: "Likes",
  followers: "Followers",
};

const statusCopy: Record<ConnectionStatus, string> = {
  connecting: "Syncing",
  connected: "Live",
  reconnecting: "Restoring",
  offline: "Offline",
};

export function NotificationBell(): ReactElement {
  const { notifications, clearNotifications, status } = useSocialRealtime();
  const channels = Object.keys(notificationLabels) as NotificationChannel[];

  return (
    <div className="notification-bell" aria-label="Realtime notifications">
      <span className={`status-dot status-dot--${status}`}>{statusCopy[status]}</span>
      {channels.map((channel) => (
        <button
          className="notification-button"
          key={channel}
          onClick={() => clearNotifications(channel)}
          type="button"
        >
          {notificationLabels[channel]}
          {notifications[channel] > 0 ? (
            <span className="notification-badge">{notifications[channel]}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

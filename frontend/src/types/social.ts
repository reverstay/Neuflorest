export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

export type NotificationChannel = "messages" | "likes" | "followers";

export type NotificationCounts = Record<NotificationChannel, number>;

export type ProfileTab = "posts" | "media" | "likes";

export interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  role: string;
  location: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  stats: ProfileStats;
}

export interface FeedAuthor {
  name: string;
  handle: string;
  avatarUrl: string;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  body: string;
  createdAt: string;
  imageUrl?: string;
  compressionSavedPercent?: number;
  likes: number;
  replies: number;
  liked: boolean;
}

export interface CreatePostInput {
  body: string;
  imageUrl?: string;
  compressionSavedPercent?: number;
}

export interface ChatParticipant {
  id: string;
  name: string;
  role: "member" | "bot";
  avatarUrl: string;
}

export interface ChatAttachment {
  url: string;
  mimeType: string;
  originalName: string;
}

export interface ChatMessage {
  id: string;
  participant: ChatParticipant;
  text: string;
  createdAt: string;
  direction: "incoming" | "outgoing";
  delivery: "sending" | "sent" | "delivered" | "read";
  read: boolean;
  attachment?: ChatAttachment;
}

export interface OutgoingMessageInput {
  text: string;
  attachment?: ChatAttachment;
}

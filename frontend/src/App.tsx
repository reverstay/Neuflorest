import { useMemo, useState, type ReactElement } from "react";
import { ChatPanel } from "./components/Chat/ChatPanel";
import { SocialFeed } from "./components/Feed/SocialFeed";
import { NotificationBell } from "./components/Notifications/NotificationBell";
import { ProfileCard } from "./components/Profile/ProfileCard";
import { SocialRealtimeProvider } from "./context/SocialRealtimeContext";
import type { FeedPost, UserProfile } from "./types/social";

const defaultProfile: UserProfile = {
  id: "ramon-neuflorest",
  name: "Ramon Mariano",
  handle: "@neuflorest",
  role: "Smart Green Ecosystem Curator",
  location: "Sao Paulo, BR",
  bio: "Cultivating autonomous plant care, 3D printed vessels, and a quieter way to keep living systems close.",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
  coverUrl:
    "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=1400&q=80",
  stats: {
    posts: 3,
    followers: 1248,
    following: 184,
  },
};

const seedPosts: FeedPost[] = [
  {
    id: "post-seed-1",
    author: {
      name: "Ramon Mariano",
      handle: "@neuflorest",
      avatarUrl: defaultProfile.avatarUrl,
    },
    body: "Tested the moss-green hex vessel with the live moisture loop. The texture reads softer under morning light.",
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    imageUrl:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=82",
    compressionSavedPercent: 64,
    likes: 42,
    replies: 8,
    liked: false,
  },
  {
    id: "post-seed-2",
    author: {
      name: "Lina Care Lab",
      handle: "@carelab",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    },
    body: "Follower signal rose after the Monstera watering note. Keeping the next update short and image-led.",
    createdAt: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
    likes: 31,
    replies: 5,
    liked: true,
  },
  {
    id: "post-seed-3",
    author: {
      name: "NeuFlorest Studio",
      handle: "@studio",
      avatarUrl:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80",
    },
    body: "A new cover-photo pass should feel editorial, not glossy. Warm sand, deep moss, no sterile dashboard energy.",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    imageUrl:
      "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&w=1200&q=82",
    compressionSavedPercent: 58,
    likes: 68,
    replies: 14,
    liked: false,
  },
];

export default function App(): ReactElement {
  return (
    <SocialRealtimeProvider>
      <NeuFlorestSocialApp />
    </SocialRealtimeProvider>
  );
}

function NeuFlorestSocialApp(): ReactElement {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [posts, setPosts] = useState<FeedPost[]>(seedPosts);

  const profileWithPostCount = useMemo<UserProfile>(
    () => ({
      ...profile,
      stats: {
        ...profile.stats,
        posts: posts.length,
      },
    }),
    [posts.length, profile],
  );

  const currentAuthor = useMemo(
    () => ({
      name: profileWithPostCount.name,
      handle: profileWithPostCount.handle,
      avatarUrl: profileWithPostCount.avatarUrl,
    }),
    [profileWithPostCount],
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-mark" type="button">
          Neu<span>Florest</span>
        </button>
        <NotificationBell />
      </header>
      <section className="workspace-heading">
        <div>
          <p className="section-kicker">Organic luxury social layer</p>
          <h1>Greenhouse Community Console</h1>
        </div>
        <p>
          Sao Paulo greenhouse stream with moss vessels, care notes, and community signals.
        </p>
      </section>
      <div className="social-layout">
        <ProfileCard
          onProfileChange={setProfile}
          posts={posts}
          profile={profileWithPostCount}
        />
        <SocialFeed currentAuthor={currentAuthor} onPostsChange={setPosts} posts={posts} />
        <ChatPanel />
      </div>
    </div>
  );
}

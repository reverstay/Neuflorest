import type { ReactElement } from "react";
import type { FeedPost, ProfileTab } from "../../types/social";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  posts: FeedPost[];
  onTabChange: (tab: ProfileTab) => void;
}

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "posts", label: "Posts" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
];

export function ProfileTabs({
  activeTab,
  posts,
  onTabChange,
}: ProfileTabsProps): ReactElement {
  const mediaPosts = posts.filter((post) => post.imageUrl);
  const likedPosts = posts.filter((post) => post.liked);
  const visiblePosts =
    activeTab === "media" ? mediaPosts : activeTab === "likes" ? likedPosts : posts;

  return (
    <section className="profile-tabs" aria-label="Profile activity">
      <div className="segmented-control">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.id ? "is-active" : ""}
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="profile-tab-list">
        {visiblePosts.length > 0 ? (
          visiblePosts.slice(0, 3).map((post) => (
            <article className="profile-tab-item" key={post.id}>
              <p>{post.body}</p>
              {post.imageUrl ? <img src={post.imageUrl} alt="" /> : null}
            </article>
          ))
        ) : (
          <p className="profile-tab-empty">No activity yet.</p>
        )}
      </div>
    </section>
  );
}

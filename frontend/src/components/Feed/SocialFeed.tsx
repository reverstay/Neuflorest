import { useMemo, type ReactElement } from "react";
import { useSocialRealtime } from "../../context/SocialRealtimeContext";
import type { CreatePostInput, FeedAuthor, FeedPost } from "../../types/social";
import { PostComposer } from "./PostComposer";

interface SocialFeedProps {
  currentAuthor: FeedAuthor;
  posts: FeedPost[];
  onPostsChange: (posts: FeedPost[]) => void;
}

export function SocialFeed({
  currentAuthor,
  posts,
  onPostsChange,
}: SocialFeedProps): ReactElement {
  const { registerLike } = useSocialRealtime();

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [posts],
  );

  function createPost(input: CreatePostInput): void {
    const nextPost: FeedPost = {
      id: createId("post"),
      author: currentAuthor,
      body: input.body,
      createdAt: new Date().toISOString(),
      imageUrl: input.imageUrl,
      compressionSavedPercent: input.compressionSavedPercent,
      likes: 0,
      replies: 0,
      liked: false,
    };

    onPostsChange([nextPost, ...posts]);
  }

  function toggleLike(postId: string): void {
    onPostsChange(
      posts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const liked = !post.liked;

        if (liked) {
          registerLike();
        }

        return {
          ...post,
          liked,
          likes: post.likes + (liked ? 1 : -1),
        };
      }),
    );
  }

  return (
    <main className="feed-column" aria-label="Social feed">
      <div className="section-kicker">Community greenhouse</div>
      <h2>Field Notes</h2>
      <PostComposer onCreatePost={createPost} />
      <div className="post-list">
        {sortedPosts.map((post) => (
          <article className="post-card stagger-reveal" key={post.id}>
            <header className="post-card__header">
              <img src={post.author.avatarUrl} alt="" />
              <div>
                <strong>{post.author.name}</strong>
                <span>
                  {post.author.handle} - {formatRelativeTime(post.createdAt)}
                </span>
              </div>
            </header>
            <p>{post.body}</p>
            {post.imageUrl ? (
              <figure className="post-card__media">
                <img src={post.imageUrl} alt="" />
                {post.compressionSavedPercent ? (
                  <figcaption>{post.compressionSavedPercent}% lighter via WebP</figcaption>
                ) : null}
              </figure>
            ) : null}
            <footer className="post-card__actions">
              <button
                className={post.liked ? "is-active" : ""}
                onClick={() => toggleLike(post.id)}
                type="button"
              >
                Like {post.likes}
              </button>
              <button type="button">Reply {post.replies}</button>
            </footer>
          </article>
        ))}
      </div>
    </main>
  );
}

function formatRelativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));

  if (minutes < 1) {
    return "now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  return `${Math.round(minutes / 60)}h`;
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

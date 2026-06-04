import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useSocialRealtime } from "../../context/SocialRealtimeContext";
import type { FeedPost, ProfileTab, UserProfile } from "../../types/social";
import type { CompressedImageResult } from "../../utils/imageCompression";
import { ImageDropzone } from "./ImageDropzone";
import { ProfileTabs } from "./ProfileTabs";

interface ProfileCardProps {
  posts: FeedPost[];
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

export function ProfileCard({
  posts,
  profile,
  onProfileChange,
}: ProfileCardProps): ReactElement {
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const ownedObjectUrls = useRef<string[]>([]);
  const { registerFollower } = useSocialRealtime();

  useEffect(
    () => () => {
      ownedObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const replaceImage = useCallback(
    (key: "avatarUrl" | "coverUrl", result: CompressedImageResult): void => {
      ownedObjectUrls.current.push(result.objectUrl);
      onProfileChange({
        ...profile,
        [key]: result.objectUrl,
      });
    },
    [onProfileChange, profile],
  );

  function toggleFollow(): void {
    setIsFollowing((current) => {
      const next = !current;
      const followerDelta = next ? 1 : -1;

      onProfileChange({
        ...profile,
        stats: {
          ...profile.stats,
          followers: profile.stats.followers + followerDelta,
        },
      });

      if (next) {
        registerFollower();
      }

      return next;
    });
  }

  return (
    <aside className="profile-card" aria-label="User profile">
      <ImageDropzone
        currentUrl={profile.coverUrl}
        label="Change cover"
        onImageReady={(result) => replaceImage("coverUrl", result)}
        variant="cover"
      />
      <div className="profile-card__identity">
        <ImageDropzone
          currentUrl={profile.avatarUrl}
          label="Change avatar"
          onImageReady={(result) => replaceImage("avatarUrl", result)}
          variant="avatar"
        />
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.handle}</p>
        </div>
      </div>
      <p className="profile-card__role">{profile.role}</p>
      <p className="profile-card__bio">{profile.bio}</p>
      <div className="profile-stats" aria-label="Profile statistics">
        <span>
          <strong>{profile.stats.posts}</strong>
          Posts
        </span>
        <span>
          <strong>{profile.stats.followers.toLocaleString()}</strong>
          Followers
        </span>
        <span>
          <strong>{profile.stats.following}</strong>
          Following
        </span>
      </div>
      <button
        className={`profile-follow ${isFollowing ? "is-following" : ""}`}
        onClick={toggleFollow}
        type="button"
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} posts={posts} />
    </aside>
  );
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
  isVerified: boolean;
  isFollowing?: boolean;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  email?: string;
}

export interface SearchUsersQuery {
  q: string;
  limit?: number;
  offset?: number;
}

export interface UserSettingsRequest {
  displayName?: string;
  bio?: string;
  email?: string;
  isPrivate?: boolean;
}

export interface UserSearchResult {
  id: number;
  username: string;
  displayName: string | null;
}



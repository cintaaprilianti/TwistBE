export interface PostPayload {
  content: string;
  parentPostId?: number; // for replies
}

export interface UpdatePostRequest {
  content: string;
}

export interface PostResponse {
  id: number;
  content: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  createdAt: Date;
  updatedAt: Date | null;
  isEdited: boolean;
  isPinned: boolean;
  user: {
    id: number;
    username: string;
    displayName: string | null;
  };
  parentPost?: PostResponse | null;
  isLiked?: boolean;
  isReposted?: boolean;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateRepostRequest {
  quoteContent?: string;
  isQuotePost?: boolean;
}
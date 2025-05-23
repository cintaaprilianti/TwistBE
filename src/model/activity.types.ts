export interface ActivityResponse {
  id: number;
  activityType: string;
  referenceType: string;
  referenceId: number;
  createdAt: Date;
  showInProfile: boolean;
  user: {
    id: number;
    username: string;
    displayName: string | null;
  };
  reference?: any; // post, user, etc.
}

export interface ActivityFilterQuery {
  type?: "like" | "repost" | "follow" | "comment";
  page?: number;
  limit?: number;
}

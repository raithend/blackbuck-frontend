export interface Notification {
  id: string;
  type: "follow" | "like" | "comment";
  actor: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  createdAt: string;
} 
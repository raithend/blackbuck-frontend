export interface Notification {
  id: string;
  type: "follow" | "like" | "comment";
  actor: {
    id: string;
    username: string;
    avatar_url: string;
  };
  created_at: string;
} 
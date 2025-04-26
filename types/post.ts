export interface Post {
  id: string;
  content: string;
  location?: string;
  species?: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
} 
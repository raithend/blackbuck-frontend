export interface Post {
  id: string;
  content: string;
  location?: string;
  species?: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
  liked: boolean;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
} 
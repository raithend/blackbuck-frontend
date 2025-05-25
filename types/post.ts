export interface Post {
  id: number;
  content: string;
  location: string;
  classification: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    avatar_url: string | null;
    account_id: string;
  };
  post_images: {
    id: number;
    url: string;
  }[];
} 
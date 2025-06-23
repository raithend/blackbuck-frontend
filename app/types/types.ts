import type { Database } from "./database.types";

export type User = Database["public"]["Tables"]["users"]["Row"];

export type Post = Database["public"]["Tables"]["posts"]["Row"] & {
	post_images: {
		id: string;
		image_url: string;
		order_index: number;
	}[];
};

export type PostWithUser = Post & {
	user: User;
};

export type Location = Database["public"]["Tables"]["locations"]["Row"];

export type Classification = {
	name: string;
	count: number;
};

// フォトバブル関連の型定義
export type PhotoBubble = Database["public"]["Tables"]["photo_bubbles"]["Row"];

export type PhotoBubbleCreate = {
	name: string;
	page_url: string;
	image_url: string;
	target_url?: string;
	x_position?: number;
	y_position?: number;
};

export type PhotoBubbleUpdate = Partial<PhotoBubbleCreate>;

export type ProfilePhotoBubble = Database["public"]["Views"]["profile_photo_bubbles"]["Row"];

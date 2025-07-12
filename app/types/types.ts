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
	likeCount?: number;
	commentCount?: number;
	isLiked?: boolean;
	likedAt?: string;
};

export type Location = Database["public"]["Tables"]["locations"]["Row"];

export type Event = Database["public"]["Tables"]["events"]["Row"];

export type Classification = Database["public"]["Tables"]["classifications"]["Row"];

export type PhotoBubble = Database["public"]["Tables"]["photo_bubbles"]["Row"];

export type ProfilePhotoBubble =
	Database["public"]["Views"]["profile_photo_bubbles"]["Row"];

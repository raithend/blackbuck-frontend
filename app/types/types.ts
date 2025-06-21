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

export type Classification = {
	name: string;
	count: number;
};

export interface PhotoBubble {
	id: string;
	x_coordinate: number;
	y_coordinate: number;
	author_id: string;
	description?: string;
	image_url?: string;
	target_url?: string;
	page_type: 'profile' | 'classification' | 'location';
	page_identifier: string;
	created_at: string;
	updated_at: string;
}

export interface PhotoBubbleCreate {
	x_coordinate: number;
	y_coordinate: number;
	description?: string;
	image_url?: string;
	target_url?: string;
	page_type: 'profile' | 'classification' | 'location';
	page_identifier: string;
}

export interface PhotoBubbleUpdate {
	x_coordinate?: number;
	y_coordinate?: number;
	description?: string;
	image_url?: string;
	target_url?: string;
}

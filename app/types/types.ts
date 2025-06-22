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

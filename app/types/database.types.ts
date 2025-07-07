export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instanciate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "12.2.3 (519615d)";
	};
	public: {
		Tables: {
			classifications: {
				Row: {
					created_at: string;
					description: string | null;
					english_name: string | null;
					era_end: string | null;
					era_start: string | null;
					header_url: string | null;
					id: string;
					name: string;
					scientific_name: string | null;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					english_name?: string | null;
					era_end?: string | null;
					era_start?: string | null;
					header_url?: string | null;
					id?: string;
					name: string;
					scientific_name?: string | null;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					english_name?: string | null;
					era_end?: string | null;
					era_start?: string | null;
					header_url?: string | null;
					id?: string;
					name?: string;
					scientific_name?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			comment_images: {
				Row: {
					comment_id: string;
					created_at: string | null;
					id: string;
					image_url: string;
					order_index: number;
					updated_at: string | null;
				};
				Insert: {
					comment_id: string;
					created_at?: string | null;
					id?: string;
					image_url: string;
					order_index?: number;
					updated_at?: string | null;
				};
				Update: {
					comment_id?: string;
					created_at?: string | null;
					id?: string;
					image_url?: string;
					order_index?: number;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "comment_images_comment_id_fkey";
						columns: ["comment_id"];
						isOneToOne: false;
						referencedRelation: "comments";
						referencedColumns: ["id"];
					},
				];
			};
			comment_likes: {
				Row: {
					comment_id: string;
					created_at: string | null;
					id: string;
					user_id: string;
				};
				Insert: {
					comment_id: string;
					created_at?: string | null;
					id?: string;
					user_id: string;
				};
				Update: {
					comment_id?: string;
					created_at?: string | null;
					id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "comment_likes_comment_id_fkey";
						columns: ["comment_id"];
						isOneToOne: false;
						referencedRelation: "comments";
						referencedColumns: ["id"];
					},
				];
			};
			comments: {
				Row: {
					classification: string | null;
					content: string;
					created_at: string | null;
					id: string;
					location: string | null;
					parent_comment_id: string | null;
					post_id: string | null;
					updated_at: string | null;
					user_id: string;
				};
				Insert: {
					classification?: string | null;
					content: string;
					created_at?: string | null;
					id?: string;
					location?: string | null;
					parent_comment_id?: string | null;
					post_id?: string | null;
					updated_at?: string | null;
					user_id: string;
				};
				Update: {
					classification?: string | null;
					content?: string;
					created_at?: string | null;
					id?: string;
					location?: string | null;
					parent_comment_id?: string | null;
					post_id?: string | null;
					updated_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "comments_parent_comment_id_fkey";
						columns: ["parent_comment_id"];
						isOneToOne: false;
						referencedRelation: "comments";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "comments_post_id_fkey";
						columns: ["post_id"];
						isOneToOne: false;
						referencedRelation: "posts";
						referencedColumns: ["id"];
					},
				];
			};
			events: {
				Row: {
					created_at: string;
					description: string | null;
					header_url: string | null;
					id: string;
					name: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					header_url?: string | null;
					id?: string;
					name: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					header_url?: string | null;
					id?: string;
					name?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			follows: {
				Row: {
					created_at: string;
					follower_id: string;
					following_id: string;
					id: string;
				};
				Insert: {
					created_at?: string;
					follower_id: string;
					following_id: string;
					id?: string;
				};
				Update: {
					created_at?: string;
					follower_id?: string;
					following_id?: string;
					id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "follows_follower_id_fkey";
						columns: ["follower_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "follows_following_id_fkey";
						columns: ["following_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			habitat_data: {
				Row: {
					classification_id: string | null;
					content: string;
					created_at: string;
					creator: string | null;
					id: string;
					updated_at: string;
				};
				Insert: {
					classification_id?: string | null;
					content: string;
					created_at?: string;
					creator?: string | null;
					id?: string;
					updated_at?: string;
				};
				Update: {
					classification_id?: string | null;
					content?: string;
					created_at?: string;
					creator?: string | null;
					id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "habitat_data_classification_id_fkey";
						columns: ["classification_id"];
						isOneToOne: false;
						referencedRelation: "classifications";
						referencedColumns: ["id"];
					},
				];
			};
			likes: {
				Row: {
					created_at: string;
					id: string;
					post_id: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					post_id: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					post_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "likes_post_id_fkey";
						columns: ["post_id"];
						isOneToOne: false;
						referencedRelation: "posts";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "likes_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			locations: {
				Row: {
					created_at: string;
					description: string | null;
					header_url: string | null;
					id: string;
					name: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					header_url?: string | null;
					id?: string;
					name: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					header_url?: string | null;
					id?: string;
					name?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			photo_bubbles: {
				Row: {
					created_at: string;
					id: string;
					image_url: string;
					name: string;
					page_url: string;
					target_url: string | null;
					updated_at: string;
					user_id: string;
					x_position: number;
					y_position: number;
				};
				Insert: {
					created_at?: string;
					id?: string;
					image_url: string;
					name: string;
					page_url: string;
					target_url?: string | null;
					updated_at?: string;
					user_id: string;
					x_position?: number;
					y_position?: number;
				};
				Update: {
					created_at?: string;
					id?: string;
					image_url?: string;
					name?: string;
					page_url?: string;
					target_url?: string | null;
					updated_at?: string;
					user_id?: string;
					x_position?: number;
					y_position?: number;
				};
				Relationships: [];
			};
			phylogenetic_trees: {
				Row: {
					classification_id: string | null;
					content: string;
					created_at: string;
					creator: string | null;
					id: string;
					updated_at: string;
				};
				Insert: {
					classification_id?: string | null;
					content: string;
					created_at?: string;
					creator?: string | null;
					id?: string;
					updated_at?: string;
				};
				Update: {
					classification_id?: string | null;
					content?: string;
					created_at?: string;
					creator?: string | null;
					id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "phylogenetic_trees_classification_id_fkey";
						columns: ["classification_id"];
						isOneToOne: false;
						referencedRelation: "classifications";
						referencedColumns: ["id"];
					},
				];
			};
			post_images: {
				Row: {
					created_at: string;
					id: string;
					image_url: string;
					order_index: number;
					post_id: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					image_url: string;
					order_index: number;
					post_id: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					image_url?: string;
					order_index?: number;
					post_id?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "post_images_post_id_fkey";
						columns: ["post_id"];
						isOneToOne: false;
						referencedRelation: "posts";
						referencedColumns: ["id"];
					},
				];
			};
			posts: {
				Row: {
					classification: string | null;
					content: string;
					created_at: string;
					event: string | null;
					id: string;
					location: string | null;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					classification?: string | null;
					content: string;
					created_at?: string;
					event?: string | null;
					id?: string;
					location?: string | null;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					classification?: string | null;
					content?: string;
					created_at?: string;
					event?: string | null;
					id?: string;
					location?: string | null;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "posts_user_id_fkey";
						columns: ["user_id"];
						isOneToOne: false;
						referencedRelation: "users";
						referencedColumns: ["id"];
					},
				];
			};
			users: {
				Row: {
					account_id: string;
					avatar_url: string | null;
					bio: string | null;
					created_at: string;
					header_url: string | null;
					id: string;
					updated_at: string;
					username: string;
				};
				Insert: {
					account_id: string;
					avatar_url?: string | null;
					bio?: string | null;
					created_at?: string;
					header_url?: string | null;
					id: string;
					updated_at?: string;
					username: string;
				};
				Update: {
					account_id?: string;
					avatar_url?: string | null;
					bio?: string | null;
					created_at?: string;
					header_url?: string | null;
					id?: string;
					updated_at?: string;
					username?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			profile_photo_bubbles: {
				Row: {
					created_at: string | null;
					id: string | null;
					image_url: string | null;
					name: string | null;
					page_url: string | null;
					profile_user_id: string | null;
					target_url: string | null;
					updated_at: string | null;
					user_id: string | null;
					x_position: number | null;
					y_position: number | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string | null;
					image_url?: string | null;
					name?: string | null;
					page_url?: string | null;
					profile_user_id?: never;
					target_url?: string | null;
					updated_at?: string | null;
					user_id?: string | null;
					x_position?: number | null;
					y_position?: number | null;
				};
				Update: {
					created_at?: string | null;
					id?: string | null;
					image_url?: string | null;
					name?: string | null;
					page_url?: string | null;
					profile_user_id?: never;
					target_url?: string | null;
					updated_at?: string | null;
					user_id?: string | null;
					x_position?: number | null;
					y_position?: number | null;
				};
				Relationships: [];
			};
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;

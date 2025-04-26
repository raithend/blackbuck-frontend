import { PostCards } from "@/components/post/post-cards";

export default function Page() {
	return (
		<main>
			<PostCards apiUrl="/api/v1/posts" />
		</main>
	);
}

import { PostCards } from "@/components/post/post-cards";

export default function Page() {
	return <div>
		<PostCards apiUrl="/api/v1/users/[id]/likes" />
	</div>;
}

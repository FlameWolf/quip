import { createResource, Show, Suspense } from "solid-js";
import DisplayPost from "./DisplayPost";
import { useParams } from "@solidjs/router";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;

export default props => {
	const params = useParams();
	const [post] = createResource(async () => {
		const response = await fetch(`${postsBaseUrl}/${params.postId}`);
		if (!response.ok) {
			throw new Error("Failed to load post");
		}
		return (await response.json()).post;
	});
	return (
		<Suspense fallback={<p>Loading post...</p>}>
			<Show when={post()} fallback={<p>Post not found.</p>}>
				<DisplayPost post={post()}/>
			</Show>
		</Suspense>
	);
};
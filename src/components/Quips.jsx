import { useParams } from "@solidjs/router";
import { createMemo, createSignal, onMount } from "solid-js";
import { emptyString, maxItemsToFetch } from "../library";
import DisplayPostList from "./DisplayPostList";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default props => {
	let loadMoreButton;
	const params = useParams();
	const profileUrl = createMemo(() => `${profileBaseUrl}/${params.handle}`);
	const [lastPostId, setLastPostId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const [userPosts, setUserPosts] = createSignal([]);
	const loadUserQuips = async () => {
		const data = await (await fetch(`${profileUrl()}/posts?includeRepeats=true&includeReplies=true&lastPostId=${lastPostId()}`)).json();
		const posts = data.posts;
		const postsCount = posts.length;
		if (postsCount) {
			setLastPostId(posts[postsCount - 1]._id);
		}
		if (postsCount < maxItemsToFetch) {
			setHasMore(false);
		}
		setUserPosts([...userPosts(), ...posts]);
	};
	onMount(async () => {
		await loadUserQuips();
	});
	return (
		<>
			<DisplayPostList posts={userPosts()}/>
			<div class="my-2">
				<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} onClick={loadUserQuips}></button>
			</div>
		</>
	);
};
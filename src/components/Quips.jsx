import { useParams } from "@solidjs/router";
import { createMemo, createSignal, onMount } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage, maxItemsToFetch } from "../library";
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
		try {
			const response = await fetch(`${profileUrl()}/posts?includeRepeats=true&includeReplies=true&lastPostId=${lastPostId()}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			const posts = (await response.json()).posts;
			const postsCount = posts.length;
			if (postsCount) {
				setLastPostId(posts[postsCount - 1]._id);
			}
			if (postsCount < maxItemsToFetch) {
				setHasMore(false);
			}
			setUserPosts(userPosts().concat(posts));
		} catch (err) {
			setErrorStore("message", err.message);
		}
	};
	onMount(async () => {
		await loadUserQuips();
	});
	return (
		<>
			<Show when={!userPosts().length}>
				<div class="d-flex justify-content-center align-items-center text-info border border-info rounded p-3">
					<div>No posts to display.</div>
				</div>
			</Show>
			<Show when={userPosts().length}>
				<DisplayPostList posts={userPosts()}/>
				<div class="my-2">
					<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} onClick={loadUserQuips}></button>
				</div>
			</Show>
		</>
	);
};
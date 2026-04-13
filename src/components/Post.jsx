import { createEffect, createMemo, createResource, createSignal, Show, Suspense } from "solid-js";
import DisplayPost from "./DisplayPost";
import DisplayPostList from "./DisplayPostList";
import { useParams } from "@solidjs/router";
import { maxItemsToFetch } from "../library";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;

export default props => {
	let loadMoreButton;
	const params = useParams();
	const postId = createMemo(() => params.postId);
	const [postReplies, setPostReplies] = createSignal([]);
	const [hasMore, setHasMore] = createSignal(false);
	const [lastReplyId, setLastReplyId] = createSignal();
	const [post] = createResource(async () => {
		const response = await fetch(`${postsBaseUrl}/${postId()}`);
		if (!response.ok) {
			throw new Error("Failed to load post");
		}
		return (await response.json()).post;
	});
	const [parentPost] = createResource(async () => {
		const response = await fetch(`${postsBaseUrl}/${postId()}/parent`);
		if (!response.ok) {
			return null;
		}
		return (await response.json()).parent;
	});
	const loadReplies = async () => {
		const response = await fetch(`${postsBaseUrl}/${postId()}/replies${lastReplyId() ? `?lastReplyId=${lastReplyId()}` : ""}`);
		if (!response.ok) {
			return [];
		}
		const loadedReplies = (await response.json()).replies;
		setPostReplies(postReplies().concat(loadedReplies));
		if (loadedReplies.length === maxItemsToFetch) {
			setHasMore(true);
			setLastReplyId(loadedReplies.at(-1)._id);
		} else {
			setHasMore(false);
		}
	};
	createEffect(() => {
		if (post()) {
			setPostReplies([]);
			setHasMore(false);
			setLastReplyId(null);
			loadReplies();
		}
	});
	return (
		<Suspense fallback={<p>Loading post...</p>}>
			<Show when={parentPost()}>
				<div class="mb-4">
					<h5>In reply to:</h5>
					<DisplayPost post={parentPost()}/>
				</div>
			</Show>
			<Show when={post()} fallback={<p>Post not found.</p>}>
				<div class="fs-5">
					<DisplayPost post={post()}/>
				</div>
			</Show>
			<Show when={postReplies()?.length}>
				<div class="mt-4">
					<h5>Replies:</h5>
					<DisplayPostList posts={postReplies()}/>
				</div>
				<Show when={hasMore()}>
					<div class="my-2">
						<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Replies"} onClick={loadReplies}></button>
					</div>
				</Show>
			</Show>
		</Suspense>
	);
};
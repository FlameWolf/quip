import { useParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, on, Show } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage, maxItemsToFetch } from "../library";
import type { Post } from "../types";
import DisplayPostList from "./DisplayPostList";

const hashtagBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/hashtag`;

export default (props: Record<keyof any, any>) => {
	const params = useParams();
	const hashtagUrl = createMemo(() => `${hashtagBaseUrl}/${params.tagName}`);
	const [hashtagPosts, setHashtagPosts] = createSignal<Post[]>([]);
	const [lastPostId, setLastPostId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const loadHashtagPosts = async () => {
		try {
			const response = await fetch(`${hashtagUrl()}${lastPostId() ? `?lastPostId=${lastPostId()}` : emptyString}`);
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
			setHashtagPosts(hashtagPosts().concat(posts));
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	createEffect(
		on(
			() => params.tagName,
			async () => {
				setHashtagPosts([]);
				setLastPostId(emptyString);
				setHasMore(true);
				await loadHashtagPosts();
			}
		)
	);
	return (
		<>
			<h2>#{decodeURIComponent(params.tagName as string)}</h2>
			<Show when={!hashtagPosts().length}>
				<div class="d-flex justify-content-center align-items-center text-info border border-info rounded p-3">
					<div>No posts to display.</div>
				</div>
			</Show>
			<Show when={hashtagPosts().length}>
				<DisplayPostList posts={hashtagPosts()}/>
				<div class="my-2">
					<button class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} onClick={loadHashtagPosts} disabled={!hasMore()}></button>
				</div>
			</Show>
		</>
	);
};
import { createEffect, createMemo, createSignal, onMount, Show } from "solid-js";
import DisplayPost from "./DisplayPost";
import DisplayPostList from "./DisplayPostList";
import { useParams } from "@solidjs/router";
import { setErrorStore } from "../stores/error-store";
import { getErrorMessage, maxItemsToFetch } from "../library";
import type { Post as PostType } from "../types";
import type { ThreadProps } from "../types/ThreadProps";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;

export default (props: ThreadProps) => {
	let loadMoreButton: HTMLButtonElement | undefined;
	const params = useParams();
	const postId = createMemo(() => params.postId);
	const [post, setPost] = createSignal<PostType | null>(null);
	const [parentPost, setParentPost] = createSignal<PostType | null>(null);
	const [postReplies, setPostReplies] = createSignal<PostType[]>([]);
	const [lastReplyId, setLastReplyId] = createSignal<string | undefined>(postId());
	const [hasMore, setHasMore] = createSignal(false);
	const [hasError, setHasError] = createSignal<boolean>(false);
	const fetchPost = async () => {
		try {
			const response = await fetch(`${postsBaseUrl}/${postId()}`);
			if (!response.ok) {
				setHasError(true);
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			setHasError(false);
			setPost((await response.json()).post);
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	const fetchParentPost = async () => {
		try {
			const response = await fetch(`${postsBaseUrl}/${postId()}/parent`);
			setParentPost(response.ok ? (await response.json()).parent : null);
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	const loadReplies = async () => {
		try {
			const response = await fetch(`${postsBaseUrl}/${lastReplyId()}/thread`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			const loadedReplies = (await response.json()).replies;
			setPostReplies(postReplies().concat(loadedReplies));
			if (loadedReplies.length === maxItemsToFetch) {
				setHasMore(true);
				setLastReplyId(loadedReplies.at(-1)._id);
			} else {
				setHasMore(false);
			}
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	onMount(async () => {
		setPost(null);
		setParentPost(null);
		setPostReplies([]);
		setHasMore(false);
		setHasError(false);
	});
	createEffect(async () => {
		if (postId()) {
			await fetchPost();
			await fetchParentPost();
			await loadReplies();
		}
	});
	return (
		<>
			<Show when={parentPost()}>
				<div class="mb-4">
					<h5>In reply to:</h5>
					<DisplayPost post={parentPost()!}/>
				</div>
			</Show>
			<Show when={!post()}>
				<Show when={!hasError()}>
					<div class="text-center mt-4">
						<div class="spinner-border" role="status">
							<span class="visually-hidden">Loading...</span>
						</div>
					</div>
				</Show>
				<Show when={hasError()}>
					<div class="alert alert-info mt-4" role="alert">
						<span>Failed to load post.</span>
					</div>
				</Show>
			</Show>
			<Show when={post()}>
				<div class="fs-5">
					<DisplayPost post={post()!}/>
				</div>
			</Show>
			<Show when={postReplies()?.length}>
				<div class="mt-4">
					<h5>Thread:</h5>
					<DisplayPostList posts={postReplies()}/>
				</div>
				<Show when={hasMore()}>
					<div class="my-2">
						<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Replies"} onClick={loadReplies}></button>
					</div>
				</Show>
			</Show>
		</>
	);
};
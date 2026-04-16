import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import DisplayPost from "./DisplayPost";
import DisplayPostList from "./DisplayPostList";
import { useNavigate, useParams } from "@solidjs/router";
import { emptyString, maxItemsToFetch } from "../library";
import { TbOutlineJumpRope } from "solid-icons/tb";
import { Tooltip } from "bootstrap";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;

export default props => {
	let threadViewbutton;
	let threadViewTooltip;
	let loadMoreButton;
	const params = useParams();
	const navigate = useNavigate();
	const postId = createMemo(() => params.postId);
	const [post, setPost] = createSignal();
	const [parentPost, setParentPost] = createSignal();
	const [postReplies, setPostReplies] = createSignal([]);
	const [lastReplyId, setLastReplyId] = createSignal();
	const [hasMore, setHasMore] = createSignal(false);
	const [hasError, setHasError] = createSignal();
	const fetchPost = async () => {
		const response = await fetch(`${postsBaseUrl}/${postId()}`);
		const success = response.ok;
		if (success) {
			setPost((await response.json()).post);
		}
		setHasError(!success);
	};
	const fetchParentPost = async () => {
		const response = await fetch(`${postsBaseUrl}/${postId()}/parent`);
		if (response.ok) {
			setParentPost(response.ok ? (await response.json()).parent : null);
		}
	};
	const loadReplies = async () => {
		const response = await fetch(`${postsBaseUrl}/${postId()}/replies${lastReplyId() ? `?lastReplyId=${lastReplyId()}` : emptyString}`);
		if (!response.ok) {
			setHasMore(false);
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
	};
	onMount(async () => {
		setPost(null);
		setParentPost(null);
		setPostReplies([]);
		setLastReplyId(null);
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
	createEffect(() => {
		if (post()) {
			threadViewTooltip = new Tooltip(threadViewbutton, {
				trigger: "hover",
				title: "Thread View"
			});
		}
	});
	onCleanup(() => {
		if (threadViewTooltip) {
			threadViewTooltip.dispose();
		}
	});
	return (
		<>
			<Show when={parentPost()}>
				<div class="mb-4">
					<h5>In reply to:</h5>
					<DisplayPost post={parentPost()}/>
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
				<div class="d-flex justify-content-end">
					<button ref={threadViewbutton} class="btn btn-primary" onClick={() => navigate(`/thread/${postId()}`)} aria-label="Thread View">
						<TbOutlineJumpRope/>
					</button>
				</div>
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
		</>
	);
};
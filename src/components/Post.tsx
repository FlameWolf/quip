import { createResource, Show, Suspense } from "solid-js";
import DisplayPost from "./DisplayPost";
import DisplayPostList from "./DisplayPostList";
import { useNavigate, useParams } from "@solidjs/router";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage, nullId } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import { TbOutlineJumpRope } from "solid-icons/tb";
import { OverlayTrigger, Tooltip } from "solid-bootstrap";
import { LoadMore, Spinner } from "./Common";
import type { Post as PostType } from "../types";
import type { PostProps } from "../types/PostProps";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;

export default (props: PostProps) => {
	const params = useParams();
	const navigate = useNavigate();
	const postId = () => params.postId;
	const [post] = createResource(postId, async id => {
		try {
			const response = await fetch(`${postsBaseUrl}/${id}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return null;
			}
			return (await response.json()).post as PostType;
		} catch (err: any) {
			setErrorStore("message", err.message);
			return null;
		}
	});
	const [parent] = createResource(postId, async id => {
		try {
			const response = await fetch(`${postsBaseUrl}/${id}/parent`);
			return response.ok ? ((await response.json()).parent as PostType) : null;
		} catch (err: any) {
			setErrorStore("message", err.message);
			return null;
		}
	});
	const replies = createInfiniteList<PostType>(postId, async (id, lastItem) => {
		const response = await fetch(`${postsBaseUrl}/${id}/replies${lastItem ? `?lastReplyId=${lastItem._id}` : emptyString}`);
		if (!response.ok) {
			setErrorStore("message", await getErrorMessage(response));
			return null;
		}
		return (await response.json()).replies as PostType[];
	});
	return (
		<>
			<Suspense fallback={<Spinner/>}>
				<Show when={parent()}>
					<div class="mb-4">
						<h5>In reply to:</h5>
						<DisplayPost post={parent()!}/>
					</div>
				</Show>
				<Show when={post()?.replyTo === nullId || (post()?.replyTo && !parent())}>
					<div class="text-bg-secondary border rounded p-3 mb-2">The parent post is not available.</div>
				</Show>
				<Show
					when={post()}
					fallback={
						<div class="alert alert-info mt-4" role="alert">
							<span>Failed to load post.</span>
						</div>
					}>
					<div class="d-flex justify-content-end">
						<OverlayTrigger placement="top" overlay={<Tooltip id="thread-view-tooltip">Thread View</Tooltip>}>
							<button class="btn btn-outline-primary" onClick={() => navigate(`/thread/${postId()}`)} aria-label="Thread View">
								<TbOutlineJumpRope/>
							</button>
						</OverlayTrigger>
					</div>
					<div class="fs-5">
						<DisplayPost post={post()!}/>
					</div>
				</Show>
			</Suspense>
			<Suspense fallback={<Spinner/>}>
				<Show when={replies.items().length}>
					<div class="mt-4">
						<h5>Replies:</h5>
						<DisplayPostList posts={replies.items()}/>
					</div>
					<Show when={replies.hasMore()}>
						<LoadMore hasMore={replies.hasMore()} loading={replies.loadingMore()} doneLabel="No More Replies" onClick={replies.loadMore}/>
					</Show>
				</Show>
			</Suspense>
		</>
	);
};
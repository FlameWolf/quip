import { createResource, Show, Suspense } from "solid-js";
import DisplayPost from "./DisplayPost";
import DisplayPostList from "./DisplayPostList";
import { useParams } from "@solidjs/router";
import { setErrorStore } from "../stores/error-store";
import { getErrorMessage } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import { LoadMore, Spinner } from "./Common";
import type { Post as PostType } from "../types";
import type { ThreadProps } from "../types/ThreadProps";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;

export default (props: ThreadProps) => {
	const params = useParams();
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
	const thread = createInfiniteList<PostType>(postId, async (id, lastItem) => {
		const response = await fetch(`${postsBaseUrl}/${lastItem?._id ?? id}/thread`);
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
				<Show
					when={post()}
					fallback={
						<div class="alert alert-info mt-4" role="alert">
							<span>Failed to load post.</span>
						</div>
					}>
					<div class="fs-5">
						<DisplayPost post={post()!}/>
					</div>
				</Show>
			</Suspense>
			<Suspense>
				<Show when={thread.items().length}>
					<div class="mt-4">
						<h5>Thread:</h5>
						<DisplayPostList posts={thread.items()}/>
					</div>
					<Show when={thread.hasMore()}>
						<LoadMore hasMore={thread.hasMore()} loading={thread.loadingMore()} doneLabel="No More Replies" onClick={thread.loadMore}/>
					</Show>
				</Show>
			</Suspense>
		</>
	);
};
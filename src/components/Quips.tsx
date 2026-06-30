import { useParams } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import type { Post } from "../types";
import type { QuipsProps } from "../types/QuipsProps";
import DisplayPostList from "./DisplayPostList";
import { EmptyState, LoadMore, Spinner } from "./Common";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default (props: QuipsProps) => {
	const params = useParams();
	const list = createInfiniteList<Post>(
		() => params.handle,
		async (handle, lastItem) => {
			const response = await fetch(`${profileBaseUrl}/${handle}/posts?includeRepeats=true&includeReplies=true&lastPostId=${lastItem?._id ?? emptyString}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return null;
			}
			return (await response.json()).posts as Post[];
		}
	);
	return (
		<Suspense fallback={<Spinner/>}>
			<Show when={list.items().length} fallback={<EmptyState/>}>
				<DisplayPostList posts={list.items()}/>
				<LoadMore hasMore={list.hasMore()} loading={list.loadingMore()} onClick={list.loadMore}/>
			</Show>
		</Suspense>
	);
};

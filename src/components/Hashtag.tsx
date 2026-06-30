import { useParams } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import DisplayPostList from "./DisplayPostList";
import { EmptyState, LoadMore, Spinner } from "./Common";
import type { Post } from "../types";
import type { HashtagProps } from "../types/HashtagProps";

const hashtagBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/hashtag`;

export default (props: HashtagProps) => {
	const params = useParams();
	const list = createInfiniteList<Post>(
		() => params.tagName,
		async (tagName, lastItem) => {
			const response = await fetch(`${hashtagBaseUrl}/${tagName}${lastItem ? `?lastPostId=${lastItem._id}` : emptyString}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return null;
			}
			return (await response.json()).posts as Post[];
		}
	);
	return (
		<>
			<h2>#{decodeURIComponent(params.tagName as string)}</h2>
			<Suspense fallback={<Spinner/>}>
				<Show when={list.items().length} fallback={<EmptyState/>}>
					<DisplayPostList posts={list.items()}/>
					<LoadMore hasMore={list.hasMore()} loading={list.loadingMore()} onClick={list.loadMore}/>
				</Show>
			</Suspense>
		</>
	);
};
import { useParams, useLocation } from "@solidjs/router";
import { createMemo, Show, Suspense } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import type { Bookmark, Favourite, Post } from "../types";
import type { InteractionsProps } from "../types/InteractionsProps";
import DisplayPostList from "./DisplayPostList";
import { EmptyState, LoadMore, Spinner } from "./Common";

type Interaction = Favourite | Bookmark | Post;

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default (props: InteractionsProps) => {
	const params = useParams();
	const location = useLocation();
	const pathToUse = createMemo(() => location.pathname.split("/")[2]);
	const lastInteractionIdKey = createMemo(() => {
		switch (pathToUse()) {
			case "favourites":
				return "lastFavouriteId";
			case "votes":
				return "lastVoteId";
			case "bookmarks":
				return "lastBookmarkId";
			case "mentions":
				return "lastMentionId";
			default:
				throw new Error("Invalid path");
		}
	});
	const toPost = (interaction: Interaction): Post => ("post" in interaction ? (interaction as Favourite | Bookmark).post : (interaction as Post));
	const list = createInfiniteList<Interaction>(
		() => `${params.handle}:${pathToUse()}`,
		async (_key, lastItem) => {
			const response = await fetch(`${profileBaseUrl}/${params.handle}/${pathToUse()}${lastItem ? `?${lastInteractionIdKey()}=${lastItem._id}` : emptyString}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return null;
			}
			return ((await response.json())?.[pathToUse()] as Interaction[]) ?? [];
		}
	);
	const posts = createMemo(() => list.items().map(toPost));
	return (
		<Suspense fallback={<Spinner/>}>
			<Show when={posts().length} fallback={<EmptyState/>}>
				<DisplayPostList posts={posts()}/>
				<LoadMore hasMore={list.hasMore()} loading={list.loadingMore()} doneLabel="No More Results" onClick={list.loadMore}/>
			</Show>
		</Suspense>
	);
};
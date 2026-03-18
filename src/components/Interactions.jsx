import { createEffect, createMemo, createSignal, onMount, Show } from "solid-js";
import { authStore } from "../stores/auth-store";
import { emptyString, maxItemsToFetch } from "../library";
import DisplayPostList from "./DisplayPostList";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;
// const favouritesUrl = `${profileBaseUrl}/favourites`;
// const votesUrl = `${profileBaseUrl}/votes`;
// const bookmarksUrl = `${profileBaseUrl}/bookmarks`;
// const mentionsUrl = `${profileBaseUrl}/mentions`;

export default props => {
	const { [1]: handleToUse, [2]: pathToUse } = location.pathname.split("/");
	const lastInteractionIdKey = (() => {
		switch (pathToUse) {
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
	})();
	const [interactions, setInteractions] = createSignal([]);
	const [lastInteractionId, setLastInteractionId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const isAuthenticated = createMemo(() => authStore.userId && authStore.handle);
	const fetchInteractions = async () => {
		if (pathToUse !== "mentions" && !(isAuthenticated() && hasMore())) {
			return;
		}
		const response = await fetch(`${profileBaseUrl}/${handleToUse}/${pathToUse}${lastInteractionId() ? `?${lastInteractionIdKey}=${lastInteractionId()}` : emptyString}`);
		if (response.ok) {
			const data = (await response.json())?.[pathToUse];
			const fetchedCount = data?.length ?? 0;
			if (fetchedCount < maxItemsToFetch) {
				setHasMore(false);
			}
			if (fetchedCount > 0) {
				setInteractions([
					...interactions(),
					...data.map(x => {
						switch (pathToUse) {
							case "favourites":
							case "bookmarks":
								return x.post;
							case "votes":
							case "mentions":
							default:
								return x;
						}
					})
				]);
				setLastInteractionId(data[fetchedCount - 1]._id);
			}
		} else {
			console.error("Failed to fetch interactions:", response.statusText);
		}
	};
	createEffect(async () => {
		if (pathToUse !== "mentions" && isAuthenticated()) {
			await fetchInteractions();
		}
	});
	onMount(async () => {
		await fetchInteractions();
	});
	return (
		<Show when={interactions().length}>
			<DisplayPostList posts={interactions()}/>
			<div class="my-2">
				<button class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Results"} onClick={fetchInteractions} disabled={!hasMore()}></button>
			</div>
		</Show>
	);
};
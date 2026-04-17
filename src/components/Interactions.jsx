import { useParams, useLocation } from "@solidjs/router";
import { createMemo, createSignal, onMount, Show } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage, maxItemsToFetch } from "../library";
import DisplayPostList from "./DisplayPostList";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default props => {
	const params = useParams();
	const location = useLocation();
	const profileUrl = createMemo(() => `${profileBaseUrl}/${params.handle}`);
	const { [2]: pathToUse } = location.pathname.split("/");
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
	const fetchInteractions = async () => {
		if (pathToUse !== "mentions" && !hasMore()) {
			return;
		}
		try {
			const response = await fetch(`${profileUrl()}/${pathToUse}${lastInteractionId() ? `?${lastInteractionIdKey}=${lastInteractionId()}` : emptyString}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			const data = (await response.json())?.[pathToUse];
			const fetchedCount = data?.length ?? 0;
			if (fetchedCount < maxItemsToFetch) {
				setHasMore(false);
			}
			if (fetchedCount > 0) {
				setInteractions(
					interactions().concat(
						data.map(x => {
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
					)
				);
				setLastInteractionId(data[fetchedCount - 1]._id);
			}
		} catch (err) {
			setErrorStore("message", err.message);
		}
	};
	onMount(async () => {
		await fetchInteractions();
	});
	return (
		<>
			<Show when={!interactions().length}>
				<div class="d-flex justify-content-center align-items-center text-info border border-info rounded p-3">
					<div>No posts to display.</div>
				</div>
			</Show>
			<Show when={interactions().length}>
				<DisplayPostList posts={interactions()}/>
				<div class="my-2">
					<button class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Results"} onClick={fetchInteractions} disabled={!hasMore()}></button>
				</div>
			</Show>
		</>
	);
};
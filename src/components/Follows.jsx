import { useParams, useLocation, A } from "@solidjs/router";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { emptyString, maxItemsToFetch } from "../library";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default props => {
	const params = useParams();
	const location = useLocation();
	const profileUrl = createMemo(() => `${profileBaseUrl}/${params.handle}`);
	const { [2]: pathToUse } = location.pathname.split("/");
	const userKey = (() => {
		switch (pathToUse) {
			case "following":
				return "user";
			case "followers":
				return "followedBy";
			default:
				throw new Error("Invalid path");
		}
	})();
	const [follows, setFollows] = createSignal([]);
	const [lastFollowId, setLastFollowId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const fetchFollows = async () => {
		if (!hasMore()) {
			return;
		}
		const response = await fetch(`${profileUrl()}/${pathToUse}${lastFollowId() ? `?lastFollowId=${lastFollowId()}` : emptyString}`);
		if (response.ok) {
			const data = (await response.json())?.[pathToUse];
			const fetchedCount = data?.length ?? 0;
			if (fetchedCount < maxItemsToFetch) {
				setHasMore(false);
			}
			if (fetchedCount > 0) {
				setFollows(follows().concat(data.map(x => x[userKey])));
				setLastFollowId(data[fetchedCount - 1]._id);
			}
		} else {
			console.error("Failed to fetch follows:", response.statusText);
		}
	};
	onMount(async () => {
		await fetchFollows();
	});
	return (
		<Show when={follows().length}>
			<ul class="list-group">
				<For each={follows()}>
					{follow => (
						<li class="list-group-item">
							<h3><A href={`/${follow.handle}`}>{follow.handle}</A></h3>
							<div class="d-flex gap-2">
								{follow.protected && <div class="badge text-bg-info">Protected</div>}
								{follow.deactivated && <div class="badge text-bg-info">Deactivated</div>}
								{(follow.followedByMe && pathToUse === "followers") && <div class="badge text-bg-info">Followed by you</div>}
								{(follow.followedMe && pathToUse === "following") && <div class="badge text-bg-info">Followed you</div>}
								{follow.mutedByMe && <div class="badge text-bg-info">Muted by you</div>}
							</div>
							<p>{follow.postsCount} {follow.postsCount === 1 ? "post" : "posts"}</p>
						</li>
					)}
				</For>
			</ul>
			<div class="my-2">
				<button class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Results"} onClick={fetchFollows} disabled={!hasMore()}></button>
			</div>
		</Show>
	);
};
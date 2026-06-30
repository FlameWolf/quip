import { useParams, useLocation, A } from "@solidjs/router";
import { createMemo, For, Show, Suspense } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import type { User } from "../types";
import type { FollowsProps } from "../types/FollowsProps";
import { LoadMore, Spinner } from "./Common";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default (props: FollowsProps) => {
	const params = useParams();
	const location = useLocation();
	const pathToUse = createMemo(() => location.pathname.split("/")[2]);
	const userKey = createMemo(() => {
		switch (pathToUse()) {
			case "following":
				return "user";
			case "followers":
				return "followedBy";
			default:
				throw new Error("Invalid path");
		}
	});
	const list = createInfiniteList<User>(
		() => `${params.handle}:${pathToUse()}`,
		async (_key, lastItem) => {
			const response = await fetch(`${profileBaseUrl}/${params.handle}/${pathToUse()}${lastItem ? `?lastFollowId=${lastItem._id}` : emptyString}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return null;
			}
			const data = (await response.json())?.[pathToUse()] as Array<Record<string, User>>;
			return (data ?? []).map(entry => entry[userKey()]);
		}
	);
	return (
		<Suspense fallback={<Spinner/>}>
			<Show when={list.items().length}>
				<ul class="list-group">
					<For each={list.items()}>
						{follow => (
							<li class="list-group-item">
								<h3>
									<A href={`/${follow.handle}`}>{follow.handle}</A>
								</h3>
								<div class="d-flex gap-2">
									{follow.protected && <div class="badge text-bg-info">Protected</div>}
									{follow.deactivated && <div class="badge text-bg-info">Deactivated</div>}
									{follow.followedByMe && pathToUse() === "followers" && <div class="badge text-bg-info">Followed by you</div>}
									{follow.followedMe && pathToUse() === "following" && <div class="badge text-bg-info">Followed you</div>}
									{follow.mutedByMe && <div class="badge text-bg-info">Muted by you</div>}
								</div>
								<p>{follow.postsCount} {follow.postsCount === 1 ? "post" : "posts"}</p>
							</li>
						)}
					</For>
				</ul>
				<LoadMore hasMore={list.hasMore()} loading={list.loadingMore()} doneLabel="No More Results" onClick={list.loadMore}/>
			</Show>
		</Suspense>
	);
};

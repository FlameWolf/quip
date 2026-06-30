import { createMemo, createSignal, For, Show, Suspense } from "solid-js";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import type { Post } from "../types";
import type { TopmostAllProps } from "../types/TopmostAllProps";
import DisplayPostList from "./DisplayPostList";
import { EmptyState, LoadMore, Spinner } from "./Common";

const topmostUrl = `${import.meta.env.VITE_API_BASE_URL}/topmost`;
const sortOptions = ["Day", "Week", "Month", "Year", "All"];

export default (props: TopmostAllProps) => {
	const [sortBy, setSortBy] = createSignal(sortOptions[0]);
	const list = createInfiniteList<Post>(sortBy, async (sortOption, lastItem) => {
		const queryParams = new URLSearchParams();
		if (lastItem) {
			queryParams.append("lastPostId", lastItem._id);
			if (lastItem.score) {
				queryParams.append("lastScore", String(lastItem.score));
			}
		}
		const response = await fetch(`${topmostUrl}/${sortOption.toLowerCase()}${queryParams.size ? `?${queryParams}` : emptyString}`);
		if (!response.ok) {
			setErrorStore("message", await getErrorMessage(response));
			return null;
		}
		return (await response.json()).posts as Post[];
	});
	const hasMore = createMemo(() => list.hasMore() && (list.items().at(-1)?.score ?? 0) >= 1);
	return (
		<>
			<div class="btn-group d-none d-sm-flex w-100" role="group" aria-label="Sort top posts by">
				<For each={sortOptions}>
					{(option, index) => {
						const itemId = `sort-option-${index() + 1}`;
						return (
							<>
								<input id={itemId} type="radio" class="btn-check" name="sort-option" value={option} checked={option === sortBy()} onInput={() => setSortBy(option)}/>
								<label class="btn btn-outline-primary" for={itemId}>{option}</label>
							</>
						);
					}}
				</For>
			</div>
			<div class="dropdown d-block d-sm-none">
				<button class="btn btn-secondary dropdown-toggle w-100" data-bs-toggle="dropdown" aria-expanded="false">{sortBy()}</button>
				<ul class="dropdown-menu">
					<For each={sortOptions}>
						{option => (
							<li>
								<a class="dropdown-item" onClick={() => setSortBy(option)} role="button">{option}</a>
							</li>
						)}
					</For>
				</ul>
			</div>
			<div class="mt-4">
				<Suspense fallback={<Spinner/>}>
					<Show when={list.items().length} fallback={<EmptyState/>}>
						<DisplayPostList posts={list.items()}/>
						<LoadMore hasMore={hasMore()} loading={list.loadingMore()} onClick={list.loadMore}/>
					</Show>
				</Suspense>
			</div>
		</>
	);
};
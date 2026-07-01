import { createEffect, createMemo, createSignal, For, on, Show, Suspense } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage, toTitleCase } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import DisplayPostList from "./DisplayPostList";
import { EmptyState, LoadMore, Spinner } from "./Common";
import type { Post } from "../types";
import type { TopmostAllProps } from "../types/TopmostAllProps";

const topmostUrl = `${import.meta.env.VITE_API_BASE_URL}/topmost`;
const sortOptions = ["Day", "Week", "Month", "Year", "All"];

export default (props: TopmostAllProps) => {
	const [searchParams, setSearchParams] = useSearchParams<{
		t: string;
	}>();
	const sortParam = searchParams.t ?? emptyString;
	if (!sortOptions.includes(toTitleCase(sortParam))) {
		setSearchParams(
			{
				t: sortOptions[0].toLowerCase()
			},
			{
				replace: true
			}
		);
	}
	const [sortBy, setSortBy] = createSignal(toTitleCase(sortParam));
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
	createEffect(
		on(sortBy, option => {
			setSearchParams(
				{
					t: option.toLowerCase()
				},
				{
					replace: true
				}
			);
		})
	);
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
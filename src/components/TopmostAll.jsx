import { createEffect, createSignal, For, on, Show } from "solid-js";
import { setErrorStore } from "../stores/error-store.jsx";
import DisplayPostList from "./DisplayPostList.jsx";
import { emptyString, getErrorMessage, maxItemsToFetch } from "../library.jsx";

const topmostUrl = `${import.meta.env.VITE_API_BASE_URL}/topmost`;
const sortOptions = ["Day", "Week", "Month", "Year", "All"];

export default props => {
	const [sortBy, setSortBy] = createSignal(sortOptions[0]);
	const [topPosts, setTopPosts] = createSignal([]);
	const [lastPostId, setLastPostId] = createSignal();
	const [lastScore, setLastScore] = createSignal();
	const [hasMore, setHasMore] = createSignal(true);
	const loadTopPosts = async () => {
		const queryParams = new URLSearchParams();
		if (lastPostId()) {
			queryParams.append("lastPostId", lastPostId());
		}
		if (lastScore()) {
			queryParams.append("lastScore", lastScore());
		}
		const response = await fetch(`${topmostUrl}/${sortBy().toLowerCase()}${queryParams.size ? `?${queryParams.toString()}` : ""}`);
		if (!response.ok) {
			setErrorStore("message", await getErrorMessage(response));
			return;
		}
		const posts = (await response.json()).posts;
		const lastPost = posts.at(-1);
		setTopPosts(topPosts().concat(posts));
		setLastPostId(lastPost._id);
		setLastScore(lastPost.score || 0);
		if (posts.length < maxItemsToFetch || lastScore() < 1) {
			setHasMore(false);
		}
	};
	createEffect(
		on(sortBy, async (curr, prev) => {
			document.querySelector(`input[name="sort-option"][value="${curr}"]`)?.dispatchEvent(new MouseEvent("click"));
			if (curr !== prev) {
				setTopPosts([]);
				setLastPostId(undefined);
				setLastScore(undefined);
				setHasMore(true);
				await loadTopPosts();
			}
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
								<input id={itemId} type="radio" class="btn-check" name="sort-option" value={option} onInput={() => setSortBy(option)}/>
								<label class="btn btn-outline-primary" for={itemId}>{option}</label>
							</>
						);
					}}
				</For>
			</div>
			<div class="dropdown d-block d-sm-none">
				<button class="btn btn-secondary dropdown-toggle w-100" innerHTML={sortBy()} data-bs-toggle="dropdown" aria-expanded="false"></button>
				<ul class="dropdown-menu">
					<For each={sortOptions}>
						{(option, index) => (
							<li>
								<a class="dropdown-item" onClick={() => setSortBy(option)} role="button">{option}</a>
							</li>
						)}
					</For>
				</ul>
			</div>
			<div class="mt-4">
				<Show when={!topPosts().length}>
					<div class="d-flex justify-content-center align-items-center text-info border border-info rounded p-3">
						<div>No posts to display.</div>
					</div>
				</Show>
				<Show when={topPosts().length}>
					<DisplayPostList posts={topPosts()}/>
					<div class="my-2">
						<button class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} disabled={!hasMore()} onClick={loadTopPosts}></button>
					</div>
				</Show>
			</div>
		</>
	);
};
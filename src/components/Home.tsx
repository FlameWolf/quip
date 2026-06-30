import { createResource, createSignal, Show, Suspense, useTransition } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { emptyString, getErrorMessage } from "../library";
import { quipStore, setQuipStore } from "../stores/quip-store";
import { setErrorStore } from "../stores/error-store";
import Editor from "./Editor";
import DisplayPostList from "./DisplayPostList";
import { EmptyState, LoadMore, Spinner } from "./Common";
import type { Post } from "../types";
import type { HomeProps } from "../types/HomeProps";

const postsUrl = `${import.meta.env.VITE_API_BASE_URL}/timeline`;

export default (props: HomeProps) => {
	const navigate = useNavigate();
	const [cursor, setCursor] = createSignal(emptyString);
	const [loadingMore, startLoadMore] = useTransition();
	const [exhausted, setExhausted] = createSignal(false);
	const [page] = createResource(cursor, async lastPostId => {
		if (!lastPostId) {
			// Reset on the initial load so a failed reload never shows a prior session's posts.
			setQuipStore("quips", []);
		}
		try {
			const response = await fetch(lastPostId ? `${postsUrl}?lastPostId=${lastPostId}` : postsUrl);
			if (response.status === 401) {
				navigate("/auth");
				return false;
			}
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return false;
			}
			const posts = (await response.json()).posts as Post[];
			setQuipStore("quips", quips => (lastPostId ? quips.concat(posts) : posts));
			if (!posts.length) {
				setExhausted(true);
			}
			return true;
		} catch (err: any) {
			setErrorStore("message", err.message);
			return false;
		}
	});
	const loadMore = () => {
		const lastPostId = quipStore.quips.at(-1)?._id;
		if (lastPostId && !loadingMore()) {
			startLoadMore(() => setCursor(lastPostId));
		}
	};
	return (
		<>
			<Editor classList={{ "mb-2": true }}/>
			<Suspense fallback={<Spinner/>}>
				<Show when={page() !== undefined}>
					<Show when={quipStore.quips.length} fallback={<EmptyState/>}>
						<DisplayPostList posts={quipStore.quips}/>
						<LoadMore hasMore={!exhausted()} loading={loadingMore()} onClick={loadMore}/>
					</Show>
				</Show>
			</Suspense>
		</>
	);
};

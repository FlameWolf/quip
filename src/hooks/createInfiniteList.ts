import { Accessor, createEffect, createMemo, createResource, createSignal, useTransition } from "solid-js";
import { emptyString, maxItemsToFetch } from "../library";
import { setErrorStore } from "../stores/error-store";

interface Identifiable {
	_id: string;
}

interface ListState<T> {
	key: string;
	items: T[];
	done: boolean;
}

export interface InfiniteList<T> {
	items: Accessor<T[]>;
	hasMore: Accessor<boolean>;
	loadingMore: Accessor<boolean>;
	loadMore: () => void;
}

/**
 * Drives a paginated "load more" list with `createResource` so the initial page
 * integrates with `<Suspense>` while subsequent pages append without flashing
 * the fallback. The list resets automatically whenever `key` changes, which
 * keeps the data in sync with route params instead of going stale on navigation.
 *
 * `fetchPage` receives the current `key` and the last accumulated item (or
 * `undefined` for a fresh page) and should return the next page, or `null` to
 * signal an already-reported error (the current items are then preserved).
 */
export const createInfiniteList = <T extends Identifiable>(key: Accessor<string | undefined>, fetchPage: (key: string, lastItem: T | undefined) => Promise<T[] | null>, cursorOf: (item: T) => string = item => item._id): InfiniteList<T> => {
	const [cursor, setCursor] = createSignal(emptyString);
	// A dedicated flag rather than the transition's pending accessor, which is global and
	// would also report true during unrelated route navigations.
	const [loadingMore, setLoadingMore] = createSignal(false);
	const [, startLoadMore] = useTransition();
	const source = createMemo(() => ({ key: key(), cursor: cursor() }));
	const [page] = createResource(source, async ({ key, cursor }, info): Promise<ListState<T>> => {
		if (!key) {
			return { key: emptyString, items: [], done: true };
		}
		const append = info.value?.key === key && Boolean(cursor);
		let fetched: T[] | null;
		try {
			fetched = await fetchPage(key, append ? info.value!.items.at(-1) : undefined);
		} catch (err: any) {
			setErrorStore("message", err?.message);
			fetched = null;
		}
		if (fetched === null) {
			return info.value ?? { key, items: [], done: false };
		}
		return {
			key,
			items: (append ? info.value!.items : []).concat(fetched),
			done: fetched.length < maxItemsToFetch
		};
	});
	const items = createMemo(() => page()?.items ?? []);
	const hasMore = createMemo(() => !(page()?.done ?? false));
	// Clear the load-more flag once the page request settles (success or error).
	createEffect(() => {
		if (!page.loading) {
			setLoadingMore(false);
		}
	});
	const loadMore = () => {
		const lastItem = items().at(-1);
		if (lastItem && !loadingMore()) {
			setLoadingMore(true);
			startLoadMore(() => setCursor(cursorOf(lastItem)));
		}
	};
	return { items, hasMore, loadingMore, loadMore };
};

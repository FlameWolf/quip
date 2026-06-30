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

export const createInfiniteList = <T extends Identifiable>(key: Accessor<string | undefined>, fetchPage: (key: string, lastItem: T | undefined) => Promise<T[] | null>, cursorOf: (item: T) => string = item => item._id): InfiniteList<T> => {
	const [cursor, setCursor] = createSignal(emptyString);
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
	return {
		items,
		hasMore,
		loadingMore,
		loadMore
	};
};
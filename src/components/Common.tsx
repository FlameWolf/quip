import { JSX, Show } from "solid-js";

export const Spinner = (props: { message?: string }) => (
	<div class="text-center mt-4">
		<div class="spinner-border" role="status">
			<span class="visually-hidden">{props.message || "Loading..."}</span>
		</div>
		<Show when={props.message}>
			<p class="mt-2">{props.message}</p>
		</Show>
	</div>
);

export const EmptyState = (props: { children?: JSX.Element }) => (
	<div class="d-flex justify-content-center align-items-center text-info border border-info rounded p-3">
		<div>{props.children || "No posts to display."}</div>
	</div>
);

export const LoadMore = (props: { hasMore: boolean; loading?: boolean; doneLabel?: string; onClick: () => void }) => (
	<div class="my-2">
		<button class="btn btn-primary form-control" disabled={!props.hasMore || props.loading} onClick={() => props.onClick()}>{props.loading ? "Loading…" : props.hasMore ? "Load More" : props.doneLabel || "No More Posts"}</button>
	</div>
);
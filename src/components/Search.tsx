import { createMemo, For, Show, Suspense } from "solid-js";
import { useSearchParams, A, SearchParams } from "@solidjs/router";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage } from "../library";
import { createInfiniteList } from "../hooks/createInfiniteList";
import type { Post, User } from "../types";
import type { SearchProps } from "../types/SearchProps";
import DisplayPost from "./DisplayPost";
import { LoadMore, Spinner } from "./Common";

type SearchResult = Post | User;

/*
Post Search Parmeters:
----------------------
q *	string	(query)
from	string	(query)
since	string	(query)
until	string	(query)
has-media	string	(query)
not-from	string	(query)
sort-by	string	(query) [match, date, popular]
date-order	string	(query) [desc, asc]
replies	string	(query) [exclude, only]
langs	string	(query)
langs-match	string	(query) [any, all]
media-desc	string	(query)
lastScore	integer	(query)
lastPostId	string	(query)

Nearby Search Parameters:
----------------------
long *	number($float)	(query)
lat *	number($float)	(query)
max-dist	integer	(query)
lastDistance	number($double)	(query)
lastPostId	string	(query)

User Search Parameters:
----------------------
q *	string	(query)
match	string	(query) [exact, contains, startsWith, endsWith]
date-order	string	(query) [desc, asc]
lastUserId	string	(query)
*/

const searchUrl = `${import.meta.env.VITE_API_BASE_URL}/search`;
const parseQueryTokens = (query: Partial<SearchParams>) => {
	const tokens: Record<string, string> = {};
	const searchText: string[] = [];
	for (const part of (query?.q as string)?.split(/\s+/) ?? []) {
		const match = part.match(/^([a-z-]+):(.+)$/);
		if (match) {
			tokens[match[1]] = match[2];
		} else {
			searchText.push(part);
		}
	}
	return { searchText: searchText.join(" ").trim(), tokens };
};

export default (props: SearchProps) => {
	const [searchParams] = useSearchParams();
	const isUserSearch = createMemo(() => parseQueryTokens(searchParams).tokens.users === "1");
	const searchType = createMemo(() => {
		const { tokens } = parseQueryTokens(searchParams);
		if (tokens.nearby === "1") {
			return "/nearby";
		}
		if (tokens.users === "1") {
			return "/users";
		}
		return emptyString;
	});
	const buildSearchUrl = (lastItem: SearchResult | undefined) => {
		const { searchText, tokens } = parseQueryTokens(searchParams);
		const params = new URLSearchParams();
		if (searchText) {
			params.append("q", searchText);
		}
		for (const [key, value] of Object.entries(tokens)) {
			if (!["nearby", "users"].includes(key)) {
				params.append(key, value);
			}
		}
		if (lastItem) {
			params.append(isUserSearch() ? "lastUserId" : "lastPostId", lastItem._id);
			const score = (lastItem as Post).score;
			if (!isUserSearch() && score) {
				const sortBy = tokens["sort-by"] || emptyString;
				if (!sortBy || sortBy === "match" || sortBy === "popular") {
					params.append("lastScore", String(score));
				}
			}
		}
		return `${searchUrl}${searchType()}?${params}`;
	};
	const list = createInfiniteList<SearchResult>(
		() => searchParams["q"] as string | undefined,
		async (_query, lastItem) => {
			const response = await fetch(buildSearchUrl(lastItem));
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return null;
			}
			const data = await response.json();
			return (isUserSearch() ? data.users : data.posts) as SearchResult[];
		}
	);
	const isUserResult = createMemo(() => {
		const first = list.items()[0];
		return first ? !("content" in first) : isUserSearch();
	});
	return (
		<>
			<div class="alert alert-info">
				<p>Use the following syntax to refine your search:</p>
				<ul>
					<li>
						<code>hello world has-media:1</code> - Search for posts containing "hello world" that have media attachments.
					</li>
					<li>
						<code>ma users:1 match:contains</code> - Search for users with handles containing the string "ma".
					</li>
					<li>
						<code>langs:ml|en</code> - Search for posts written in Malayalam or English.
					</li>
				</ul>
			</div>
			<h2>Search Results</h2>
			<Suspense fallback={<Spinner/>}>
				<Show when={list.items().length} fallback={<p>No results found. Try a different search.</p>}>
					<Show when={!isUserResult()}>
						<For each={list.items() as Post[]}>{result => <DisplayPost post={result}/>}</For>
					</Show>
					<Show when={isUserResult()}>
						<ul class="list-group">
							<For each={list.items() as User[]}>
								{result => (
									<li class="list-group-item">
										<h3>
											<A href={`/${result.handle}`}>{result.handle}</A>
										</h3>
										<div class="d-flex gap-2">
											{result.protected && <div class="badge text-bg-info">Protected</div>}
											{result.deactivated && <div class="badge text-bg-info">Deactivated</div>}
											{result.self && <div class="badge text-bg-info">This is you</div>}
											{(result.following ?? 0) > 0 && <div class="badge text-bg-info">Following: {result.following}</div>}
											{(result.followers ?? 0) > 0 && <div class="badge text-bg-info">Followers: {result.followers}</div>}
											{result.blockedByMe && <div class="badge text-bg-info">Blocked by you</div>}
											{result.blockedMe && <div class="badge text-bg-info">Blocked you</div>}
											{result.requestedToFollowByMe && <div class="badge text-bg-info">Follow requested by you</div>}
											{result.requestedToFollowMe && <div class="badge text-bg-info">Follow requested you</div>}
											{result.followedByMe && <div class="badge text-bg-info">Followed by you</div>}
											{result.followedMe && <div class="badge text-bg-info">Followed you</div>}
											{result.mutedByMe && <div class="badge text-bg-info">Muted by you</div>}
										</div>
										<p>{result.postsCount} {result.postsCount === 1 ? "post" : "posts"}</p>
									</li>
								)}
							</For>
						</ul>
					</Show>
					<LoadMore hasMore={list.hasMore()} loading={list.loadingMore()} doneLabel="No More Results" onClick={list.loadMore}/>
				</Show>
			</Suspense>
		</>
	);
};
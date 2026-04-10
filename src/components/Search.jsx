import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { useSearchParams, A } from "@solidjs/router";
import { emptyString, maxItemsToFetch } from "../library";
import DisplayPost from "./DisplayPost";

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

Sample Result:
----------------------
{
  "posts": [
    {
      "_id": "632ddac1bf1aee2eacdce984",
      "content": "test",
      "author": {
        "_id": "624d96f871a9268f6c3cea1d",
        "handle": "ulkka"
      },
      "languages": [
        "xx"
      ],
      "createdAt": "2022-09-23T16:11:45.058Z",
      "__v": 0
    },
    {
      "_id": "64898a473d63631be6226d80",
      "content": "Test quip.",
      "author": {
        "_id": "62540ed99bea74f5ec60901c",
        "handle": "manthri"
      },
      "languages": [
        "xx"
      ],
      "createdAt": "2023-06-14T09:37:11.152Z",
      "__v": 0
    }
  ]
}

Nearby Search Parameters:
----------------------
long *	number($float)	(query)
lat *	number($float)	(query)
max-dist	integer	(query)
lastDistance	number($double)	(query)
lastPostId	string	(query)

Sample Result:
----------------------
{
  "posts": [
    {
      "_id": "62de381dab4bee4d0e7c8a3e",
      "content": "Test.",
      "author": {
        "_id": "624d96f871a9268f6c3cea1d",
        "handle": "ulkka"
      },
      "languages": [
        "xx"
      ],
      "location": {
        "type": "Point",
        "coordinates": [
          180,
          90
        ]
      },
      "createdAt": "2022-07-25T06:28:45.386Z",
      "__v": 0,
      "distance": 5.523154322275599e-10
    },
    {
      "_id": "62de234ce82b01e65b1d9584",
      "content": "asdf",
      "author": {
        "_id": "624d96f871a9268f6c3cea1d",
        "handle": "ulkka"
      },
      "languages": [
        "xx"
      ],
      "location": {
        "type": "Point",
        "coordinates": [
          180,
          90
        ]
      },
      "createdAt": "2022-07-25T04:59:56.089Z",
      "__v": 0,
      "distance": 5.523154322275599e-10
    }
  ]
}

User Search Parameters:
----------------------
q *	string	(query)
match	string	(query) [exact, contains, startsWith, endsWith]
date-order	string	(query) [desc, asc]
lastUserId	string	(query)

Sample Result:
----------------------
{
  "users": [
    {
      "_id": "624d973c71a9268f6c3cea36",
      "handle": "Unicorn",
      "protected": false,
      "deactivated": false,
      "postsCount": 13,
      "blockedByMe": false,
      "blockedMe": false,
      "requestedToFollowByMe": false,
      "requestedToFollowMe": false,
      "followedByMe": true,
      "followedMe": true,
      "mutedByMe": false
    },
    {
      "_id": "624d96f871a9268f6c3cea1d",
      "handle": "ulkka",
      "protected": false,
      "deactivated": false,
      "postsCount": 130,
      "self": true,
      "following": 14,
      "followers": 17
    }
  ]
}
*/

export default props => {
	let loadMoreButton;
	const [searchParams] = useSearchParams();
	const [isUserSearch, setIsUserSearch] = createSignal(false);
	const [lastScore, setLastScore] = createSignal();
	const [lastItemId, setLastItemId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const [searchResults, setSearchResults] = createSignal([]);
	const searchUrl = `${import.meta.env.VITE_API_BASE_URL}/search`;
	const parseQueryTokens = query => {
		const tokens = {};
		const parts = query?.q?.split(/\s+/);
		let searchText = [];
		for (const part of parts) {
			const match = part.match(/^([a-z-]+):(.+)$/);
			if (match) {
				const [, key, value] = match;
				tokens[key] = value;
			} else {
				searchText.push(part);
			}
		}
		return {
			searchText: searchText.join(" "),
			tokens
		};
	};
	const searchType = createMemo(() => {
		const { tokens } = parseQueryTokens(searchParams);
		if (tokens.nearby === "1") {
			return "/nearby";
		}
		if (tokens.users === "1") {
			setIsUserSearch(true);
			return "/users";
		}
		setIsUserSearch(false);
		return emptyString;
	});
	const buildSearchUrl = (includeLastItem = false) => {
		const { searchText, tokens } = parseQueryTokens(searchParams);
		const params = new URLSearchParams();
		if (searchText.trim()) {
			params.append("q", searchText.trim());
		}
		for (const [key, value] of Object.entries(tokens)) {
			if (!["nearby", "users"].includes(key)) {
				params.append(key, value);
			}
		}
		if (includeLastItem && lastItemId()) {
			const lastItemIdParamName = isUserSearch() ? "lastUserId" : "lastPostId";
			params.append(lastItemIdParamName, lastItemId());
			if (!isUserSearch() && lastScore()) {
				const sortBy = tokens["sort-by"] || "";
				if (!sortBy || sortBy === "match" || sortBy === "popular") {
					params.append("lastScore", lastScore());
				}
			}
		}
		return `${searchUrl}${searchType()}?${params.toString()}`;
	};
	const loadSearchResults = async (isLoadMore = false) => {
		if (isLoadMore) {
			await fetchAndAppendResults();
		} else {
			setSearchResults([]);
			setLastItemId(emptyString);
			setLastScore(undefined);
			setHasMore(true);
			await fetchAndAppendResults();
		}
	};
	const fetchAndAppendResults = async () => {
		const url = buildSearchUrl(lastItemId() !== emptyString);
		const response = await fetch(url);
		if (response.ok) {
			const data = await response.json();
			const items = isUserSearch() ? data.users : data.posts;
			const itemCount = items.length;
			if (itemCount) {
				const lastItem = items[itemCount - 1];
				setLastItemId(lastItem._id);
				if (!isUserSearch()) {
					setLastScore(lastItem.score || 0);
				}
			}
			if (itemCount < maxItemsToFetch) {
				setHasMore(false);
			}
			setSearchResults(searchResults().concat(items));
		} else {
			console.error("Search request failed:", response.statusText);
		}
	};
	const handleLoadMore = async () => {
		await loadSearchResults(true);
	};
	onMount(async () => {
		await loadSearchResults(false);
	});
	return (
		<>
			<div class="alert alert-info">
				<p>Use the following syntax to refine your search:</p>
				<ul>
					<li><code>hello world has-media:1</code> - Search for posts containing "hello world" that have media attachments.</li>
					<li><code>ma users:1 match:contains</code> - Search for users with handles containing the string "ma".</li>
					<li><code>langs:ml|en</code> - Search for posts written in Malayalam or English.</li>
				</ul>
			</div>
			<h2>Search Results</h2>
			<Show when={searchResults().length === 0}>
				<p>No results found. Try a different search.</p>
			</Show>
			<Show when={!isUserSearch() && searchResults().length > 0}>
				<For each={searchResults()}>{(result) => <DisplayPost post={result}/>}</For>
			</Show>
			<Show when={isUserSearch() && searchResults().length > 0}>
				<ul class="list-group">
					<For each={searchResults()}>
						{result => (
							<li class="list-group-item">
								<h3><A href={`/${result.handle}`}>{result.handle}</A></h3>
								<div class="d-flex gap-2">
									{result.protected && <div class="badge text-bg-info">Protected</div>}
									{result.deactivated && <div class="badge text-bg-info">Deactivated</div>}
									{result.self && <div class="badge text-bg-info">This is you</div>}
									{result.following > 0 && <div class="badge text-bg-info">Following: {result.following}</div>}
									{result.followers > 0 && <div class="badge text-bg-info">Followers: {result.followers}</div>}
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
			<Show when={searchResults().length > 0}>
				<div class="my-2">
					<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Results"} onClick={handleLoadMore} disabled={!hasMore()}></button>
				</div>
			</Show>
		</>
	);
};
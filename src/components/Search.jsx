import { createMemo, createSignal, For, Match, onMount, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { emptyString, maxItemsToFetch, trimPost } from "../library";
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
      "_id": "64c4bd1d9cb68fb4fbf71ac2",
      "handle": "maarakan",
      "protected": false,
      "deactivated": false,
      "postsCount": 0
    },
    {
      "_id": "624d970471a9268f6c3cea22",
      "handle": "maayan",
      "protected": false,
      "deactivated": false,
      "postsCount": 8
    }
  ]
}
*/

export default props => {
	let loadMoreButton;
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isUserSearch, setIsUserSearch] = createSignal(false);
	const [searchResults, setSearchResults] = createSignal([]);
	const [lastScore, setLastScore] = createSignal();
	const [lastItemId, setLastItemId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);

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
			setSearchResults([...searchResults(), ...items]);
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
			<h2>Search Results</h2>
			<Show when={searchResults().length === 0}>
				<p>No results found. Try a different search.</p>
			</Show>
			<Show when={!isUserSearch() && searchResults().length > 0}>
				<For each={searchResults()}>{(result, index) => <DisplayPost post={result}/>}</For>
			</Show>
			<Show when={isUserSearch() && searchResults().length > 0}>
				<For each={searchResults()}>
					{result => (
						<div class="search-result" onClick={() => navigate(`/${result.handle}`)}>
							<h3>{result.handle}</h3>
							<p>
								{result.postsCount} {result.postsCount === 1 ? "post" : "posts"}
							</p>
						</div>
					)}
				</For>
			</Show>
			<Show when={searchResults().length > 0}>
				<div class="my-2">
					<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Results"} onClick={handleLoadMore} disabled={!hasMore()}></button>
				</div>
			</Show>
		</>
	);
};

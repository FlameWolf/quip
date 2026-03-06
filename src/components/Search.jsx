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
	const searchType = createMemo(() => {
		if (searchParams.nearby === "1") {
			return "/nearby";
		}
		if (searchParams.user === "1") {
			setIsUserSearch(true);
			return "/users";
		}
		return emptyString;
	});
	const searchUrl = `${import.meta.env.VITE_API_BASE_URL}/search${searchType()}`;
	const [lastItemId, setLastItemId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const [searchResults, setSearchResults] = createSignal([]);

	const loadSearchResults = async () => {
		const query = searchParams.q || emptyString;
		const tokens = query
			.split(" ")
			.filter(token => !["users:1", "nearby:1"].includes(token) && !token.startsWith("lat:") && !token.startsWith("long:"))
			.join(" ");
		const lastItemIdParamName = isUserSearch() ? "lastUserId" : "lastPostId";
		const response = await fetch(`${searchUrl}${searchType()}?$q=${tokens}&${lastItemIdParamName}=${lastItemId()}`);
		if (response.ok) {
			const data = await response.json();
			const items = isUserSearch() ? data.users : data.posts;
			const itemCount = items.length;
			if (itemCount) {
				setLastItemId(items[itemCount - 1]._id);
			}
			if (itemCount < maxItemsToFetch) {
				setHasMore(false);
			}
			setSearchResults([...searchResults(), ...items]);
		} else {
			console.error("Search request failed:", response.statusText);
		}
	};

	onMount(async () => {
		await loadSearchResults();
	});

	return (
		<>
			<h2>Search Results</h2>
			<Show when={!isUserSearch()}>
				<For each={searchResults()}>{(result, index) => <DisplayPost post={result}/>}</For>
			</Show>
			<Show when={isUserSearch()}>
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
			<div class="my-2">
				<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Results"} onClick={loadSearchResults}></button>
			</div>
		</>
	);
};
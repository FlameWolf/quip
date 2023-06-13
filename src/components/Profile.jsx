import { useParams } from "@solidjs/router";
import { createSignal, For, onMount, Show, Suspense } from "solid-js";
import { maxPostsToFetch } from "../library";
import DisplayPost from "./DisplayPost";

export default props => {
	let loadMoreButton;
	const params = useParams();
	const [profileUser, setProfileUser] = createSignal("");
	const [lastPostId, setLastPostId] = createSignal("");
	const [hasMore, setHasMore] = createSignal(true);
	const [loadedQuips, setLoadedQuips] = createSignal([]);

	const loadUser = async handle => {
		const data = await (await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${params.handle}`)).json();
		setProfileUser(data.user);
	};

	const loadUserQuips = async handle => {
		const data = await (await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${params.handle}/posts?lastPostId=${lastPostId()}`)).json();
		const posts = data.posts;
		const postsCount = posts.length;
		if(postsCount) {
			setLastPostId(posts[postsCount - 1]._id);
		}
		if(postsCount < maxPostsToFetch) {
			setHasMore(false);
		}
		setLoadedQuips([...loadedQuips(), ...posts]);
	};

	onMount(async () => {
		await loadUser();
		await loadUserQuips();
	});

	return (
		<>
			<div class="card mb-2">
				<div class="card-header">
					<div class="card-title">@{profileUser().handle}</div>
				</div>
				<div class="card-body">
					<p>{profileUser().postsCount} Quips</p>
				</div>
			</div>
			<ul class="list-group">
				<For each={loadedQuips()}>
				{
					(quip, index) => <DisplayPost post={quip}/>
				}
				</For>
				<li class="list-group-item">
					<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} onClick={loadUserQuips}></button>
				</li>
			</ul>
		</>
	);
};
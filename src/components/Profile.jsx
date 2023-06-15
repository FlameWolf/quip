import { useParams } from "@solidjs/router";
import { createSignal, For, onMount, Show } from "solid-js";
import { BsPersonBadgeFill } from "solid-icons/bs";
import { authStore } from "../stores/auth-store";
import { maxPostsToFetch } from "../library";
import DisplayPost from "./DisplayPost";

export default props => {
	let loadMoreButton;
	const params = useParams();
	const [profileUser, setProfileUser] = createSignal("");
	const [isSelf, setIsSelf] = createSignal(true);
	const [followed, setFollowed] = createSignal(false);
	const [muted, setMuted] = createSignal(false);
	const [blocked, setBlocked] = createSignal(false);
	const [followsMe, setFollowsMe] = createSignal(false);
	const [lastPostId, setLastPostId] = createSignal("");
	const [hasMore, setHasMore] = createSignal(true);
	const [loadedQuips, setLoadedQuips] = createSignal([]);
	const loadUser = async handle => {
		const data = await (await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${params.handle}`)).json();
		const user = data.user;
		setProfileUser(user);
		if(authStore.userId) {
			setIsSelf(user.self);
			setFollowed(user.followedByMe);
			setMuted(user.mutedByMe);
			setBlocked(user.setBlocked);
			setFollowsMe(user.followedMe);
		}
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
					<div class="card-title mb-0">
						<span class="handle me-2">{profileUser().handle}</span>
						<Show when={profileUser().self}>
							<span>&#xA0;</span>
							<BsPersonBadgeFill color="var(--bs-primary)"/>
						</Show>
						<Show when={authStore.userId && !isSelf()}>
							<div class="hstack gap-2 d-sm-inline-flex flex-wrap">
								<Show when={followsMe()}>
									<div class="badge bg-secondary">Follows you</div>
								</Show>
								<button class="btn btn-sm btn-primary">{followed() ? "Unflollow" : "Follow"}</button>
								<button class="btn btn-sm btn-primary">{muted() ? "Unmute" : "Mute"}</button>
								<button class="btn btn-sm btn-danger">{blocked() ? "Unblock": "Block"}</button>
							</div>
						</Show>
					</div>
				</div>
				<div class="card-body">
					<div class="py-2">{profileUser().postsCount} Quips</div>
				</div>
			</div>
			<ul class="list-group">
				<For each={loadedQuips()}>
				{
					(quip, index) => <DisplayPost post={quip}/>
				}
				</For>
			</ul>
			<div class="my-2">
				<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} onClick={loadUserQuips}></button>
			</div>
		</>
	);
};
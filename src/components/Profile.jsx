import { useParams } from "@solidjs/router";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import { BsPersonBadgeFill } from "solid-icons/bs";
import { authStore } from "../stores/auth-store";
import { emptyString, maxItemsToFetch } from "../library";
import { quipStore, setQuipStore } from "../stores/quip-store";
import DisplayPost from "./DisplayPost";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default props => {
	let loadMoreButton;
	const params = useParams();
	const profileUrl = `${profileBaseUrl}/${params.handle}`;
	const [profileUser, setProfileUser] = createSignal(emptyString);
	const [isSelf, setIsSelf] = createSignal(true);
	const [followed, setFollowed] = createSignal(false);
	const [muted, setMuted] = createSignal(false);
	const [blocked, setBlocked] = createSignal(false);
	const [followsMe, setFollowsMe] = createSignal(false);
	const [lastPostId, setLastPostId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const loadUser = async handle => {
		const data = await (await fetch(profileUrl)).json();
		const user = data.user;
		setProfileUser(user);
		if (authStore.userId) {
			setIsSelf(user.self);
			setFollowed(user.followedByMe);
			setMuted(user.mutedByMe);
			setBlocked(user.blockedByMe);
			setFollowsMe(user.followedMe);
		}
	};
	const loadUserQuips = async handle => {
		const data = await (await fetch(`${profileUrl}/posts?lastPostId=${lastPostId()}`)).json();
		const posts = data.posts;
		const postsCount = posts.length;
		if (postsCount) {
			setLastPostId(posts[postsCount - 1]._id);
		}
		if (postsCount < maxItemsToFetch) {
			setHasMore(false);
		}
		setQuipStore("quips", [...quipStore.quips, ...posts]);
	};
	const toggleAction = async (action, flag, setFlag) => {
		const actionUrl = `${profileBaseUrl}/${flag ? `un${action}` : action}/${params.handle}`;
		const response = await fetch(actionUrl);
		if (response.status === 200) {
			setFlag(!flag);
		}
	};
	createEffect(() => {
		if (blocked() && followsMe()) {
			setFollowsMe(false);
		}
	});
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
								<button class="btn btn-sm btn-primary" onClick={() => toggleAction("follow", followed(), setFollowed)}>
									{followed() ? "Unflollow" : "Follow"}
								</button>
								<button class="btn btn-sm btn-primary" onClick={() => toggleAction("mute", muted(), setMuted)}>
									{muted() ? "Unmute" : "Mute"}
								</button>
								<button class="btn btn-sm btn-danger" onClick={() => toggleAction("block", blocked(), setBlocked)}>
									{blocked() ? "Unblock" : "Block"}
								</button>
							</div>
						</Show>
					</div>
				</div>
				<div class="card-body">
					<div class="py-2">{profileUser().postsCount} Quips</div>
				</div>
			</div>
			<ul class="list-group">
				<For each={quipStore.quips}>{(quip, index) => <DisplayPost post={quip}/>}</For>
			</ul>
			<div class="my-2">
				<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} onClick={loadUserQuips}></button>
			</div>
		</>
	);
};
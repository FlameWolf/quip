import { useParams } from "@solidjs/router";
import { createEffect, createSignal, onMount, Show } from "solid-js";
import { BsPersonBadgeFill } from "solid-icons/bs";
import { authStore } from "../stores/auth-store";
import { emptyString, maxItemsToFetch } from "../library";
import { Dropdown } from "bootstrap";
import DisplayPostList from "./DisplayPostList";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default props => {
	let muteButton;
	let muteMenuToggle;
	let blockButton;
	let blockMenuToggle;
	let loadMoreButton;
	const params = useParams();
	const profileUrl = `${profileBaseUrl}/${params.handle}`;
	const [profileUser, setProfileUser] = createSignal(emptyString);
	const [isSelf, setIsSelf] = createSignal(true);
	const [followed, setFollowed] = createSignal(false);
	const [muted, setMuted] = createSignal(false);
	const [mutedReason, setMutedReason] = createSignal(emptyString);
	const [blocked, setBlocked] = createSignal(false);
	const [blockedReason, setBlockedReason] = createSignal(emptyString);
	const [followsMe, setFollowsMe] = createSignal(false);
	const [followingCount, setFollowingCount] = createSignal(0);
	const [followerCount, setFollowerCount] = createSignal(0);
	const [actionReason, setActionReason] = createSignal(emptyString);
	const [actionTrigger, setActionTrigger] = createSignal(null);
	const [showMutedReason, setShowMutedReason] = createSignal(false);
	const [showBlockedReason, setShowBlockedReason] = createSignal(false);
	const [lastPostId, setLastPostId] = createSignal(emptyString);
	const [hasMore, setHasMore] = createSignal(true);
	const [userPosts, setUserPosts] = createSignal([]);
	const loadUser = async handle => {
		const data = await (await fetch(profileUrl)).json();
		const user = data.user;
		setProfileUser(user);
		if (authStore.userId) {
			setIsSelf(user.self);
			setFollowed(user.followedByMe);
			setMuted(user.mutedByMe);
			setMutedReason(user.mutedReason);
			setBlocked(user.blockedByMe);
			setBlockedReason(user.blockedReason);
			setFollowsMe(user.followedMe);
			setFollowingCount(user.following);
			setFollowerCount(user.followers);
		}
	};
	const loadUserQuips = async handle => {
		const data = await (await fetch(`${profileUrl}/posts?includeRepeats=true&includeReplies=true&lastPostId=${lastPostId()}`)).json();
		const posts = data.posts;
		const postsCount = posts.length;
		if (postsCount) {
			setLastPostId(posts[postsCount - 1]._id);
		}
		if (postsCount < maxItemsToFetch) {
			setHasMore(false);
		}
		setUserPosts([...userPosts(), ...posts]);
	};
	const toggleAction = async (action, flag, setFlag) => {
		const actionUrl = `${profileBaseUrl}/${flag ? `un${action}` : action}/${params.handle}${actionReason() ? `?reason=${actionReason()}` : emptyString}`;
		const response = await fetch(actionUrl);
		if (response.status === 200) {
			setFlag(!flag);
			switch (action) {
				case "mute":
					setMutedReason(flag ? emptyString: actionReason());
					break;
				case "block":
					setBlockedReason(flag ? emptyString: actionReason());
					break;
				default:
					break;
			}
			setActionReason(emptyString);
			setActionTrigger(null);
		}
	};
	createEffect(() => {
		if (blocked()) {
			setFollowsMe(false);
			setFollowed(false);
		}
	});
	createEffect(() => {
		if (!muted()) {
			setShowMutedReason(false);
		}
		if (!blocked()) {
			setShowBlockedReason(false);
		}
	});
	onMount(async () => {
		await loadUser();
		await loadUserQuips();
		if (!isSelf()) {
			new Dropdown(muteMenuToggle);
			new Dropdown(blockMenuToggle);
		}
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
								<button class="btn btn-sm btn-primary" onClick={() => toggleAction("follow", followed(), setFollowed)}>{followed() ? "Unflollow" : "Follow"}</button>
								<div class="btn-group">
									<button ref={muteButton} class="btn btn-sm btn-primary" onClick={() => toggleAction("mute", muted(), setMuted)}>{muted() ? "Unmute" : "Mute"}</button>
									<Show when={!isSelf() && !muted()}>
										<div class="btn-group dropdown">
											<button ref={muteMenuToggle} type="button" class="btn btn-sm btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
												<span class="visually-hidden">Toggle Dropdown</span>
											</button>
											<ul class="dropdown-menu">
												<li>
													<a class="dropdown-item" role="button" onClick={() => setActionTrigger(muteButton)}>Specify a reason</a>
												</li>
											</ul>
										</div>
									</Show>
								</div>
								<Show when={muted() && mutedReason()}>
									<a class="bi bi-info-circle" role="button" onClick={() => setShowMutedReason(!showMutedReason())}></a>
								</Show>
								<div class="btn-group">
									<button ref={blockButton} class="btn btn-sm btn-danger" onClick={() => toggleAction("block", blocked(), setBlocked)}>{blocked() ? "Unblock" : "Block"}</button>
									<Show when={!isSelf() && !blocked()}>
										<div class="btn-group dropdown">
											<button ref={blockMenuToggle} type="button" class="btn btn-sm btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
												<span class="visually-hidden">Toggle Dropdown</span>
											</button>
											<ul class="dropdown-menu">
												<li>
													<a class="dropdown-item" role="button" onClick={() => setActionTrigger(blockButton)}>Specify a reason</a>
												</li>
											</ul>
										</div>
									</Show>
								</div>
								<Show when={blocked() && blockedReason()}>
									<a class="bi bi-info-circle" role="button" onClick={() => setShowBlockedReason(!showBlockedReason())}></a>
								</Show>
							</div>
						</Show>
					</div>
				</div>
				<Show when={showMutedReason()}>
					<div class="alert alert-info m-2">
						<span>Mute reason:</span>
						<span>&#xA0;</span>
						<span>{mutedReason()}</span>
					</div>
				</Show>
				<Show when={showBlockedReason()}>
					<div class="alert alert-info m-2">
						<span>Block reason:</span>
						<span>&#xA0;</span>
						<span>{blockedReason()}</span>
					</div>
				</Show>
				<div class="card-body">
					<div class="py-2">
						<span class="badge text-bg-info">{profileUser().postsCount} Quips</span>
						<Show when={isSelf()}>
							<span>&#xA0;</span>
							<span class="badge text-bg-info">{followingCount()} Following</span>
							<span>&#xA0;</span>
							<span class="badge text-bg-info">{followerCount()} Followers</span>
						</Show>
					</div>
				</div>
			</div>
			<Show when={actionTrigger()}>
				<div class="modal d-block open">
					<div class="modal-dialog modal-dialog-centered">
						<div class="modal-content">
							<div class="modal-header">
								<p class="modal-title">Specify reason</p>
								<button type="button" class="btn-close" onClick={() => setActionTrigger(null)}></button>
							</div>
							<div class="modal-body">
								<input type="text" class="form-control" placeholder="Reason for action" value={actionReason()} onInput={e => setActionReason(e.target.value)}/>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-secondary" onClick={() => setActionTrigger(null)}>Cancel</button>
								<button type="button" class="btn btn-primary" onClick={() => actionTrigger().click()}>Confirm</button>
							</div>
						</div>
					</div>
				</div>
			</Show>
			<DisplayPostList posts={userPosts()}/>
			<div class="my-2">
				<button ref={loadMoreButton} class="btn btn-primary form-control" innerHTML={hasMore() ? "Load More" : "No More Posts"} onClick={loadUserQuips}></button>
			</div>
		</>
	);
};
import { useParams, A } from "@solidjs/router";
import { createEffect, createResource, createSignal, Setter, Show, Suspense } from "solid-js";
import { BsPersonBadgeFill } from "solid-icons/bs";
import { authStore } from "../stores/auth-store";
import { setErrorStore } from "../stores/error-store";
import { emptyString, getErrorMessage } from "../library";
import { Dropdown, ButtonGroup, Modal } from "solid-bootstrap";
import { Spinner } from "./Common";
import type { User } from "../types";
import type { ProfileProps } from "../types/ProfileProps";

const profileBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/users`;

export default (props: ProfileProps) => {
	let muteButton!: HTMLButtonElement;
	let blockButton!: HTMLButtonElement;
	const params = useParams();
	const [isSelf, setIsSelf] = createSignal(false);
	const [followed, setFollowed] = createSignal(false);
	const [muted, setMuted] = createSignal(false);
	const [mutedReason, setMutedReason] = createSignal<string | undefined>(emptyString);
	const [blocked, setBlocked] = createSignal(false);
	const [blockedReason, setBlockedReason] = createSignal<string | undefined>(emptyString);
	const [followsMe, setFollowsMe] = createSignal(false);
	const [followingCount, setFollowingCount] = createSignal(0);
	const [followerCount, setFollowerCount] = createSignal(0);
	const [actionReason, setActionReason] = createSignal(emptyString);
	const [actionTrigger, setActionTrigger] = createSignal<HTMLButtonElement | null>(null);
	const [showMutedReason, setShowMutedReason] = createSignal(false);
	const [showBlockedReason, setShowBlockedReason] = createSignal(false);
	const [user] = createResource(
		() => params.handle,
		async handle => {
			try {
				const response = await fetch(`${profileBaseUrl}/${handle}`);
				if (!response.ok) {
					setErrorStore("message", await getErrorMessage(response));
					return null;
				}
				return (await response.json()).user as User;
			} catch (err: any) {
				setErrorStore("message", err.message);
				return null;
			}
		}
	);
	createEffect(() => {
		const profileUser = user();
		if (profileUser && authStore.userId) {
			setIsSelf(!!profileUser.self);
			setFollowed(!!profileUser.followedByMe);
			setMuted(!!profileUser.mutedByMe);
			setMutedReason(profileUser.mutedReason);
			setBlocked(!!profileUser.blockedByMe);
			setBlockedReason(profileUser.blockedReason);
			setFollowsMe(!!profileUser.followedMe);
			setFollowingCount(profileUser.following ?? 0);
			setFollowerCount(profileUser.followers ?? 0);
		}
	});
	const toggleAction = async (action: string, flag: boolean, setFlag: Setter<boolean>) => {
		const actionUrl = `${profileBaseUrl}/${flag ? `un${action}` : action}/${params.handle}${actionReason() ? `?reason=${encodeURIComponent(actionReason())}` : emptyString}`;
		try {
			const response = await fetch(actionUrl);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			setFlag(!flag);
			switch (action) {
				case "mute":
					setMutedReason(flag ? emptyString : actionReason());
					break;
				case "block":
					setBlockedReason(flag ? emptyString : actionReason());
					break;
				default:
					break;
			}
			setActionReason(emptyString);
			setActionTrigger(null);
		} catch (err: any) {
			setErrorStore("message", err.message);
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
	return (
		<>
			<Suspense fallback={<Spinner/>}>
				<div class="card mb-2">
					<div class="card-header">
						<div class="card-title mb-0">
							<span class="handle me-2">{user()?.handle}</span>
							<Show when={user()?.self}>
								<span>&#xA0;</span>
								<BsPersonBadgeFill color="var(--bs-primary)"/>
							</Show>
							<Show when={authStore.userId && !isSelf()}>
								<div class="hstack gap-2 d-sm-inline-flex flex-wrap">
									<Show when={followsMe()}>
										<div class="badge bg-secondary">Follows you</div>
									</Show>
									<button class="btn btn-sm btn-primary" onClick={() => toggleAction("follow", followed(), setFollowed)}>{followed() ? "Unfollow" : "Follow"}</button>
									<Dropdown as={ButtonGroup}>
										<button ref={muteButton} class="btn btn-sm btn-primary" onClick={() => toggleAction("mute", muted(), setMuted)}>{muted() ? "Unmute" : "Mute"}</button>
										<Show when={!isSelf() && !muted()}>
											<Dropdown.Toggle split={true} size="sm" variant="primary" id="mute-menu">
												<span class="visually-hidden">Toggle Dropdown</span>
											</Dropdown.Toggle>
											<Dropdown.Menu>
												<Dropdown.Item as="button" onClick={() => setActionTrigger(muteButton)}>Specify a reason</Dropdown.Item>
											</Dropdown.Menu>
										</Show>
									</Dropdown>
									<Show when={muted() && mutedReason()}>
										<a class="bi bi-info-circle" role="button" onClick={() => setShowMutedReason(!showMutedReason())}></a>
									</Show>
									<Dropdown as={ButtonGroup}>
										<button ref={blockButton} class="btn btn-sm btn-danger" onClick={() => toggleAction("block", blocked(), setBlocked)}>{blocked() ? "Unblock" : "Block"}</button>
										<Show when={!isSelf() && !blocked()}>
											<Dropdown.Toggle split={true} size="sm" variant="danger" id="block-menu">
												<span class="visually-hidden">Toggle Dropdown</span>
											</Dropdown.Toggle>
											<Dropdown.Menu>
												<Dropdown.Item as="button" onClick={() => setActionTrigger(blockButton)}>Specify a reason</Dropdown.Item>
											</Dropdown.Menu>
										</Show>
									</Dropdown>
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
						<div class="d-flex flex-wrap gap-2">
							<A class="badge text-bg-info" activeClass="text-decoration-none" href="posts">
								{user()?.postsCount} Quips
							</A>
							<Show when={isSelf()}>
								<A class="badge text-bg-info" activeClass="text-decoration-none" href="following">
									{followingCount()} Following
								</A>
								<A class="badge text-bg-info" activeClass="text-decoration-none" href="followers">
									{followerCount()} Followers
								</A>
								<A class="badge text-bg-info" activeClass="text-decoration-none" href="favourites">Favourites</A>
							</Show>
							<A class="badge text-bg-info" activeClass="text-decoration-none" href="mentions">Mentions</A>
						</div>
					</div>
				</div>
			</Suspense>
			<Modal centered={true} scrollable={true} fullscreen="sm-down" show={!!actionTrigger()} onHide={() => setActionTrigger(null)}>
				<Modal.Header closeButton={true}>
					<Modal.Title>Specify reason</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<input type="text" class="form-control" placeholder="Reason for action" value={actionReason()} onInput={e => setActionReason(e.target.value)}/>
				</Modal.Body>
				<Modal.Footer>
					<button type="button" class="btn btn-secondary" onClick={() => setActionTrigger(null)}>Cancel</button>
					<button type="button" class="btn btn-primary" onClick={() => actionTrigger()?.click()}>Confirm</button>
				</Modal.Footer>
			</Modal>
			<section>{props.children}</section>
		</>
	);
};
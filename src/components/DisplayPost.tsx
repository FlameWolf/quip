import { createMemo, createSignal, Show } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { BsChatRight, BsQuote, BsStar, BsStarFill } from "solid-icons/bs";
import { FiEdit3, FiRepeat, FiTrash } from "solid-icons/fi";
import { Modal } from "solid-bootstrap";
import { authStore } from "../stores/auth-store";
import { setErrorStore } from "../stores/error-store";
import { formatTimeAgo, getErrorMessage, nullId, parseContent, toLongDateString } from "../library";
import DisplayPoll from "./DisplayPoll";
import DisplayPostMinimal from "./DisplayPostMinimal";
import Editor from "./Editor";
import QuotePost from "./QuotePost";
import type { Post } from "../types";
import type { DisplayPostProps } from "../types/DisplayPostProps";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;
const favouriteUrl = `${postsBaseUrl}/favourite`;
const unfavouriteUrl = `${postsBaseUrl}/unfavourite`;
const repeatUrl = `${postsBaseUrl}/repeat`;
const unrepeatUrl = `${postsBaseUrl}/unrepeat`;
const deleteUrl = `${postsBaseUrl}/delete`;

export default (props: DisplayPostProps) => {
	const post = props.post;
	const postId = post._id;
	const createdAt = post.createdAt;
	const handle = post.author.handle;
	const repeatedBy = post.repeatedBy;
	const attachments = post.attachments;
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = createSignal(false);
	const [faveFlag, setFaveFlag] = createSignal(post.favourited);
	const [quoteFlag, setQuoteFlag] = createSignal(false);
	const [repeatFlag, setRepeatFlag] = createSignal(post.repeated);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const [confirmDelete, setConfirmDelete] = createSignal(false);
	const [isDeleted, setIsDeleted] = createSignal(false);
	const isOwnPost = createMemo(() => post.author._id === authStore.userId);
	const allowEdit = createMemo(() => isOwnPost() && !post.attachments?.poll && post.__v === 0);
	const toggleFave = async (event: Event) => {
		try {
			const response = await fetch(`${faveFlag() ? unfavouriteUrl : favouriteUrl}/${postId}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			setFaveFlag(value => !value);
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	const toggleRepeat = async (event: Event) => {
		try {
			const response = await fetch(`${repeatFlag() ? unrepeatUrl : repeatUrl}/${postId}`);
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			setRepeatFlag(value => !value);
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	const toggleReply = () => {
		setReplyFlag(!replyFlag());
	};
	const deletePost = async () => {
		try {
			const response = await fetch(`${deleteUrl}/${postId}`, { method: "DELETE" });
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			setIsDeleted(true);
		} catch (err: any) {
			setErrorStore("message", err.message);
		} finally {
			setConfirmDelete(false);
		}
	};
	return (
		<>
			<div data-post-id={postId} class="list-group-item p-0" classList={{ "has-reply": !!props.hasReplies, reply: !!props.isReply, "d-none": isDeleted() }}>
				<div class="post-header">
					<A class="handle" href={`/${handle}`}>{handle}</A>
					<Show when={props.parentBlurb || props.isReply}>
						<span>&#xA0;</span>
						<span>In reply to</span>
						<span>&#xA0;</span>
						<Show when={props.parentBlurb}>
							<em innerHTML={props.parentBlurb}/>
						</Show>
						<Show when={!props.parentBlurb}>
							<A class="link-secondary" href={`/post/${post.replyTo}`}>a post</A>
						</Show>
					</Show>
					<Show when={repeatedBy}>
						<span>&#xA0;</span>
						<span>
							Repeated by<span class="handle">{repeatedBy!.handle}</span>
						</span>
					</Show>
					<div class="ms-auto">
						<A class="link-secondary" title={toLongDateString(createdAt)} href={`/post/${post._id}`} target="_self">{formatTimeAgo(createdAt)}</A>
					</div>
				</div>
				<div class="card-body px-2">
					<Show when={!isEditing()}>
						<p class="card-text text-break" innerHTML={parseContent(post.content)}></p>
					</Show>
					<Show when={isEditing()}>
						<Editor post={post} isEditing={isEditing()} onSubmit={() => setIsEditing(false)}/>
					</Show>
					<Show when={attachments}>
						<Show when={attachments!.poll}>
							<DisplayPoll postId={post._id} poll={attachments!.poll!} voted={post.voted} isOwnPoll={post.author._id === authStore.userId}/>
						</Show>
						<Show when={attachments!.mediaFile}>
							<Show when={attachments!.mediaFile!.fileType === "image"}>
								<img class="img-fluid" alt={attachments!.mediaFile!.description} src={attachments!.mediaFile!.src}/>
							</Show>
							<Show when={attachments!.mediaFile!.fileType === "video"}>
								<video class="img-fluid" aria-label={attachments!.mediaFile!.description} src={attachments!.mediaFile!.src} controls={true}/>
							</Show>
						</Show>
						<Show when={typeof attachments!.post === "string"}>
							<Show when={attachments!.post !== nullId} fallback={<div class="text-bg-secondary border rounded p-3">The quoted post is not available.</div>}>
								<A href={`/post/${attachments!.post as string}`} innerHTML={`${globalThis.location.origin}/post/${attachments!.post as string}`} {...({ resolve: false } as any)}></A>
							</Show>
						</Show>
						<Show when={typeof attachments!.post === "object"}>
							<div onClick={() => navigate(`/post/${(attachments!.post as Post)._id}`, { resolve: false })} role="button">
								<DisplayPostMinimal post={attachments!.post as Post}/>
							</div>
						</Show>
					</Show>
				</div>
				<div class="action-bar">
					<div class="d-flex flex-wrap gap-2 justify-content-end mt-2">
						<Show when={allowEdit()}>
							<button class="btn bg-transparent border-0 py-2 px-3" onClick={() => setIsEditing(!isEditing())}>
								<FiEdit3 classList={{ "text-primary": isEditing() }} title="Edit"/>
							</button>
						</Show>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleFave} title={faveFlag() ? "Unfavourite" : "Favourite"}>{faveFlag() ? <BsStarFill color="gold"/> : <BsStar/>}</button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={() => setQuoteFlag(true)} title="Quote">
							<BsQuote/>
						</button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleRepeat} title={repeatFlag() ? "Unrepeat" : "Repeat"}>{repeatFlag() ? <FiRepeat color="green" class="stroke-3"/> : <FiRepeat/>}</button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleReply} title="Reply">{replyFlag() ? <BsChatRight color="blue"/> : <BsChatRight/>}</button>
						<Show when={isOwnPost()}>
							<button class="btn bg-transparent border-0 py-2 px-3" title="Delete">
								<FiTrash onClick={() => setConfirmDelete(true)}/>
							</button>
						</Show>
						<Show when={replyFlag()}>
							<Editor isReply={true} parentPostId={postId} classList={{ "mx-2": true, "mb-2": true }} onSubmit={toggleReply}/>
						</Show>
					</div>
				</div>
				<Show when={quoteFlag()}>
					<QuotePost post={post} isOpen={true} onClose={() => setQuoteFlag(false)}/>
				</Show>
			</div>
			<Modal class="modal-fullscreen-sm-down" show={confirmDelete()} onHide={() => setConfirmDelete(false)}>
				<Modal.Header closeButton={true}>
					<Modal.Title>Confirm</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Are you sure you want to delete this post?</p>
					<DisplayPostMinimal post={post}/>
				</Modal.Body>
				<Modal.Footer>
					<button type="button" class="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
					<button type="button" class="btn btn-danger" onClick={deletePost}>Delete</button>
				</Modal.Footer>
			</Modal>
		</>
	);
};
import { createMemo, createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { BsChatRight, BsQuote, BsStar, BsStarFill } from "solid-icons/bs";
import { FiEdit3, FiRepeat, FiTrash } from "solid-icons/fi";
import { authStore } from "../stores/auth-store";
import { formatTimeAgo, toLongDateString } from "../library";
import DisplayPoll from "./DisplayPoll";
import DisplayPostMinimal from "./DisplayPostMinimal";
import Editor from "./Editor";
import QuotePost from "./QuotePost";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;
const favouriteUrl = `${postsBaseUrl}/favourite`;
const unfavouriteUrl = `${postsBaseUrl}/unfavourite`;
const repeatUrl = `${postsBaseUrl}/repeat`;
const unrepeatUrl = `${postsBaseUrl}/unrepeat`;
const deleteUrl = `${postsBaseUrl}/delete`;

export default props => {
	const post = props.post;
	const postId = post._id;
	const createdAt = post.createdAt;
	const handle = post.author.handle;
	const repeatedBy = post.repeatedBy;
	const attachments = post.attachments;
	const [isEditing, setIsEditing] = createSignal(false);
	const [faveFlag, setFaveFlag] = createSignal(post.favourited);
	const [quoteFlag, setQuoteFlag] = createSignal(false);
	const [repeatFlag, setRepeatFlag] = createSignal(post.repeated);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const [confirmDelete, setConfirmDelete] = createSignal(false);
	const [isDeleted, setIsDeleted] = createSignal(false);
	const isOwnPost = createMemo(() => post.author._id === authStore.userId);
	const allowEdit = createMemo(() => isOwnPost() && !post.attachments?.poll && post.__v === 0);
	const toggleFave = event => {
		fetch(`${faveFlag() ? unfavouriteUrl : favouriteUrl}/${postId}`).then(response => {
			if (response.status === 200) {
				setFaveFlag(value => !value);
			}
		});
	};
	const toggleRepeat = event => {
		fetch(`${repeatFlag() ? unrepeatUrl : repeatUrl}/${postId}`).then(response => {
			if (response.status === 200 || response.status === 201) {
				setRepeatFlag(value => !value);
			}
		});
	};
	const toggleReply = event => {
		let sourceActionBar = event.target.closest(".action-bar");
		let editorInstance = document.getElementById("reply-editor") || <Editor id="reply-editor" isReply={true} classList={{ "mx-2": true, "mb-2": true }}/>;
		let editorParent = editorInstance.parentElement;
		const isAttachedToCurrent = editorParent === sourceActionBar;
		if (isAttachedToCurrent) {
			sourceActionBar.removeChild(editorInstance);
		} else {
			editorParent?.querySelector(".hstack > button:last-child").click();
			editorInstance.dataset["parentPostId"] = postId;
			sourceActionBar.appendChild(editorInstance);
		}
		setReplyFlag(!isAttachedToCurrent);
		editorParent = null;
		editorInstance = null;
		sourceActionBar = null;
	};
	const deletePost = async () => {
		try {
			const response = await fetch(`${deleteUrl}/${postId}`, { method: "DELETE" });
			if (response.status === 200) {
				setIsDeleted(true);
			}
		} finally {
			setConfirmDelete(false);
		}
	};
	return (
		<>
			<div data-post-id={postId} class="list-group-item p-0" classList={{ "has-reply": props.hasReplies, reply: props.isReply, "d-none": isDeleted() }}>
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
						<div>&#xA0;</div>
						<div>Repeated by <span class="handle">{repeatedBy.handle}</span></div>
					</Show>
					<div class="ms-auto">
						<A class="link-secondary" title={toLongDateString(createdAt)} href={`/post/${post._id}`}>{formatTimeAgo(createdAt)}</A>
					</div>
				</div>
				<div class="card-body px-2">
					<Show when={!isEditing()}>
						<p class="card-text text-break" innerHTML={post.content?.replace(/\n/g, "<br/>")}></p>
					</Show>
					<Show when={isEditing()}>
						<Editor post={post} isEditing={isEditing()} onSubmit={() => setIsEditing(false)}/>
					</Show>
					<Show when={attachments}>
						<Show when={attachments.poll}>
							<DisplayPoll postId={post._id} poll={attachments.poll} voted={post.voted} isOwnPoll={post.author._id === authStore.userId}/>
						</Show>
						<Show when={attachments.mediaFile}>
							<Show when={attachments.mediaFile.fileType === "image"}>
								<img class="img-fluid" alt={attachments.mediaFile.description} src={attachments.mediaFile.src}/>
							</Show>
							<Show when={attachments.mediaFile.fileType === "video"}>
								<video class="img-fluid" alt={attachments.mediaFile.description} src={attachments.mediaFile.src} controls={true}/>
							</Show>
						</Show>
						<Show when={attachments.post}>
							<div onClick={() => (location.href = `post/${attachments.post._id}`)} role="button">
								<DisplayPostMinimal post={attachments.post}/>
							</div>
						</Show>
					</Show>
				</div>
				<div class="action-bar">
					<div class="d-flex flex-wrap gap-2 justify-content-end mt-2">
						<Show when={allowEdit()}>
							<button class="btn bg-transparent border-0 py-2 px-3" onClick={() => setIsEditing(!isEditing())}><FiEdit3 classList={{ "text-primary": isEditing() }}/></button>
						</Show>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleFave}>{faveFlag() ? <BsStarFill color="gold"/> : <BsStar/>}</button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={() => setQuoteFlag(true)}><BsQuote/></button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleRepeat}>{repeatFlag() ? <FiRepeat color="green" class="stroke-3"/> : <FiRepeat/>}</button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleReply}>{replyFlag() ? <BsChatRight color="blue"/> : <BsChatRight/>}</button>
						<Show when={isOwnPost()}>
							<button class="btn bg-transparent border-0 py-2 px-3"><FiTrash onClick={() => setConfirmDelete(true)}/></button>
						</Show>
					</div>
				</div>
				<Show when={quoteFlag()}>
					<QuotePost post={post} isOpen={true} onClose={() => setQuoteFlag(false)}/>
				</Show>
			</div>
			<Show when={confirmDelete()}>
				<div class="modal fade show d-block" tabindex="-1">
					<div class="modal-dialog">
						<div class="modal-content">
							<div class="modal-header">
								<h5 class="modal-title">Confirm</h5>
								<button type="button" class="btn-close" onClick={() => setConfirmDelete(false)}></button>
							</div>
							<div class="modal-body">
								<p>Are you sure you want to delete this post?</p>
								<DisplayPostMinimal post={post}/>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
								<button type="button" class="btn btn-danger" onClick={deletePost}>Delete</button>
							</div>
						</div>
					</div>
				</div>
			</Show>
		</>
	);
};
import { createSignal, Show } from "solid-js";
import { BsChatRight, BsStar, BsStarFill } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import { authStore } from "../stores/auth-store";
import { formatTimeAgo, toLongDateString } from "../library";
import DisplayPoll from "./DisplayPoll";
import DisplayPostMinimal from "./DisplayPostMinimal";
import Editor from "./Editor";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/posts`;
const favouriteUrl = `${postsBaseUrl}/favourite`;
const unfavouriteUrl = `${postsBaseUrl}/unfavourite`;
const repeatUrl = `${postsBaseUrl}/repeat`;
const unrepeatUrl = `${postsBaseUrl}/unrepeat`;

export default props => {
	const post = props.post;
	const postId = post._id;
	const createdAt = post.createdAt;
	const handle = post.author.handle;
	const repeatedBy = post.repeatedBy;
	const attachments = post.attachments;
	const [faveFlag, setFaveFlag] = createSignal(post.favourited);
	const [repeatFlag, setRepeatFlag] = createSignal(post.repeated);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const toggleFave = event => {
		fetch(`${faveFlag() ? unfavouriteUrl : favouriteUrl}/${postId}`).then(response => {
			if(response.status === 200) {
				setFaveFlag(value => !value);
			}
		});
	};
	const toggleRepeat = event => {
		fetch(`${repeatFlag() ? unrepeatUrl : repeatUrl}/${postId}`).then(response => {
			if(response.status === 200 || response.status === 201) {
				setRepeatFlag(value => !value);
			}
		});
	};
	const toggleReply = event => {
		let sourceActionBar = event.target.closest(".action-bar");
		let editorInstance = document.getElementById("reply-editor") || <Editor id="reply-editor" isReply={true} classList={{ "mx-2": true, "mb-2": true }}/>;
		let editorParent = editorInstance.parentElement;
		const isAttachedToCurrent = (editorParent === sourceActionBar);
		if(isAttachedToCurrent) {
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
	return (
		<>
			<div data-post-id={postId} class="list-group-item p-0" classList={{ "has-reply": props.hasReplies, "reply": props.isReply }}>
				<div class="post-header">
					<a class="handle" href={`/${handle}`}>{handle}</a>
					<Show when={props.parentBlurb}>
						<div>&#xA0;</div>
						<div innerHTML={`Replied to "${props.parentBlurb}"`}></div>
					</Show>
					<Show when={repeatedBy}>
						<div>&#xA0;</div>
						<div>Repeated by <span class="handle">{repeatedBy.handle}</span></div>
					</Show>
					<div class="ms-auto">
						<a title={toLongDateString(createdAt)}>{formatTimeAgo(createdAt)}</a>
					</div>
				</div>
				<div class="card-body px-2">
					<p class="card-text text-break" innerHTML={post.content?.replace(/\n/g, "<br/>")}></p>
					<Show when={attachments}>
						<Show when={attachments.poll}>
							<DisplayPoll poll={attachments.poll} isOwnPoll={post.author._id === authStore.userId}/>
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
							<DisplayPostMinimal post={attachments.post}/>
						</Show>
					</Show>
				</div>
				<div class="action-bar">
					<div class="hstack gap-2 justify-content-end mt-2">
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleFave}>{faveFlag() ? <BsStarFill color="gold"/> : <BsStar/>}</button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleRepeat}>{repeatFlag() ? <FiRepeat color="green" class="stroke-3"/> : <FiRepeat/>}</button>
						<button class="btn bg-transparent border-0 py-2 px-3" onClick={toggleReply}>{replyFlag() ? <BsChatRight color="blue"/> : <BsChatRight/>}</button>
					</div>
				</div>
			</div>
		</>
	);
};
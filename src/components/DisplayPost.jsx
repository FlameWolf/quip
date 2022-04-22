import { BsChatRight, BsStar, BsStarFill } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import { createSignal, Show } from "solid-js";
import Editor from "./Editor";

const postsBaseUrl = `${import.meta.env.VITE_API_BASE_URL}posts/`;
const favouriteUrl = `${postsBaseUrl}favourite/`;
const unfavouriteUrl = `${postsBaseUrl}unfavourite/`;
const repeatUrl = `${postsBaseUrl}repeat/`;
const unrepeatUrl = `${postsBaseUrl}unrepeat/`;

export default props => {
	const post = props.post;
	const postId = post._id;
	const handle = post.author.handle;
	const repeatedBy = post.repeatedBy;
	const [faveFlag, setFaveFlag] = createSignal(post.favourited);
	const [repeatFlag, setRepeatFlag] = createSignal(post.repeated);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const toggleFave = event => {
		fetch(`${faveFlag() ? unfavouriteUrl : favouriteUrl}${postId}`).then(response => {
			if(response.status === 200) {
				setFaveFlag(value => !value);
			}
		});
	};
	const toggleRepeat = event => {
		fetch(`${repeatFlag() ? unrepeatUrl : repeatUrl}${postId}`).then(response => {
			if(response.status === 200) {
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
			editorParent?.querySelector(".action-buttons > div:last-child").click();
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
			<div data-post-id={post._id} class="list-group-item p-0" classList={{ "has-reply": props.hasReplies, "reply": props.isReply }}>
				<div class="post-header">
					<div>@</div>
					<a class="author.handle" href={`/${handle}`}>{handle}</a>
					<Show when={props.parentBlurb}>
						<div>&#xA0;</div>
						<div innerHTML={`Replied to "${props.parentBlurb}"`}></div>
					</Show>
					<Show when={repeatedBy}>
						<div>&#xA0;</div>
						<div>Repeated by @{repeatedBy.handle}</div>
					</Show>
				</div>
				<div class="card-body">
					<p class="card-text" innerHTML={post.content?.replace(/\n/g, "<br/>")}></p>
				</div>
				<div class="action-bar">
					<div class="action-buttons">
						<div onClick={toggleFave}>{faveFlag() ? <BsStarFill color="gold"/> : <BsStar/>}</div>
						<div onClick={toggleRepeat}>{repeatFlag() ? <FiRepeat color="green"/> : <FiRepeat/>}</div>
						<div onClick={toggleReply}>{replyFlag() ? <BsChatRight color="blue"/> : <BsChatRight/>}</div>
					</div>
				</div>
			</div>
		</>
	);
};
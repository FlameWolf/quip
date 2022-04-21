import { BsChatRight, BsStar, BsStarFill } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import { createSignal, Show } from "solid-js";
import Editor from "./Editor";

export default props => {
	const post = props.post;
	const handle = post.author.handle;
	const repeatedBy = post.repeatedBy;
	const [faveFlag, setFaveFlag] = createSignal(false);
	const [repeatFlag, setRepeatFlag] = createSignal(false);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const toggleFave = event => {
		setFaveFlag(value => !value);
	};
	const toggleRepeat = event => {
		setRepeatFlag(value => !value);
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
			editorInstance.dataset["parentPostId"] = post._id;
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
						<div>Repeated by @{repeatedBy}</div>
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
import { createSignal } from "solid-js";
import { BsStar, BsStarFill, BsChatRight } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import Editor from "./Editor";

export default props => {
	const post = props.post;
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
			editorInstance.dataset["parentPostId"] = post.id;
			sourceActionBar.appendChild(editorInstance);
		}
		setReplyFlag(!isAttachedToCurrent);
		editorParent = null;
		editorInstance = null;
		sourceActionBar = null;
	};
	return (
		<>
			<div data-post-id={post.id} class="list-group-item p-0" classList={{ "has-reply": props.hasReplies, "reply": props.isReply }}>
				<div class="card-body">
					<p class="card-text" innerHTML={post.content.replace(/\n/g, "<br/>")}></p>
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
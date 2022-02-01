import { createSignal, Show } from "solid-js";
import { BsChevronDown, BsChevronUp, BsStar, BsStarFill, BsChatRight } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import Editor from "./Editor";
import { quipStore, setQuipStore } from "../store/quip-store";

export default props => {
	const [threadFlag, setThreadFlag] = createSignal(false);
	const [faveFlag, setFaveFlag] = createSignal(false);
	const [repeatFlag, setRepeatFlag] = createSignal(false);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const toggleThread = event => {
		setThreadFlag(value => !value);
		if(threadFlag() && !props.post.replies?.length) {
			setQuipStore(
				"quips",
				quip => quip.id === props.post.id,
				quip => ({
					replies: [
						{ id: 256, content: "Lorem ipsum dolor sit amet.", hasReplies: true },
						{ id: 255, content: "Lorem ipsum dolor sit amet.", hasReplies: false },
						{ id: 254, content: "Lorem ipsum dolor sit amet.", hasReplies: true },
						{ id: 253, content: "Lorem ipsum dolor sit amet.", hasReplies: false },
						{ id: 252, content: "Lorem ipsum dolor sit amet.", hasReplies: true }
					],
					hasMore: true
				})
			);
		}
	};
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
			editorInstance.dataset["parentPostId"] = props.post.id;
			sourceActionBar.appendChild(editorInstance);
		}
		setReplyFlag(!isAttachedToCurrent);
		editorParent = null;
		editorInstance = null;
		sourceActionBar = null;
	};
	return (
		<div class="list-group-item p-0">
			<div class="card-body">
				<p class="card-text" innerHTML={props.post.content.replace(/\n/g, "<br/>")}></p>
			</div>
			<div class="action-bar">
				<div class="action-buttons">
					<Show when={props.post.hasReplies}>
						<div onClick={toggleThread}>{threadFlag() ? <BsChevronUp/> : <BsChevronDown/>}</div>
					</Show>
					<div onClick={toggleFave}>{faveFlag() ? <BsStarFill color="gold"/> : <BsStar/>}</div>
					<div onClick={toggleRepeat}>{repeatFlag() ? <FiRepeat color="green"/> : <FiRepeat/>}</div>
					<div onClick={toggleReply}>{replyFlag() ? <BsChatRight color="blue"/> : <BsChatRight/>}</div>
				</div>
			</div>
		</div>
	);
};
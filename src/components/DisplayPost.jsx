import { createSignal, createMemo, Show } from "solid-js";
import { BsChevronDown, BsChevronUp, BsStar, BsStarFill, BsChatRight } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import Editor from "./Editor";
import { quipStore, setQuipStore } from "../store/quip-store";
import DisplayPostList from "./DisplayPostList";

export default props => {
	const post = props.post;
	const [threadFlag, setThreadFlag] = createSignal(post.showThread || false);
	const [faveFlag, setFaveFlag] = createSignal(false);
	const [repeatFlag, setRepeatFlag] = createSignal(false);
	const [replyFlag, setReplyFlag] = createSignal(false);
	const loadReplies = (id, nextId) => {
		setQuipStore(
			"replies",
			replies => [
				...replies,
				{ id: nextId++, content: `Post Id = ${nextId - 1}: Lorem ipsum dolor sit amet.`, replyTo: id, hasReplies: true },
				{ id: nextId++, content: `Post Id = ${nextId - 1}: Lorem ipsum dolor sit amet.`, replyTo: id, hasReplies: false },
				{ id: nextId++, content: `Post Id = ${nextId - 1}: Lorem ipsum dolor sit amet.`, replyTo: id, hasReplies: true },
				{ id: nextId++, content: `Post Id = ${nextId - 1}: Lorem ipsum dolor sit amet.`, replyTo: id, hasReplies: false },
				{ id: nextId++, content: `Post Id = ${nextId - 1}: Lorem ipsum dolor sit amet.`, replyTo: id, hasReplies: true }
			]
		);
		setQuipStore({ nextId });
	};
	const toggleThread = event => {
		const keyName = post.replyTo ? "replies" : "quips";
		const postReplies = createMemo(() => quipStore.replies.filter(x => x.replyTo === post.id));
		setThreadFlag(value => !value);
		if(threadFlag()) {
			if(!postReplies().length) {
				loadReplies(post.id, quipStore.nextId);
			}
		}
		setQuipStore(keyName, item => item.id === post.id, "showThread", threadFlag());
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
			<div data-post-id={post.id} class="list-group-item p-0">
				<div class="card-body">
					<p class="card-text" innerHTML={post.content.replace(/\n/g, "<br/>")}></p>
				</div>
				<div class="action-bar">
					<div class="action-buttons">
						<Show when={post.hasReplies}>
							<div onClick={toggleThread}>{threadFlag() ? <BsChevronUp/> : <BsChevronDown/>}</div>
						</Show>
						<div onClick={toggleFave}>{faveFlag() ? <BsStarFill color="gold"/> : <BsStar/>}</div>
						<div onClick={toggleRepeat}>{repeatFlag() ? <FiRepeat color="green"/> : <FiRepeat/>}</div>
						<div onClick={toggleReply}>{replyFlag() ? <BsChatRight color="blue"/> : <BsChatRight/>}</div>
					</div>
				</div>
			</div>
			<Show when={threadFlag() && post.showThread}>
				<DisplayPostList posts={quipStore.replies.filter(reply => reply.replyTo === post.id)}/>
			</Show>
		</>
	);
};
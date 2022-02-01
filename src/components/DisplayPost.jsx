import { createSignal, Show } from "solid-js";
import { BsChevronDown, BsChevronUp, BsStar, BsStarFill, BsChatRight } from "solid-icons/bs";
import { FiRepeat } from "solid-icons/fi";
import Editor from "./Editor";
import { quipStore, setQuipStore } from "../store/quip-store";

export default props => {
	const renderPost = post => {
		const [threadFlag, setThreadFlag] = createSignal(false);
		const [faveFlag, setFaveFlag] = createSignal(false);
		const [repeatFlag, setRepeatFlag] = createSignal(false);
		const [replyFlag, setReplyFlag] = createSignal(false);
		const toggleThread = event => {
			setThreadFlag(value => !value);
			if(threadFlag() && !post.replies?.length) {
				let nextId = quipStore.nextId;
				setQuipStore(
					"quips",
					quip => quip.id === post.id,
					quip => ({
						replies: [
							{ id: nextId++, content: `Lorem ipsum ${Math.random()} dolor sit amet.`, replyTo: post.id, hasReplies: true },
							{ id: nextId++, content: `Lorem ipsum ${Math.random()} dolor sit amet.`, replyTo: post.id, hasReplies: false },
							{ id: nextId++, content: `Lorem ipsum ${Math.random()} dolor sit amet.`, replyTo: post.id, hasReplies: true },
							{ id: nextId++, content: `Lorem ipsum ${Math.random()} dolor sit amet.`, replyTo: post.id, hasReplies: false },
							{ id: nextId++, content: `Lorem ipsum ${Math.random()} dolor sit amet.`, replyTo: post.id, hasReplies: true }
						],
						hasMore: true
					})
				);
				setQuipStore({
					nextId
				});
			}
			console.log("Checking the store");
			console.log(threadFlag(), post.id, post.replies || "No replies");
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
				<div class="list-group-item p-0">
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
				<Show when={threadFlag()}>
					<For each={post.replies}>
					{
						(reply, index) => renderPost(reply)
					}
					</For>
					<Show when={post.hasMore}>
						<div class="list-group-item bg-light">
							<div>Load more replies for <em>"{post.content.substr(0, 20)}&#x2026;"</em></div>
						</div>
					</Show>
				</Show>
			</>
		);
	}
	return renderPost(props.post);
};
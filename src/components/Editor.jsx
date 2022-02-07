import { createMemo, createSignal, For } from "solid-js";
import { EmojiButton } from "@joeattardi/emoji-button";
import { position } from "caret-pos";
import { removeFormatting, innerHtmlAsText, insertEmojo, popularEmoji, editorCharLimit } from "../library";
import { quipStore, setQuipStore } from "../stores/quip-store";
import { userStore } from "../stores/user-store";

export default props => {
	let currentInstance;
	let editableDiv;
	let emojiTrigger;
	const [caret, setCaret] = createSignal(0);
	const [charCount, setCharCount] = createSignal(editorCharLimit);
	const emojiPicker = new EmojiButton({
		autoHide: false,
		showAnimation: false,
		showVariants: false
	});
	emojiPicker.on("emoji", selection => {
		document.querySelector(".emoji-picker__wrapper").style.setProperty("visibility", "hidden");
		position(editableDiv, caret());
		insertEmojo(editableDiv, selection.emoji, updateEditor);
		document.querySelector(".emoji-picker__wrapper").style.removeProperty("visibility");
	});
	const getTextContent = () => innerHtmlAsText(editableDiv);
	const getCharCount = text => text.match(/\p{L}\p{M}*|\S|\s/gu)?.length || 0;
	const updateEditor = event => {
		removeFormatting(editableDiv);
		setCharCount(editorCharLimit - getCharCount(getTextContent()));
	};
	const makeQuip = text => {
		const parentPostId = +currentInstance.dataset.parentPostId;
		const nextId = quipStore.nextId;
		setQuipStore(
			"quips",
			quips => [
				...quips,
				{
					id: nextId,
					author: userStore.currentUser,
					content: text,
					replyTo: parentPostId || undefined
				}
			]
		);
		setQuipStore("nextId", nextId + 1);
		editableDiv.innerHTML = "";
		setCharCount(editorCharLimit);
		if(props.isReply) {
			currentInstance.closest(".action-bar").querySelector(".action-buttons > div:last-child").click();
		}
	};
	const characterLimitExceeded = createMemo(() => charCount() < 0);
	return (
		<div ref={currentInstance} {...props} class="bg-white text-black border rounded p-2">
			<div ref={editableDiv} class="p-2 outline-0" contentEditable={true} onInput={updateEditor} onBlur={_ => setCaret(position(editableDiv).pos)}></div>
			<div class="d-flex justify-content-end pt-2 border-top">
				<div class="emoji-bar">
					<For each={popularEmoji}>
					{
						(emojo, index) => <div onClick={_ => insertEmojo(editableDiv, emojo, updateEditor)}>{emojo}</div>
					}
					</For>
				</div>
				<button ref={emojiTrigger} class="btn btn-light btn-sm px-3 rounded-pill ms-2" onClick={_ => emojiPicker.togglePicker(emojiTrigger)}>&#x2026;</button>
				<div class="char-count" classList={{ "bg-danger": characterLimitExceeded() }}>{charCount()}</div>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" disabled={charCount() === editorCharLimit || characterLimitExceeded()} onClick={_ => makeQuip(getTextContent())}>Post</button>
			</div>
		</div>
	);
};
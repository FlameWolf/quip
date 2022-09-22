import { createPopup } from "@picmo/popup-picker";
import { position } from "caret-pos";
import { createMemo, createSignal, For, onMount } from "solid-js";
import { contentLengthRegExp, innerHtmlAsText, insertEmojo, maxContentLength, popularEmoji, removeFormatting } from "../library";
import { quipStore, setQuipStore } from "../stores/quip-store";
import { authStore } from "../stores/auth-store";

export default props => {
	let currentInstance;
	let editableDiv;
	let emojiTrigger;
	let emojiPopup;
	const [caret, setCaret] = createSignal(0);
	const [charCount, setCharCount] = createSignal(maxContentLength);
	const getTextContent = () => innerHtmlAsText(editableDiv);
	const getCharCount = text => text.match(contentLengthRegExp)?.length || 0;
	const updateEditor = event => {
		removeFormatting(editableDiv);
		setCharCount(maxContentLength - getCharCount(getTextContent()));
	};
	const makeQuip = text => {
		const parentPostId = currentInstance.dataset.parentPostId;
		setQuipStore(
			"quips",
			quips => [
				...quips,
				{
					_id: quipStore.nextId,
					author: authStore.handle,
					content: text,
					replyTo: parentPostId || undefined
				}
			]
		);
		setQuipStore("nextId", value => value + 1);
		editableDiv.innerHTML = "";
		setCharCount(maxContentLength);
		if(props.isReply) {
			currentInstance.closest(".action-bar").querySelector(".action-buttons > div:last-child").click();
		}
	};
	const characterLimitExceeded = createMemo(() => charCount() < 0);
	onMount(() => {
		emojiPopup = createPopup({
			emojiSize: "1.25rem",
			showAnimation: false,
			showVariants: false
		}, {
			position: {
				top: "1rem",
				right: "1rem"
			},
			hideOnClickOutside: false,
			hideOnEmojiSelect: false,
			showCloseButton: true,
			hideOnEscape: true
		});
		emojiPopup.addEventListener("emoji:select", selection => {
			position(editableDiv, caret());
			insertEmojo(editableDiv, selection.emoji, updateEditor);
		});
	});
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
				<button ref={emojiTrigger} class="btn btn-light btn-sm px-3 rounded-pill ms-2" onClick={_ => emojiPopup.toggle()}>&#x2026;</button>
				<div class="char-count" classList={{ "bg-danger": characterLimitExceeded() }}>{charCount()}</div>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" disabled={charCount() === maxContentLength || characterLimitExceeded()} onClick={_ => makeQuip(getTextContent())}>Post</button>
			</div>
		</div>
	);
};
import { createMemo, createSignal, For } from "solid-js";
import { EmojiButton } from "@joeattardi/emoji-button";
import { position } from "caret-pos";
import { removeFormatting, innerHtmlAsText, insertEmojo, popularEmoji, editorCharLimit } from "../library";

export default props => {
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
	const getCharCount = text => text.trim() === "" ? 0 : text.match(/\p{L}\p{M}*|\S|\s/gu).length;
	const updateEditor = event => {
		removeFormatting(editableDiv);
		setCharCount(editorCharLimit - getCharCount(getTextContent()));
	};
	const characterLimitExceeded = createMemo(() => charCount() < 0);
	return (
		<div {...props} class="bg-white text-black border rounded p-2">
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
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2" disabled={charCount() === editorCharLimit || characterLimitExceeded()} onClick={_ => console.log(getTextContent())}>Post</button>
			</div>
		</div>
	);
};
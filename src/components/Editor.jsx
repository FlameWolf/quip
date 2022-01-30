import { createSignal, For } from "solid-js";
import { EmojiButton } from "@joeattardi/emoji-button";
import { position } from "caret-pos";
import { removeFormatting, innerHtmlAsText, insertEmojo, popularEmoji } from "../library";

export default props => {
	let editableDiv;
	let emojiTrigger;
	const [caret, setCaret] = createSignal(0);
	const emojiPicker = new EmojiButton({
		autoHide: false,
		showAnimation: false,
		showVariants: false
	});
	emojiPicker.on("emoji", selection => {
		document.querySelector(".emoji-picker__wrapper").style.setProperty("visibility", "hidden");
		position(editableDiv, caret());
		insertEmojo(editableDiv, selection.emoji);
		document.querySelector(".emoji-picker__wrapper").style.removeProperty("visibility");
	});
	return (
		<div {...props} class="bg-white text-black border rounded mt-2">
			<div ref={editableDiv} class="p-2 outline-0" contentEditable={true} on:input={removeFormatting} on:blur={() => setCaret(position(editableDiv).pos)}></div>
			<div class="d-flex justify-content-end p-1 border-top">
				<div class="emoji-bar">
					<For each={popularEmoji}>
					{
						(emojo, index) => <div onClick={() => insertEmojo(editableDiv, emojo)}>{emojo}</div>
					}
					</For>
				</div>
				<button ref={emojiTrigger} class="btn btn-light btn-sm px-3 rounded-pill ms-2" onClick={() => emojiPicker.togglePicker(emojiTrigger)}>&#x2026;</button>
				<button class="btn btn-secondary btn-sm px-3 rounded-pill ms-2">Post</button>
			</div>
		</div>
	);
};
import nodeEmoji from "node-emoji";
import { position } from "caret-pos";

export const removeDescendantAttributes = elem => {
	[...elem.querySelectorAll("*")].forEach(node => [...node.attributes].forEach(attrib => node.removeAttribute(attrib.name)));
};

export const removeFormatting = event => {
	let target = event.target;
	removeDescendantAttributes(target);
	const originalHtml = target.innerHTML;
	const cleanHtml = originalHtml.replace(/<\/?(?:(?!\/?(div|br))).*?>/g, "");
	if(originalHtml !== cleanHtml) {
		const pos = position(target).pos;
		target.innerHTML = cleanHtml;
		position(target, pos);
	}
	target = null;
};

export const innerHtmlAsText = elem => {
	return elem.innerHTML.replace(/<div>(.*?)<\/div>/g, "\n$1\n").replace(/<br>/g, "\n");
};

export const insertTextAtCaret = text => {
	let selection = window.getSelection();
	let range = selection.getRangeAt(0);
	range.deleteContents();
	range.insertNode(document.createTextNode(text));
	selection.collapseToEnd();
	range = null;
	selection = null;
};

export const insertEmojo = (elem, emojo) => {
	elem.focus();
	insertTextAtCaret(emojo);
};

export const popularEmoji = [
	nodeEmoji.get(":joy:"),
	nodeEmoji.get(":heart:"),
	nodeEmoji.get(":sob:"),
	nodeEmoji.get(":heart_eyes:"),
	nodeEmoji.get(":blush:"),
	nodeEmoji.get(":two_hearts:"),
	nodeEmoji.get(":kissing_heart:"),
	nodeEmoji.get(":pensive:"),
	nodeEmoji.get(":unamused:"),
	nodeEmoji.get(":weary:"),
	nodeEmoji.get(":grin:"),
	nodeEmoji.get(":relaxed:"),
	nodeEmoji.get(":pray:"),
	nodeEmoji.get(":ok_hand:"),
	nodeEmoji.get(":wink:"),
	nodeEmoji.get(":+1:"),
	nodeEmoji.get(":smirk:"),
	nodeEmoji.get(":sweat_smile:"),
	nodeEmoji.get(":fire:"),
	nodeEmoji.get(":relieved:"),
	nodeEmoji.get(":broken_heart:"),
	nodeEmoji.get(":sunglasses:"),
	nodeEmoji.get(":cry:"),
	nodeEmoji.get(":flushed:"),
	nodeEmoji.get(":sparkling_heart:"),
	nodeEmoji.get(":see_no_evil:"),
	nodeEmoji.get(":smiling_imp:"),
	nodeEmoji.get(":scream:"),
	nodeEmoji.get(":revolving_hearts:"),
	nodeEmoji.get(":sleepy:"),
	nodeEmoji.get(":confused:")
];
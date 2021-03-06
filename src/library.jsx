import { position } from "caret-pos";
import nodeEmoji from "node-emoji";

export const cookieOptions = {
	path: "/",
	maxAge: 60 * 60 * 24 * 360,
	secure: true,
	sameSite: "strict"
};
export const handleRegExp = /^[A-Za-z][\w]{3,31}$/;
export const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
export const invalidHandles = [
	"auth",
	"home",
	"search",
	"user",
	"users",
	"post",
	"posts",
	"quip",
	"quips",
	"favourite",
	"favourites",
	"unfavourite",
	"repeat",
	"repeats",
	"unrepeat",
	"reply",
	"replies",
	"profile",
	"profiles",
	"setting",
	"settings",
	"follow",
	"followed",
	"follows",
	"following",
	"follower",
	"followers",
	"unfollow",
	"mute",
	"muted",
	"unmute",
	"block",
	"blocked",
	"unblock",
	"filter",
	"filters",
	"list",
	"lists",
	"bookmark",
	"bookmarks",
	"unbookmark",
	"hashtag",
	"hashtags",
	"notification",
	"notifications",
	"message",
	"messages",
	"account",
	"accounts",
	"security",
	"privacy",
	"admin"
];
export const contentLengthRegExp = /\p{L}\p{M}?|\S|\s/gu;
export const maxContentLength = 256;
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

export const setCookie = (name, value, { path = undefined, domain = undefined, maxAge = undefined, expires = undefined, secure = undefined, sameSite = undefined }) => {
	document.cookie = [`${name}=${value}`, path && `path=${path}`, domain && `domain=${domain}`, maxAge && `max-age=${maxAge}`, expires && `expires=${expires}`, secure && "secure", sameSite && `samesite=${sameSite}`].filter(x => x).join("; ");
};

export const getCookie = name => {
	const cookie = RegExp(name + "=[^;]+").exec(document.cookie);
	return decodeURIComponent(cookie?.toString().replace(/^[^=]+./, "") || "");
};

export const removeDescendantAttributes = elem => {
	[...elem.querySelectorAll("*")].forEach(node => [...node.attributes].forEach(attrib => node.removeAttribute(attrib.name)));
};

export const removeFormatting = elem => {
	removeDescendantAttributes(elem);
	const originalHtml = elem.innerHTML;
	const cleanHtml = originalHtml === "<br>" ? "" : originalHtml.replace(/<\/?(?:(?!\/?(div|br))).*?>/g, "");
	if(originalHtml !== cleanHtml) {
		const pos = position(elem).pos;
		elem.innerHTML = cleanHtml;
		position(elem, pos);
	}
};

export const innerHtmlAsText = elem => {
	return elem.innerHTML.replace(/<div><br><\/div>/g, "\n").replace(/<div>(.*?)<\/div>/g, "$1\n").replace(/<br>/g, "\n").replace(/&nbsp;/g, " ").trimEnd();
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

export const insertEmojo = (elem, emojo, callback = null) => {
	elem.focus();
	insertTextAtCaret(emojo);
	callback?.();
};

export const trimPost = text => {
	return text && text.length > 20 ? `${text.substring(0, 20)}&#x2026;` : text;
};
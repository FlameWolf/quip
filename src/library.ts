import { position } from "caret-pos";
import * as nodeEmoji from "node-emoji";
import type { CookieOptions, LinkType } from "./types";

const epsilon = 1000;
const segmenter = new Intl.Segmenter();

export const emptyString = "";
export const lightTheme = "light";
export const darkTheme = "dark";
export const urlPattern = "(https?|ftp)://[^\\s/$.?#].[^\\s]*";
export const handleRegExp = /^[A-Za-z][\w]{3,31}$/;
export const passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
export const urlRegExp = new RegExp(`^${urlPattern}$`);
export const tokenRegExp = new RegExp(`${urlPattern}|\\S+|\\s+`, "gmu");
export const contentLengthRegExp = /\p{L}\p{M}?|\S|\s/gu;
export const invalidHandles = ["auth", "home", "search", "user", "users", "post", "posts", "quip", "quips", "favourite", "favourites", "unfavourite", "repeat", "repeats", "unrepeat", "reply", "replies", "profile", "profiles", "setting", "settings", "follow", "followed", "follows", "following", "follower", "followers", "unfollow", "mute", "muted", "unmute", "block", "blocked", "unblock", "filter", "filters", "list", "lists", "bookmark", "bookmarks", "unbookmark", "hashtag", "hashtags", "notification", "notifications", "message", "messages", "account", "accounts", "security", "privacy", "admin"];
export const nullId = "000000000000000000000000";
export const maxContentLength = 256;
export const maxPollOptionLength = 32;
export const maxMediaDescriptionLength = 4096;
export const maxItemsToFetch = 20;
export const popularEmoji = [nodeEmoji.get(":joy:"), nodeEmoji.get(":heart:"), nodeEmoji.get(":sob:"), nodeEmoji.get(":heart_eyes:"), nodeEmoji.get(":blush:"), nodeEmoji.get(":two_hearts:"), nodeEmoji.get(":kissing_heart:"), nodeEmoji.get(":pensive:"), nodeEmoji.get(":unamused:"), nodeEmoji.get(":weary:"), nodeEmoji.get(":grin:"), nodeEmoji.get(":relaxed:"), nodeEmoji.get(":pray:"), nodeEmoji.get(":ok_hand:"), nodeEmoji.get(":wink:"), nodeEmoji.get(":+1:"), nodeEmoji.get(":smirk:"), nodeEmoji.get(":sweat_smile:"), nodeEmoji.get(":fire:"), nodeEmoji.get(":relieved:"), nodeEmoji.get(":broken_heart:"), nodeEmoji.get(":sunglasses:"), nodeEmoji.get(":cry:"), nodeEmoji.get(":flushed:"), nodeEmoji.get(":sparkling_heart:"), nodeEmoji.get(":see_no_evil:"), nodeEmoji.get(":smiling_imp:"), nodeEmoji.get(":scream:"), nodeEmoji.get(":revolving_hearts:"), nodeEmoji.get(":sleepy:"), nodeEmoji.get(":confused:")];

export const setCookie = (name: string, value: string, { path = undefined, domain = undefined, maxAge = undefined, expires = undefined, secure = undefined, sameSite = undefined }: CookieOptions) => {
	document.cookie = [`${name}=${value}`, path && `path=${path}`, domain && `domain=${domain}`, maxAge && `max-age=${maxAge}`, expires && `expires=${expires}`, secure && "secure", sameSite && `samesite=${sameSite}`].filter(x => x).join("; ");
};

export const getCookie = (name: string) => {
	const cookie = RegExp(name + "=[^;]+").exec(document.cookie);
	return decodeURIComponent(cookie?.toString().replace(/^[^=]+./, emptyString) || emptyString);
};

export const removeDescendantAttributes = (elem: Element) => {
	Array.from(elem.querySelectorAll("*")).forEach(node => Array.from(node.attributes).forEach(attrib => node.removeAttribute(attrib.name)));
};

export const removeFormatting = (elem: HTMLElement) => {
	removeDescendantAttributes(elem);
	const originalHtml = elem.innerHTML;
	const cleanHtml = originalHtml === "<br>" ? emptyString : originalHtml.replace(/<\/?(?:(?!\/?(div|br))).*?>/g, emptyString);
	if (originalHtml !== cleanHtml) {
		const pos = position(elem).pos;
		elem.innerHTML = cleanHtml;
		position(elem, pos);
	}
};

export const innerHtmlAsText = (elem: HTMLElement) =>
	elem.innerHTML
		.replace(/<div><br><\/div>/g, "\n")
		.replace(/<div>(.*?)<\/div>/g, "$1\n")
		.replace(/<br>/g, "\n")
		.replace(/&nbsp;/g, " ")
		.trimEnd();

export const insertTextAtCaret = (elem: HTMLTextAreaElement, text: string) => {
	const currentValue = elem.value;
	const owner = elem.ownerDocument;
	if (typeof elem.selectionStart == "number" && typeof elem.selectionEnd == "number") {
		const endIndex = elem.selectionEnd;
		elem.value = currentValue.slice(0, endIndex) + text + currentValue.slice(endIndex);
		elem.selectionStart = elem.selectionEnd = endIndex + text.length;
	} else if (owner.getSelection) {
		elem.focus();
		const range = owner.getSelection()?.getRangeAt(0);
		if (range) {
			range.collapse(false);
			range.insertNode(owner.createTextNode(text));
			range.setStart(elem, range.startOffset);
			range.setEnd(elem, range.endOffset);
		}
	}
};

export const insertEmojo = (elem: HTMLTextAreaElement, emojo: string, callback: (() => void) | null = null) => {
	elem.focus();
	insertTextAtCaret(elem, emojo);
	callback?.();
};

export const getGraphemeClusterCount = (text: string) => Array.from(segmenter.segment(text)).length;

export const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const trimPost = (text: string) => {
	return text && getGraphemeClusterCount(text) > 20
		? `${Array.from(segmenter.segment(text))
				.slice(0, 20)
				.map(x => x.segment)
				.join(emptyString)}…`
		: text;
};

export const convertToLink = (token: string, linkType: LinkType) => {
	if (linkType === "url") {
		const safeToken = escapeHtml(token);
		return `<a href="${safeToken}">${safeToken}</a>`;
	}
	// Linkify only the leading handle/tag (letters and marks); escape everything around it so markup cannot break out.
	const body = token.replace(/[@#]/, emptyString);
	const match = body.match(/[\p{L}\p{M}]+/u);
	if (!match) {
		return escapeHtml(token);
	}
	const value = match[0];
	const before = escapeHtml(body.slice(0, match.index));
	const after = escapeHtml(body.slice(match.index! + value.length));
	const link = linkType === "mention" ? `<a href="/${value}">@${value}</a>` : `<a href="/hashtag/${value}">#${value}</a>`;
	return `${before}${link}${after}`;
};

export const parseContent = (text: string | undefined) => {
	if (!text) {
		return undefined;
	}
	return (
		text
			.match(tokenRegExp)
			?.map(token => {
				if (urlRegExp.test(token)) {
					return convertToLink(token, "url");
				}
				if (token[0] === "@") {
					return convertToLink(token, "mention");
				}
				if (token[0] === "#") {
					return convertToLink(token, "hashtag");
				}
				return escapeHtml(token);
			})
			.join(emptyString)
			.replace(/\n/g, "<br/>") ?? escapeHtml(text)
	);
};

export const toShortDateString = (input: Date | string | number) =>
	new Intl.DateTimeFormat("default", {
		year: "numeric",
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
		formatMatcher: "basic"
	}).format(input.constructor === Date ? (input as Date) : new Date(input as string | number));

export const toLongDateString = (input: Date | string | number) =>
	new Intl.DateTimeFormat("default", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		fractionalSecondDigits: 3,
		timeZoneName: "short",
		timeZone: "UTC",
		hour12: false,
		formatMatcher: "basic"
	}).format(input.constructor === Date ? (input as Date) : new Date(input as string | number));

export const formatPlural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? emptyString : "s"}`;

export const formatTimeAgo = (input: Date | string | number) => {
	const dateValue = input.constructor === Date ? (input as Date) : new Date(input as string | number);
	const timeFragments: string[] = [];
	const milliseconds = Date.now() - dateValue.getTime();
	if (milliseconds < epsilon) {
		return "Just now";
	}
	const seconds = milliseconds / 1000;
	const minutes = seconds / 60;
	const hours = minutes / 60;
	if (seconds > 0 && seconds < 60) {
		timeFragments.push(formatPlural(Math.round(seconds), "second"));
	} else if (minutes > 0 && minutes < 60) {
		timeFragments.push(formatPlural(Math.round(minutes), "minute"));
		timeFragments.push(formatPlural(Math.round(seconds % 60), "second"));
	} else if (hours > 0 && hours < 24) {
		timeFragments.push(formatPlural(Math.round(hours), "hour"));
		timeFragments.push(formatPlural(Math.round(minutes % 60), "minute"));
	}
	return hours >= 24 ? toShortDateString(dateValue) : `${timeFragments.join(", ")} ago`;
};

export const getErrorMessage = async (response: Response) => {
	const isJson = response.headers.get("Content-Type")?.startsWith("application/json");
	const errorMessage = isJson ? (await response.json()).message : await response.text();
	if (!errorMessage && response.status === 401) {
		return "You need to be signed in to perform this action.";
	}
	return errorMessage || "An error occurred. Please try later.";
};
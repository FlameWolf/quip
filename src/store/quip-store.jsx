import { createStore } from "solid-js/store";

export const [quipStore, setQuipStore] = createStore({
	quips: [
		{ id: 1, content: "This is a quip.", replyTo: null, hasReplies: false },
		{ id: 2, content: "Hello, World!", replyTo: null, hasReplies: false },
		{ id: 3, content: "What is the time now?", replyTo: null, hasReplies: true },
		{ id: 4, content: "I have no idea.", replyTo: 3, hasReplies: false },
		{ id: 5, content: "This is so werid!", replyTo: null, hasReplies: false }
	],
	nextId: 6
});
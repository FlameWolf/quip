import { createStore } from "solid-js/store";

export const [quipStore, setQuipStore] = createStore({
	quips: [
		{ id: 1, content: "This is a quip.", replyTo: null },
		{ id: 2, content: "Hello, World!", replyTo: null },
		{ id: 3, content: "What is the time now?", replyTo: null },
		{ id: 4, content: "I have no idea.", replyTo: 3 },
		{ id: 5, content: "This is so werid!", replyTo: null },
		{ id: 6, content: "I know, right?", replyTo: 5 },
		{ id: 7, content: "So many posts are here.", replyTo: null }
	],
	nextId: 8
});
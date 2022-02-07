import { createStore } from "solid-js/store";

export const [quipStore, setQuipStore] = createStore({
	quips: [
		{ id: 1, author: { id: 1, handle: "FlameWolf" }, content: "This is a quip.", replyTo: null },
		{ id: 2, author: { id: 2, handle: "Godzilla" }, content: "Hello, World!", replyTo: null },
		{ id: 3, author: { id: 4, handle: "Kraken" }, content: "What is the time now?", replyTo: null },
		{ id: 4, author: { id: 6, handle: "Minotaur" }, content: "I have no idea.", replyTo: 3 },
		{ id: 5, author: { id: 3, handle: "Pegasus" }, content: "This is so werid!", replyTo: null },
		{ id: 6, author: { id: 5, handle: "Unicorn" }, content: "I know, right?", replyTo: 5 },
		{ id: 7, author: { id: 4, handle: "Kraken" }, content: "So many posts are here.", replyTo: null }
	],
	nextId: 8
});
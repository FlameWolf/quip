import { createStore } from "solid-js/store";

export const [quipStore, setQuipStore] = createStore({
	quips: [
		{ id: 1, content: "This is a quip." },
		{ id: 2, content: "Hello, World!" },
		{ id: 3, content: "What is the time now?" },
		{ id: 4, content: "I have no idea." },
		{ id: 5, content: "This is so werid!" }
	]
});
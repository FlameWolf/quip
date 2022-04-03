import { createStore } from "solid-js/store";

export const [quipStore, setQuipStore] = createStore({
	quips: [],
	nextId: 1
});
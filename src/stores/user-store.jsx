import { createStore } from "solid-js/store";

export const [userStore, setUserStore] = createStore({
	currentUser: {
		id: 1,
		handle: "FlameWolf"
	},
	users: [
		{ id: 1, handle: "FlameWolf" },
		{ id: 2, handle: "Godzilla" },
		{ id: 3, handle: "Pegasus" },
		{ id: 4, handle: "Kraken" },
		{ id: 5, handle: "Unicorn" },
		{ id: 6, handle: "Minotaur" }
	]
});
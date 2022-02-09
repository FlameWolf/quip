import { createStore } from "solid-js/store";

export const [userStore, setUserStore] = createStore({
	currentUser: {
		id: 1,
		handle: "FlameWolf",
		password: "TestPass"
	},
	users: [
		{ id: 1, handle: "FlameWolf", password: "TestPass" },
		{ id: 2, handle: "Godzilla", password: "TestPass" },
		{ id: 3, handle: "Pegasus", password: "TestPass" },
		{ id: 4, handle: "Kraken", password: "TestPass" },
		{ id: 5, handle: "Unicorn", password: "TestPass" },
		{ id: 6, handle: "Minotaur", password: "TestPass" }
	],
	nextId: 7
});
import { createStore } from "solid-js/store";

export const [userStore, setUserStore] = createStore({
	currentUser: undefined,
	users: [
		{ id: 1, handle: "FlameWolf", password: "TestPass123" },
		{ id: 2, handle: "Godzilla", password: "TestPass123" },
		{ id: 3, handle: "Pegasus", password: "TestPass123" },
		{ id: 4, handle: "Kraken", password: "TestPass123" },
		{ id: 5, handle: "Unicorn", password: "TestPass123" },
		{ id: 6, handle: "Minotaur", password: "TestPass123" }
	],
	nextId: 7
});
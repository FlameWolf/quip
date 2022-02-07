import { createStore } from "solid-js/store";

export const [userStore, setUserStore] = createStore({
	currentUser: {
		id: 1,
		handle: "FlameWolf"
	}
});
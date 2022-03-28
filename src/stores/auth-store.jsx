import { createStore } from "solid-js/store";

export const [authStore, setAuthStore] = createStore({
	userId: undefined,
	handle: undefined,
	token: undefined,
	createdAt: undefined,
	expiresIn: undefined
});
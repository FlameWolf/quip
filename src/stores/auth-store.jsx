import { createStore } from "solid-js/store";

export const [authStore, setAuthStore] = createStore({
	token: undefined,
	createdAt: undefined,
	expiresIn: undefined
});
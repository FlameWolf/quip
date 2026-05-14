import { createStore } from "solid-js/store";
import type { AuthState } from "../types";

export const [authStore, setAuthStore] = createStore<AuthState>({
	userId: undefined,
	handle: undefined,
	token: undefined,
	createdAt: undefined,
	expiresIn: undefined
});
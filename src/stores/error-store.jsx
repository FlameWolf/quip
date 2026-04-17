import { createStore } from "solid-js/store";

export const [errorStore, setErrorStore] = createStore({
	message: undefined
});
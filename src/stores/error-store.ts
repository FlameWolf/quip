import { createStore } from "solid-js/store";
import type { ErrorState } from "../types";

export const [errorStore, setErrorStore] = createStore<ErrorState>({
	message: undefined
});
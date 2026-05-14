import { createStore } from "solid-js/store";
import type { QuipState } from "../types";

export const [quipStore, setQuipStore] = createStore<QuipState>({
	quips: [],
	nextId: 1
});
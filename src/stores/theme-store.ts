import { createStore } from "solid-js/store";
import { lightTheme, darkTheme } from "../library";
import type { ThemeState } from "../types";

export const [themeStore, setThemeStore] = createStore<ThemeState>({
	theme: localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme),
	get isLight(): boolean {
		return themeStore.theme === lightTheme;
	},
	get isDark(): boolean {
		return themeStore.theme === darkTheme;
	}
});
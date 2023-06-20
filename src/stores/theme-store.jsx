import { createStore } from "solid-js/store";
import { lightTheme, darkTheme } from "../library";

export const [themeStore, setThemeStore] = createStore({
	theme: localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? darkTheme : lightTheme),
	get isLight() {
		return themeStore.theme === lightTheme;
	},
	get isDark() {
		return themeStore.theme === darkTheme;
	}
});
import { createEffect, onMount, onCleanup, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { lightTheme, darkTheme } from "./library";
import { themeStore, setThemeStore } from "./stores/theme-store";
import { authStore, setAuthStore } from "./stores/auth-store";

let searchInput;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const authBaseUrl = `${apiBaseUrl}/auth`;
const refreshTokenUrl = `${authBaseUrl}/refresh-token`;
const authChannelName = import.meta.env.VITE_AUTH_CHANNEL_NAME;
navigator.serviceWorker.controller?.postMessage({
	action: "init",
	payload: {
		apiBaseUrl,
		authBaseUrl,
		refreshTokenUrl,
		authChannelName,
		authCacheName: import.meta.env.VITE_AUTH_CACHE_NAME,
		setAuthDataAction: import.meta.env.VITE_SET_AUTH_DATA_ACTION,
		getAuthDataAction: import.meta.env.VITE_GET_AUTH_DATA_ACTION
	}
});

export default props => {
	const authChannel = new BroadcastChannel(authChannelName);
	const protectedRoutes = ["/", "/home"];
	createEffect(() => {
		const theme = themeStore.theme;
		document.body.parentElement.setAttribute("data-bs-theme", theme);
		localStorage.setItem("theme", theme);
	});
	const updateTheme = () => setThemeStore("theme", themeStore.isLight ? darkTheme : lightTheme);
	const populateSearchInput = () => {
		const urlParams = new URLSearchParams(location.search);
		const searchText = urlParams.get("q");
		if(searchText) {
			searchInput.value = searchText;
		}
	}
	const doSearch = event => {
		event.preventDefault();
		const searchText = searchInput.value;
		if(!searchText) {
			return;
		}
		location.href = "/search?q=" + encodeURIComponent(searchText);
	};
	onMount(() => {
		const location = useLocation();
		const navigate = useNavigate();
		authChannel.addEventListener("message", event => {
			setAuthStore(event.data);
			if (protectedRoutes.indexOf(location.pathname) > -1 && !authStore.token) {
				navigate("/auth", { resolve: false });
			}
		});
		navigator.serviceWorker.controller?.postMessage({
			action: import.meta.env.VITE_GET_AUTH_DATA_ACTION
		});
		if(location.pathname.startsWith("/search")) {
			populateSearchInput();
		}
	});
	onCleanup(() => {
		authChannel.close();
	});
	return (
		<>
			<Show when={!location.pathname.startsWith("/auth")}>
				<nav class="navbar mb-3">
					<div class="container">
						<a class="navbar-brand mb-0 h1" target="_self" href="/">Home</a>
						<form class="d-flex" role="search">
							<input ref={searchInput} class="form-control me-2" type="text" placeholder="Search" aria-label="Search" onKeyUp={(event) => (event.code === "Enter") && doSearch(event)}/>
							<button class="btn btn-outline-primary" type="submit" onClick={doSearch}>Search</button>
						</form>
					</div>
				</nav>
			</Show>
			<div class="row">
				<div class="col py-3 page-container">{props.children}</div>
			</div>
			<button class="bg-secondary text-light btn-theme-toggle p-0 border-0 rounded-50 mt-1 me-1" tabIndex={1} onClick={updateTheme}>
				<i class="bi" classList={{ "bi-moon-fill": themeStore.isLight, "bi-sun-fill": themeStore.isDark }}></i>
			</button>
		</>
	);
};
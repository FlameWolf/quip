import { createEffect, createMemo, onMount, onCleanup, Show } from "solid-js";
import { useLocation, useNavigate, A } from "@solidjs/router";
import { lightTheme, darkTheme, emptyString } from "./library";
import { themeStore, setThemeStore } from "./stores/theme-store";
import { authStore, setAuthStore } from "./stores/auth-store";
import { Dropdown } from "bootstrap";
import { VsMenu } from "solid-icons/vs";

let imgMenu;
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
	const location = useLocation();
	const navigate = useNavigate();
	const authChannel = new BroadcastChannel(authChannelName);
	const protectedRoutes = ["/", "/home"];
	const basePath = createMemo(() => location.pathname.split("/")?.at(1) || emptyString);
	createEffect(() => {
		const theme = themeStore.theme;
		document.body.parentElement.setAttribute("data-bs-theme", theme);
		localStorage.setItem("theme", theme);
	});
	const updateTheme = () => setThemeStore("theme", themeStore.isLight ? darkTheme : lightTheme);
	const signOut = () => {
		setAuthStore({
			userId: emptyString,
			handle: emptyString,
			token: emptyString,
			refreshToken: emptyString,
			createdAt: emptyString,
			expiresIn: emptyString
		});
		navigator.serviceWorker.controller?.postMessage({
			action: import.meta.env.VITE_SET_AUTH_DATA_ACTION,
			payload: { ...authStore }
		});
		setTimeout(() => {
			navigate("/auth", { resolve: false });
		}, 250);
	};
	const populateSearchInput = () => {
		const urlParams = new URLSearchParams(location.search);
		const searchText = urlParams.get("q");
		if (searchText) {
			searchInput.value = searchText;
		}
	};
	const doSearch = event => {
		event.preventDefault();
		const searchText = searchInput.value;
		if (!searchText) {
			return;
		}
		navigate(`/search?q=${encodeURIComponent(searchText)}`);
	};
	createEffect(() => {
		if (imgMenu) {
			if (themeStore.isDark) {
				imgMenu.style.setProperty("filter", "invert(0.8)");
				return;
			}
			imgMenu.style.removeProperty("filter");
		}
	});
	onMount(() => {
		authChannel.addEventListener("message", event => {
			setAuthStore(event.data);
			if (protectedRoutes.indexOf(location.pathname) > -1 && !authStore.token) {
				navigate("/auth", { resolve: false });
			}
		});
		navigator.serviceWorker.controller?.postMessage({
			action: import.meta.env.VITE_GET_AUTH_DATA_ACTION
		});
		if (imgMenu) {
			new Dropdown(imgMenu);
		}
		if (basePath() === "search") {
			populateSearchInput();
		}
	});
	onCleanup(() => {
		authChannel.close();
	});
	return (
		<>
			<Show when={basePath() !== "auth"}>
				<nav class="navbar mb-3">
					<div class="container">
						<div class="d-flex gap-4 me-auto">
							<div class="dropdown">
								<button class="btn btn-outline-secondary" data-bs-toggle="dropdown" aria-expanded="false">
									<VsMenu/>
								</button>
								<ul class="dropdown-menu">
									<li>
										<A class="dropdown-item" href={`/${authStore.handle}`}>Profile</A>
									</li>
									<li>
										<hr class="dropdown-divider"/>
									</li>
									<li>
										<A class="dropdown-item disabled" href="javascript: void(0)">Settings</A>
									</li>
									<li>
										<hr class="dropdown-divider"/>
									</li>
									<li>
										<a class="dropdown-item" onClick={signOut} role="button">Sign out</a>
									</li>
								</ul>
							</div>
							<A class="navbar-brand mb-0 h1" href="/">Home</A>
						</div>
						<form class="d-flex" role="search">
							<input ref={searchInput} class="form-control me-2" type="text" placeholder="Search" aria-label="Search" onKeyUp={event => event.code === "Enter" && doSearch(event)}/>
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
import { createEffect, createMemo, onMount, onCleanup, Show } from "solid-js";
import { useLocation, useNavigate, A, useSearchParams } from "@solidjs/router";
import { lightTheme, darkTheme, emptyString } from "./library";
import { themeStore, setThemeStore } from "./stores/theme-store";
import { authStore, setAuthStore } from "./stores/auth-store";
import { errorStore, setErrorStore } from "./stores/error-store";
import { Dropdown } from "bootstrap";
import { VsMenu } from "solid-icons/vs";

let imgMenu;
let searchInput;
let errorAlert;
let alertTimeout;
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
	const [searchParams] = useSearchParams();
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
		const searchText = searchParams["q"];
		if (searchText) {
			searchInput.value = searchText;
		}
	};
	const doSearch = () => {
		const searchText = searchInput.value;
		if (!searchText) {
			return;
		}
		navigate(`/search?q=${encodeURIComponent(searchText)}`, {
			resolve: false
		});
	};
	const dismissAlert = () => {
		clearTimeout(alertTimeout);
		setErrorStore({ message: emptyString });
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
	createEffect(() => {
		if (errorStore.message) {
			alertTimeout = setTimeout(dismissAlert, 5000);
		}
	});
	onCleanup(() => {
		authChannel.close();
		dismissAlert();
	});
	return (
		<>
			<Show when={basePath() !== "auth"}>
				<nav class="navbar mb-3">
					<div class="container gap-2">
						<div class="d-flex gap-4">
							<div class="dropdown">
								<button class="btn btn-outline-secondary" data-bs-toggle="dropdown" aria-expanded="false">
									<VsMenu/>
								</button>
								<ul class="dropdown-menu">
									<Show when={authStore.userId}>
										<li>
											<A class="dropdown-item" href={`/${authStore.handle}`}>Profile</A>
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
									</Show>
									<Show when={!authStore.userId}>
										<li>
											<A class="dropdown-item" href="/auth">Sign up</A>
										</li>
									</Show>
								</ul>
							</div>
							<A class="navbar-brand mb-0 h1" href="/">Home</A>
						</div>
						<div class="d-flex me-auto">
							<ul class="navbar-nav">
								<li class="nav-item">
									<a class="nav-link" role="button">Top Posts</a>
								</li>
							</ul>
						</div>
						<div class="d-flex" role="search">
							<input ref={searchInput} class="form-control me-2" type="text" placeholder="Search" onKeyUp={event => event.code === "Enter" && doSearch()} aria-label="Search"/>
							<button class="btn btn-outline-primary" onClick={doSearch}>Search</button>
						</div>
					</div>
				</nav>
			</Show>
			<div class="row">
				<div class="col py-3 page-container">{props.children}</div>
			</div>
			<Show when={errorStore.message}>
				<div ref={errorAlert} class="alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-2" role="alert">
					<div class="me-4" innerHTML={errorStore.message}></div>
					<button type="button" class="btn-close position-absolute top-50 end-0 translate-middle-y me-2" onClick={dismissAlert} aria-label="Close"></button>
				</div>
			</Show>
			<button class="bg-secondary text-light btn-theme-toggle p-0 border-0 rounded-50 mt-1 me-1" tabIndex={1} onClick={updateTheme}>
				<i class="bi" classList={{ "bi-moon-fill": themeStore.isLight, "bi-sun-fill": themeStore.isDark }}></i>
			</button>
		</>
	);
};
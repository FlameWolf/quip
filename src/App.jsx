import { lazy, createEffect, onMount, onCleanup } from "solid-js";
import { Navigate, Route, Routes, useLocation, useNavigate } from "@solidjs/router";
import { lightTheme, darkTheme } from "./library";
import { themeStore, setThemeStore } from "./stores/theme-store";
import { authStore, setAuthStore } from "./stores/auth-store";

const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const NotFound = lazy(() => import("./components/NotFound"));
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

export default () => {
	const authChannel = new BroadcastChannel(authChannelName);
	const protectedRoutes = ["/", "/home"];
	createEffect(() => {
		const theme = themeStore.theme;
		document.body.parentElement.setAttribute("data-bs-theme", theme);
		localStorage.setItem("theme", theme);
	});
	const updateTheme = () => setThemeStore("theme", themeStore.isLight ? darkTheme : lightTheme);
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
	});
	onCleanup(() => {
		authChannel.close();
	});
	return (
		<>
			<div class="row">
				<div class="col py-3 page-container">
					<Routes>
						<Route path="/auth" element={<Auth/>}>
							<Route path="/sign-up" element={<SignUp/>}/>
							<Route path="/sign-in" element={<SignIn/>}/>
							<Route path="/" element={<Navigate href="/auth/sign-up"/>}/>
						</Route>
						<Route path="/home" element={<Home/>}/>
						<Route path="/:handle" element={<Profile/>}/>
						<Route path="/" element={<Navigate href="/home"/>}/>
						<Route path="/*all" element={<NotFound/>}/>
					</Routes>
				</div>
			</div>
			<button class="bg-secondary text-light btn-theme-toggle p-0 border-0 rounded-50 mt-1 me-1" tabIndex={1} onClick={updateTheme}>
				<i class="bi" classList={{ "bi-moon-fill": themeStore.isLight, "bi-sun-fill": themeStore.isDark }}></i>
			</button>
		</>
	);
};
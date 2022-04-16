import { Navigate, Route, Routes, useLocation, useNavigate } from "solid-app-router";
import { lazy, onMount } from "solid-js";
import { authStore, setAuthStore } from "./stores/auth-store";
const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const NotFound = lazy(() => import("./components/NotFound"));

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const authBaseUrl = `${apiBaseUrl}auth/`;
const refreshTokenUrl = `${authBaseUrl}refresh-token`;
navigator.serviceWorker.controller?.postMessage({
	payload: {
		apiBaseUrl,
		authBaseUrl,
		refreshTokenUrl,
		authCacheName: import.meta.env.VITE_AUTH_CACHE_NAME,
		authChannelName: import.meta.env.VITE_AUTH_CHANNEL_NAME,
		setAuthDataAction: import.meta.env.VITE_SET_AUTH_DATA_ACTION,
		getAuthDataAction: import.meta.env.VITE_GET_AUTH_DATA_ACTION
	}
});

function App() {
	const protectedRoutes = ["/", "/home"];
	onMount(() => {
		const location = useLocation();
		const navigate = useNavigate();
		const authChannel = new BroadcastChannel(import.meta.env.VITE_AUTH_CHANNEL_NAME);
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
	return (
		<div class="row">
			<div class="col px-md-5 py-3">
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
	);
}

export default App;
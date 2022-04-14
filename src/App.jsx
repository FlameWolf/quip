import { Navigate, Route, Routes, useLocation, useNavigate } from "solid-app-router";
import { lazy, onMount } from "solid-js";
import { authChannelName, getAuthDataAction } from "./auth-library";
import { authStore, setAuthStore } from "./stores/auth-store";
const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
	const protectedRoutes = ["/", "/home"];
	onMount(() => {
		const location = useLocation();
		const navigate = useNavigate();
		const authChannel = new BroadcastChannel(authChannelName);
		authChannel.addEventListener("message", event => {
			setAuthStore(event.data);
			if (protectedRoutes.indexOf(location.pathname) > -1 && !authStore.token) {
				navigate("/auth", { resolve: false });
			}
		});
		navigator.serviceWorker.controller?.postMessage({
			action: getAuthDataAction
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
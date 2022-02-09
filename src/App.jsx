import { Routes, Route, Navigate, useLocation, useNavigate } from "solid-app-router";
import { lazy, onMount } from "solid-js";
import { userStore } from "./stores/user-store";
const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
	const protectedRoutes = [
		"/",
		"/home"
	];
	onMount(() => {
		const location = useLocation();
		const navigate = useNavigate();
		if(protectedRoutes.indexOf(location.pathname) > -1) {
			const currentUser = userStore.currentUser;
			if(!currentUser) {
				navigate("/auth", { resolve: false });
			}
		}
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
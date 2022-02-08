import { Router, Routes, Route, Navigate } from "solid-app-router";
import { lazy } from "solid-js";
const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
	return (
		<Router>
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
		</Router>
	);
}

export default App;
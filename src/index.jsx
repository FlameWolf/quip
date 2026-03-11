import "inter-ui/inter.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { createResource, createSignal, lazy, Show, Suspense } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";

const App = lazy(() => import("./App"));
const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const Search = lazy(() => import("./components/Search"));
const Profile = lazy(() => import("./components/Profile"));
const NotFound = lazy(() => import("./components/NotFound"));

const [showError, setShowError] = createSignal(false);

render(() => {
	const healthCheckUrl = `${import.meta.env.VITE_API_BASE_URL}/health`;
	const fetchPromise = fetch(healthCheckUrl, {
		signal: AbortSignal.timeout(5000)
	});
	const [healthCheckStatus] = createResource(async () => {
		try {
			const response = await fetch(healthCheckUrl, {
				signal: AbortSignal.timeout(5000)
			});
			if (!response.ok) {
				setShowError(true);
				return false;
			}
			return true;
		} catch {
			setShowError(true);
			return false;
		}
	});
	return (
		<Suspense>
			<p class="d-none">API Health Check: {healthCheckStatus() ? "Pass" : "Fail"}.</p>
			<Show when={showError()}>
				<div class="row">
					<div class="col py-3 page-container">
						<div class="d-flex flex-column align-items-center">
							<p>API is currently unavailable. Please try again after five minutes.</p>
						</div>
					</div>
				</div>
			</Show>
			<Show when={!showError()}>
				<Router root={App}>
					<Route path="/auth" component={Auth}>
						<Route path="/sign-in" component={SignIn}/>
						<Route path={["/", "/sign-up"]} component={SignUp}/>
					</Route>
					<Route path="/search" component={Search}/>
					<Route path="/:handle" component={Profile}/>
					<Route path={["/", "/home"]} component={Home}/>
					<Route path="/*404" component={NotFound}/>
				</Router>
			</Show>
		</Suspense>
	);
}, document.getElementById("root"));
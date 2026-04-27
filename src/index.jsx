import "inter-ui/inter.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { createEffect, createMemo, createResource, createSignal, lazy, Show, Suspense } from "solid-js";
import { render } from "solid-js/web";
import { Navigate, Router, Route } from "@solidjs/router";
import { emptyString } from "./library";

const App = lazy(() => import("./App"));
const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const TopmostAll = lazy(() => import("./components/TopmostAll"));
const Search = lazy(() => import("./components/Search"));
const Post = lazy(() => import("./components/Post"));
const Thread = lazy(() => import("./components/Thread"));
const Profile = lazy(() => import("./components/Profile"));
const Quips = lazy(() => import("./components/Quips"));
const Interactions = lazy(() => import("./components/Interactions"));
const Follows = lazy(() => import("./components/Follows"));
const NotFound = lazy(() => import("./components/NotFound"));

const healthCheckUrl = `${import.meta.env.VITE_API_BASE_URL}/health`;
const storedLastVisit = localStorage.getItem("lastVisited");
const [lastVisited, setLastVisited] = createSignal(storedLastVisit ? new Date(Number(storedLastVisit)) : null);

render(() => {
	createEffect(() => {
		localStorage.setItem("lastVisited", lastVisited()?.valueOf() || emptyString);
	});
	const needHealthCheck = createMemo(() => !lastVisited() || lastVisited() < new Date(Date.now() - 10 * 60 * 1000));
	const loadingPlaceholder = () => {
		if (!needHealthCheck()) {
			return null;
		}
		return (
			<>
				<div class="row">
					<div class="col py-3 page-container">
						<div class="d-flex flex-column align-items-center">
							<div class="spinner-border" role="status">
								<span class="visually-hidden">Loading...</span>
							</div>
							<p class="mt-2">Checking API health...</p>
						</div>
					</div>
				</div>
			</>
		);
	};
	const [healthCheckStatus] = createResource(async () => {
		if (!needHealthCheck()) {
			return true;
		}
		try {
			const response = await fetch(healthCheckUrl, {
				signal: AbortSignal.timeout(5000)
			});
			if (!response.ok) {
				throw new Error("API health check failed");
			}
			setLastVisited(new Date());
			return true;
		} catch {
			return false;
		}
	});
	if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
		document.body.parentElement.setAttribute("data-bs-theme", "dark");
	}
	return (
		<Suspense fallback={loadingPlaceholder}>
			<Show when={!healthCheckStatus()}>
				<div class="row">
					<div class="col py-3 page-container">
						<div class="d-flex flex-column text-center">
							<p>API is currently unavailable. Please try again after five minutes.</p>
							<hr/>
							<p class="fw-bold">Why am I seeing this?</p>
							<p>The API is hosted on a free Render instance. The server spins down the service after 15 minutes of inactivity. When you visit this page, a request is triggered, which would cause the service to start up &#x2014; so the API should become available within five minutes.</p>
						</div>
					</div>
				</div>
			</Show>
			<Show when={healthCheckStatus()}>
				<Router root={App}>
					<Route path="/auth" component={Auth}>
						<Route path="/sign-in" component={SignIn}/>
						<Route path="/sign-up" component={SignUp}/>
						<Route path="/" component={() => <Navigate href="sign-up"/>}/>
					</Route>
					<Route path="/top" component={TopmostAll}/>
					<Route path="/search" component={Search}/>
					<Route path="/post/:postId" component={Post}/>
					<Route path="/thread/:postId" component={Thread}/>
					<Route path="/:handle" component={Profile}>
						<Route path="/following" component={Follows}/>
						<Route path="/followers" component={Follows}/>
						<Route path="/favourites" component={Interactions}/>
						<Route path="/mentions" component={Interactions}/>
						<Route path="/posts" component={Quips}/>
						<Route path="/" component={() => <Navigate href="posts"/>}/>
					</Route>
					<Route path={["/", "/home"]} component={Home}/>
					<Route path="/*404" component={NotFound}/>
				</Router>
			</Show>
		</Suspense>
	);
}, document.getElementById("root"));
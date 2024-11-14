import "inter-ui/inter.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
const App = lazy(() => import("./App"));
const Auth = lazy(() => import("./components/Auth"));
const SignUp = lazy(() => import("./components/SignUp"));
const SignIn = lazy(() => import("./components/SignIn"));
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const NotFound = lazy(() => import("./components/NotFound"));

render(
	() => (
		<Router root={App}>
			<Route path="/auth" component={Auth}>
				<Route path="/sign-in" component={SignIn}/>
				<Route path={["/", "/sign-up"]} component={SignUp}/>
			</Route>
			<Route path="/:handle" component={Profile}/>
			<Route path={["/", "/home"]} component={Home}/>
			<Route path="/*404" component={NotFound}/>
		</Router>
	),
	document.getElementById("root")
);
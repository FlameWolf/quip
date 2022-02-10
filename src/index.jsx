import "inter-ui/inter.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import { render } from "solid-js/web";
import { Router } from "solid-app-router";
import App from "./App";

render(
	() => (
		<Router>
			<App/>
		</Router>
	),
	document.getElementById("root")
);
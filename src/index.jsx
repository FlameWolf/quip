import { render } from "solid-js/web";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App";
import { Router } from "solid-app-router";

render(
	() => (
		<Router>
			<App/>
		</Router>
	),
	document.getElementById("root")
);
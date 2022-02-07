import { Router, Routes, Route } from "solid-app-router";
import { lazy } from "solid-js";
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));

function App() {
	return (
		<Router>
			<div class="row">
				<div class="col px-5 py-3">
					<Routes>
						<Route path="/home" element={<Home/>}/>
						<Route path="/:handle" element={<Profile/>}/>
						<Route path="/" element={<Home/>}/>
					</Routes>
				</div>
			</div>
		</Router>
	);
}

export default App;
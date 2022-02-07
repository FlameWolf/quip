import { Routes } from "solid-app-router";
import Home from "../components/Home";

export const routes = (
	<Routes>
		<Route path="/home" element={<Home/>}/>
		<Route path="/" element={<Home/>}/>
	</Routes>
);
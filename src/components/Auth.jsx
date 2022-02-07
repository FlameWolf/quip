import { NavLink, Outlet } from "solid-app-router";

export default props => {
	return (
		<div class="py-5 auth-panel">
			<div class="card">
				<div class="card-header">
					<div class="hstack gap-3">
						<NavLink class="ms-auto" href="sign-up">Sign Up</NavLink>
						<div class="vr"></div>
						<NavLink class="me-auto" href="sign-in">Sign In</NavLink>
					</div>
				</div>
				<div class="card-body text-center py-3">
					<Outlet/>
				</div>
			</div>
		</div>
	);
};
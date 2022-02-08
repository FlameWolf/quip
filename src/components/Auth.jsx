import nodeEmoji from "node-emoji";
import { NavLink, Outlet } from "solid-app-router";

export default props => {
	return (
		<>
			<div class="pb-5 auth-panel">
				<div class="d-flex flex-column align-items-center pb-5">
					<h1>Quip</h1>
					<div class="hstack gap-3 justify-content-center bg-light text-muted w-100 py-2 rounded-pill mt-2">
						<span class="fw-bold fst-italic">noun</span>
						<span>a witty remark</span>
					</div>
				</div>
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
				<div class="d-flex flex-fill align-items-center bg-light rounded-pill p-2 mt-5">
					<div class="marquee-x">{nodeEmoji.get(":slightly_smiling_face:")}</div>
				</div>
			</div>
		</>
	);
};
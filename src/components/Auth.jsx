import { NavLink, Outlet } from "@solidjs/router";
import logoUrl from "../assets/images/logo.svg";

export default props => {
	return (
		<div class="row justify-content-center mt-md-5">
			<div class="col-sm-1 logo-panel my-lg-auto mx-lg-5 ms-xl-0 me-xl-5">
				<div class="d-flex justify-content-center mb-4">
					<img class="logo img-fluid" src={logoUrl} alt="Quip Logo"/>
				</div>
				<div class="hstack gap-2 justify-content-center py-2 mb-5">
					<span class="fw-bold fst-italic">noun</span>
					<span>&#xB7;</span>
					<span>a witty remark</span>
				</div>
			</div>
			<div class="col-sm-11 form-panel">
				<div class="card">
					<div class="card-header">
						<div class="hstack gap-3">
							<NavLink class="ms-auto" target="_self" href="sign-up">Sign Up</NavLink>
							<div class="vr"></div>
							<NavLink class="me-auto" target="_self" href="sign-in">Sign In</NavLink>
						</div>
					</div>
					<div class="card-body text-center py-3">
						<Outlet/>
					</div>
				</div>
			</div>
		</div>
	);
};
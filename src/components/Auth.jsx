import logoUrl from "../assets/images/logo.svg";

export default props => {
	return (
		<div class="hstack gap-2 flex-column flex-md-row align-items-stretch auth-panel">
			<div class="col-12 col-md-5">
				<div class="bg-secondary-subtle h-100 p-5 rounded">
					<div class="d-flex justify-content-center mb-4">
						<img class="logo" src={logoUrl} alt="Quip Logo"/>
					</div>
					<div class="hstack gap-2 justify-content-center py-2">
						<span class="fw-bold fst-italic">noun</span>
						<span>&#xB7;</span>
						<span>a witty remark</span>
					</div>
				</div>
			</div>
			<div class="col-12 col-md-7">
				<div class="card">
					<div class="card-header">
						<div class="hstack gap-3">
							<a class="ms-auto" target="_self" href="/auth/sign-up">Sign Up</a>
							<div class="vr"></div>
							<a class="me-auto" target="_self" href="/auth/sign-in">Sign In</a>
						</div>
					</div>
					<div class="card-body text-center py-3">
						{props.children}
					</div>
				</div>
			</div>
		</div>
	);
};
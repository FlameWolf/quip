import { BsEye, BsEyeSlash } from "solid-icons/bs";
import { createEffect, createSignal } from "solid-js";

export default props => {
	const [showPassword, setShowPassword] = createSignal(false);
	const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
	return (
		<>
			<div class="input-group mb-3">
				<span class="input-group-text">@</span>
				<input class="form-control" type="text" placeholder="Username"/>
			</div>
			<div class="input-group mb-3">
				<input class="form-control" type={showPassword() ? "text" : "password"} placeholder="Password"/>
				<span class="input-group-text clickable" onClick={() => setShowPassword(value => !value)}>{showPassword() ? BsEyeSlash : BsEye}</span>
			</div>
			<div class="input-group">
				<input class="form-control" type={showConfirmPassword() ? "text" : "password"} placeholder="Confirm password"/>
				<span class="input-group-text clickable" onClick={() => setShowConfirmPassword(value => !value)}>{showConfirmPassword() ? BsEyeSlash : BsEye}</span>
			</div>
		</>
	);
};
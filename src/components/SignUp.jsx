import { BsEye, BsEyeSlash } from "solid-icons/bs";
import { createSignal, onMount } from "solid-js";
import { handleRegExp, passwordRegExp } from "../library";
import { AiOutlineInfoCircle } from "solid-icons/ai";
import { Popover } from "bootstrap";

export default props => {
	let signUpForm;
	let usernameInfoToggle;
	let passwordInfoToggle;
	let confirmPasswordInfoToggle;
	let usernameInput;
	let passwordInput;
	let confirmPasswordInput;
	const [showPassword, setShowPassword] = createSignal(false);
	const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
	const [formValidity, setFormValidity] = createSignal(false);
	const [formHasValue, setFormHasValue] = createSignal(false);
	const updateFormValidity = event => {
		const username = usernameInput.value;
		const password = passwordInput.value;
		const confirmPassword = confirmPasswordInput.value;
		const usernameValid = username && usernameInput.checkValidity();
		const passwordValid = password && passwordInput.checkValidity();
		const confirmPasswordValid = confirmPassword && confirmPassword === passwordInput.value;
		const isValid = usernameValid && passwordValid && confirmPasswordValid;
		setFormHasValue(username || password || confirmPassword);
		usernameInput.classList.toggle("is-valid", usernameValid);
		usernameInput.classList.toggle("is-invalid", !usernameValid);
		passwordInput.classList.toggle("is-valid", passwordValid);
		passwordInput.classList.toggle("is-invalid", !passwordValid);
		confirmPasswordInput.classList.toggle("is-valid", confirmPasswordValid);
		confirmPasswordInput.classList.toggle("is-invalid", !confirmPasswordValid);
		setFormValidity(isValid && signUpForm.checkValidity());
	};
	const resetForm = event => {
		signUpForm.reset();
		setFormValidity(false);
		usernameInput.classList.remove("is-valid");
		usernameInput.classList.remove("is-invalid");
		passwordInput.classList.remove("is-valid");
		passwordInput.classList.remove("is-invalid");
		confirmPasswordInput.classList.remove("is-valid");
		confirmPasswordInput.classList.remove("is-invalid");
	};
	const handleFormSubmission = event => {
		event.preventDefault();
		event.stopPropagation();
	};
	onMount(() => {
		new Popover(
			usernameInfoToggle,
			{
				content: "Username must start with a letter, be 4-32 characters long, and may contain underscores and digits",
				trigger: "focus",
				placement: "auto"
			}
		);
		new Popover(
			passwordInfoToggle,
			{
				content: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one digit",
				trigger: "focus",
				placement: "auto"
			}
		);
		new Popover(
			confirmPasswordInfoToggle,
			{
				content: "Password entered here should match the password entered in the previous input box",
				trigger: "focus",
				placement: "auto"
			}
		);
	});
	return (
		<form ref={signUpForm} onInput={updateFormValidity}>
			<div class="d-flex mb-2">
				<label>Username</label>
				<a ref={usernameInfoToggle} class="ms-auto clickable" tabIndex={-1}>
					<AiOutlineInfoCircle/>
				</a>
			</div>
			<div class="input-group mb-4">
				<span class="input-group-text">@</span>
				<input ref={usernameInput} class="form-control" type="text" placeholder="Username" pattern={handleRegExp.source}/>
			</div>
			<div class="d-flex mb-2">
				<label>Password</label>
				<a ref={passwordInfoToggle} class="ms-auto clickable" tabIndex={-1}>
					<AiOutlineInfoCircle/>
				</a>
			</div>
			<div class="input-group mb-4">
				<input ref={passwordInput} class="form-control" type={showPassword() ? "text" : "password"} placeholder="Password" pattern={passwordRegExp.source}/>
				<span class="input-group-text clickable" onClick={event => setShowPassword(value => !value)}>{showPassword() ? BsEyeSlash : BsEye}</span>
			</div>
			<div class="d-flex mb-2">
				<label>Confirm password</label>
				<a ref={confirmPasswordInfoToggle} class="ms-auto clickable" tabIndex={-1}>
					<AiOutlineInfoCircle/>
				</a>
			</div>
			<div class="input-group mb-4">
				<input ref={confirmPasswordInput} class="form-control" type={showConfirmPassword() ? "text" : "password"} placeholder="Confirm password"/>
				<span class="input-group-text clickable" onClick={event => setShowConfirmPassword(value => !value)}>{showConfirmPassword() ? BsEyeSlash : BsEye}</span>
			</div>
			<div class="d-flex">
				<button class="btn btn-secondary w-50 me-1" disabled={!formHasValue()} onClick={resetForm}>Clear Form</button>
				<button class="btn btn-primary w-50 ms-1" disabled={!formValidity()} onClick={handleFormSubmission}>Sign Up</button>
			</div>
		</form>
	);
};
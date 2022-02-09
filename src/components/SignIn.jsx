import { BsEye, BsEyeSlash } from "solid-icons/bs";
import { createSignal, onMount } from "solid-js";
import { AiOutlineInfoCircle } from "solid-icons/ai";
import { Popover } from "bootstrap";

export default props => {
	let signInForm;
	let usernameInfoToggle;
	let passwordInfoToggle;
	let usernameInput;
	let passwordInput;
	const [showPassword, setShowPassword] = createSignal(false);
	const [formValidity, setFormValidity] = createSignal(false);
	const [formHasValue, setFormHasValue] = createSignal(false);
	const updateFormValidity = event => {
		const username = usernameInput.value;
		const password = passwordInput.value;
		const usernameValid = username && usernameInput.checkValidity();
		const passwordValid = password && passwordInput.checkValidity();
		const isValid = usernameValid && passwordValid;
		setFormHasValue(username || password);
		usernameInput.classList.toggle("is-valid", usernameValid);
		usernameInput.classList.toggle("is-invalid", !usernameValid);
		passwordInput.classList.toggle("is-valid", passwordValid);
		passwordInput.classList.toggle("is-invalid", !passwordValid);
		setFormValidity(isValid && signInForm.checkValidity());
	};
	const resetForm = event => {
		signInForm.reset();
		setFormValidity(false);
		usernameInput.classList.remove("is-valid");
		usernameInput.classList.remove("is-invalid");
		passwordInput.classList.remove("is-valid");
		passwordInput.classList.remove("is-invalid");
	};
	const handleFormSubmission = event => {
	};
	onMount(() => {
		new Popover(
			usernameInfoToggle,
			{
				content: "Username is required",
				trigger: "focus",
				placement: "auto"
			}
		);
		new Popover(
			passwordInfoToggle,
			{
				content: "Password is required",
				trigger: "focus",
				placement: "auto"
			}
		);
	});
	return (
		<form ref={signInForm} onInput={updateFormValidity}>
			<div class="d-flex mb-2">
				<label>Username</label>
				<a ref={usernameInfoToggle} class="ms-auto clickable" tabIndex={-1}>
					<AiOutlineInfoCircle/>
				</a>
			</div>
			<div class="input-group mb-4">
				<span class="input-group-text">@</span>
				<input ref={usernameInput} class="form-control" type="text" placeholder="Username" required={true}/>
			</div>
			<div class="d-flex mb-2">
				<label>Password</label>
				<a ref={passwordInfoToggle} class="ms-auto clickable" tabIndex={-1}>
					<AiOutlineInfoCircle/>
				</a>
			</div>
			<div class="input-group mb-4">
				<input ref={passwordInput} class="form-control" type={showPassword() ? "text" : "password"} placeholder="Password" required={true}/>
				<span class="input-group-text clickable" onClick={event => setShowPassword(value => !value)}>{showPassword() ? BsEyeSlash : BsEye}</span>
			</div>
			<div class="d-flex">
				<button class="btn btn-secondary w-50 me-1" type="button" disabled={!formHasValue()} onClick={resetForm}>Clear Form</button>
				<button class="btn btn-primary w-50 ms-1" type="button" disabled={!formValidity()} onClick={handleFormSubmission}>Sign In</button>
			</div>
		</form>
	);
};
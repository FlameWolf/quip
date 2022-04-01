import { Popover } from "bootstrap";
import { useNavigate } from "solid-app-router";
import { AiOutlineInfoCircle } from "solid-icons/ai";
import { BsEye, BsEyeSlash } from "solid-icons/bs";
import { createSignal, onMount, Show } from "solid-js";
import { setAuthDataAction } from "../../auth-library";
import { handleRegExp, passwordRegExp } from "../library";

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
	const [signUpError, setSignUpError] = createSignal();
	const navigate = useNavigate();
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
	const submitForm = async event => {
		const signUpUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/sign-up`;
		const handle = usernameInput.value;
		const password = passwordInput.value;
		const response = await fetch(signUpUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ handle, password })
		});
		if (response.status === 201) {
			setSignUpError(undefined);
			navigator.serviceWorker.controller.postMessage({
				action: setAuthDataAction,
				payload: { handle }
			});
			navigate("/home", { resolve: false });
		} else if (response.status >= 400) {
			setSignUpError(await response.text());
		}
	};
	onMount(() => {
		new Popover(usernameInfoToggle, {
			content: "Username must start with a letter, be 4-32 characters long, and may contain underscores and digits",
			trigger: "focus",
			placement: "auto"
		});
		new Popover(passwordInfoToggle, {
			content: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one digit",
			trigger: "focus",
			placement: "auto"
		});
		new Popover(confirmPasswordInfoToggle, {
			content: "Password entered here should match the password entered in the previous input box",
			trigger: "focus",
			placement: "auto"
		});
	});
	return (
		<form ref={signUpForm} onInput={updateFormValidity}>
			<Show when={signUpError()}>
				<div class="alert alert-danger alert-dismissible">
					<span>{signUpError()}</span>
					<button class="btn-close" type="button" onClick={() => setSignUpError(undefined)}></button>
				</div>
			</Show>
			<div class="d-flex mb-2">
				<label>Username</label>
				<a ref={usernameInfoToggle} class="ms-auto clickable" tabIndex={-1}><AiOutlineInfoCircle/></a>
			</div>
			<div class="input-group mb-4">
				<span class="input-group-text">@</span>
				<input ref={usernameInput} class="form-control" type="text" placeholder="Username" pattern={handleRegExp.source}/>
			</div>
			<div class="d-flex mb-2">
				<label>Password</label>
				<a ref={passwordInfoToggle} class="ms-auto clickable" tabIndex={-1}><AiOutlineInfoCircle/></a>
			</div>
			<div class="input-group mb-4">
				<input ref={passwordInput} class="form-control" type={showPassword() ? "text" : "password"} placeholder="Password" pattern={passwordRegExp.source}/>
				<span class="input-group-text clickable" onClick={event => setShowPassword(value => !value)}>{showPassword() ? BsEyeSlash : BsEye}</span>
			</div>
			<div class="d-flex mb-2">
				<label>Confirm password</label>
				<a ref={confirmPasswordInfoToggle} class="ms-auto clickable" tabIndex={-1}><AiOutlineInfoCircle/></a>
			</div>
			<div class="input-group mb-4">
				<input ref={confirmPasswordInput} class="form-control" type={showConfirmPassword() ? "text" : "password"} placeholder="Confirm password"/>
				<span class="input-group-text clickable" onClick={event => setShowConfirmPassword(value => !value)}>{showConfirmPassword() ? BsEyeSlash : BsEye}</span>
			</div>
			<div class="d-flex">
				<button class="btn btn-secondary w-50 me-1" type="button" disabled={!formHasValue()} onClick={resetForm}>Clear Form</button>
				<button class="btn btn-primary w-50 ms-1" type="button" disabled={!formValidity()} onClick={submitForm}>Sign Up</button>
			</div>
		</form>
	);
};
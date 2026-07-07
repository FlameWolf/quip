import { createSignal } from "solid-js";
import { OverlayTrigger, Popover } from "solid-bootstrap";
import { useNavigate } from "@solidjs/router";
import { AiOutlineInfoCircle } from "solid-icons/ai";
import { BsEye, BsEyeSlash } from "solid-icons/bs";
import { setErrorStore } from "../stores/error-store";
import { getErrorMessage } from "../library";
import type { SignInProps } from "../types/SignInProps";

const signInUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/sign-in`;

export default (props: SignInProps) => {
	let signInForm!: HTMLFormElement;
	let usernameInput!: HTMLInputElement;
	let passwordInput!: HTMLInputElement;
	const [showPassword, setShowPassword] = createSignal(false);
	const [formValidity, setFormValidity] = createSignal(false);
	const [formHasValue, setFormHasValue] = createSignal(false);
	const navigate = useNavigate();
	const updateFormValidity = (event: Event) => {
		const username = usernameInput.value;
		const password = passwordInput.value;
		const usernameValid = username && usernameInput.checkValidity();
		const passwordValid = password && passwordInput.checkValidity();
		const isValid = usernameValid && passwordValid;
		setFormHasValue(!!(username || password));
		usernameInput.classList.toggle("is-valid", !!usernameValid);
		usernameInput.classList.toggle("is-invalid", !usernameValid);
		passwordInput.classList.toggle("is-valid", !!passwordValid);
		passwordInput.classList.toggle("is-invalid", !passwordValid);
		setFormValidity(!!(isValid && signInForm.checkValidity()));
	};
	const resetForm = (event: Event) => {
		signInForm.reset();
		setFormValidity(false);
		usernameInput.classList.remove("is-valid");
		usernameInput.classList.remove("is-invalid");
		passwordInput.classList.remove("is-valid");
		passwordInput.classList.remove("is-invalid");
	};
	const submitForm = async (event: Event) => {
		const handle = usernameInput.value;
		const password = passwordInput.value;
		try {
			const response = await fetch(signInUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ handle, password })
			});
			if (!response.ok) {
				setErrorStore("message", await getErrorMessage(response));
				return;
			}
			navigate("/home", { resolve: false });
		} catch (err: any) {
			setErrorStore("message", err.message);
		}
	};
	return (
		<form ref={signInForm} onInput={updateFormValidity}>
			<div class="d-flex mb-2">
				<label>Username</label>
				<OverlayTrigger trigger="focus" placement="auto" overlay={<Popover id="username-info"><Popover.Body>Username is required</Popover.Body></Popover>}>
					<a class="ms-auto clickable" tabIndex={-1}>
						<AiOutlineInfoCircle/>
					</a>
				</OverlayTrigger>
			</div>
			<div class="input-group mb-4">
				<span class="input-group-text">@</span>
				<input ref={usernameInput} class="form-control" type="text" placeholder="Username" required={true}/>
			</div>
			<div class="d-flex mb-2">
				<label>Password</label>
				<OverlayTrigger trigger="focus" placement="auto" overlay={<Popover id="password-info"><Popover.Body>Password is required</Popover.Body></Popover>}>
					<a class="ms-auto clickable" tabIndex={-1}>
						<AiOutlineInfoCircle/>
					</a>
				</OverlayTrigger>
			</div>
			<div class="input-group mb-4">
				<input ref={passwordInput} class="form-control" type={showPassword() ? "text" : "password"} placeholder="Password" required={true}/>
				<span class="input-group-text clickable" onClick={(event: Event) => setShowPassword(value => !value)}>{showPassword() ? BsEyeSlash({}) : BsEye({})}</span>
			</div>
			<div class="d-flex">
				<button class="btn btn-secondary w-50 me-1" type="button" disabled={!formHasValue()} onClick={resetForm}>Clear Form</button>
				<button class="btn btn-primary w-50 ms-1" type="button" disabled={!formValidity()} onClick={submitForm}>Sign In</button>
			</div>
		</form>
	);
};
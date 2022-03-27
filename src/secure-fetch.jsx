import { getCookie } from "./library";
import { authStore, setAuthStore } from "./stores/auth-store";

export const refreshAuthToken = async () => {
	const refreshAuthTokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-auth-token`;
	const userId = getCookie(import.meta.env.VITE_USER_ID_COOKIE_NAME);
	const handle = getCookie(import.meta.env.VITE_HANDLE_COOKIE_NAME);
	const response = await fetch(refreshAuthTokenUrl, {
		method: "GET",
		headers: {
			"X-UID": userId,
			"X-Slug": handle
		},
		credentials: "include",
		mode: "cors"
	});
	if (response.status === 200) {
		const { token, createdAt, expiresIn } = await response.json();
		setAuthStore({ token, createdAt, expiresIn });
	} else {
		setAuthStore({
			token: undefined,
			createdAt: undefined,
			expiresIn: undefined
		});
	}
};

export const secureFetch = async (
	resource,
	init = {
		method: undefined,
		headers: {},
		body: undefined,
		mode: undefined,
		credentials: undefined,
		cache: undefined,
		redirect: undefined,
		referrer: undefined,
		referrerPolicy: undefined,
		integrity: undefined,
		keepalive: undefined,
		signal: undefined
	}
) => {
	const authToken = authStore.token;
	if (authToken) {
		const createdDate = new Date(authStore.createdAt);
		const expiryDate = createdDate.setMilliseconds(createdDate.getMilliseconds() + parseInt(authStore.expiresIn));
		if (new Date() < expiryDate) {
			Object.assign(init, {
				headers: {
					...init.headers,
					Authorization: `Bearer ${authToken}`
				},
				credentials: "include",
				mode: "cors"
			});
			return await fetch(resource, init);
		}
		await refreshAuthToken();
		return await secureFetch(resource, init);
	}
	return await fetch(resource, init);
};
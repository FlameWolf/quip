import { getCookie } from "./library";
import { authStore, setAuthStore } from "./stores/auth-store";

const refreshTokenUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`;
const enforcedInitOptions = {
	credentials: "include",
	mode: "cors"
};

export const refreshToken = async () => {
	const userId = getCookie(import.meta.env.VITE_USER_ID_COOKIE_NAME);
	const handle = getCookie(import.meta.env.VITE_HANDLE_COOKIE_NAME);
	const response = await fetch(refreshTokenUrl, {
		method: "GET",
		headers: {
			"X-UID": userId,
			"X-Slug": handle
		},
		...enforcedInitOptions
	});
	if (response.status === 200) {
		const { token, createdAt, expiresIn } = await response.json();
		setAuthStore({ userId, handle, token, createdAt, expiresIn });
	} else {
		setAuthStore({
			userId: undefined,
			handle: undefined,
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
	Object.assign(init, enforcedInitOptions);
	const authToken = authStore.token;
	if (authToken) {
		const createdDate = new Date(authStore.createdAt);
		const expiryDate = createdDate.setMilliseconds(createdDate.getMilliseconds() + parseInt(authStore.expiresIn));
		if (new Date() < expiryDate) {
			Object.assign(init, {
				headers: {
					...init.headers,
					Authorization: `Bearer ${authToken}`
				}
			});
			return await fetch(resource, init);
		}
		await refreshToken();
		return await secureFetch(resource, init);
	}
	return await fetch(resource, init);
};
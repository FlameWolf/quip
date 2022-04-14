"use strict";

const apiBaseUrl = "https://quip-rest-api.herokuapp.com/";
const authBaseUrl = `${apiBaseUrl}auth/`;
const refreshTokenUrl = `${authBaseUrl}refresh-token`;
const authCacheName = "AUTH_CACHE";
const authChannelName = "AUTH_CHANNEL";
const setAuthDataAction = "SET_AUTH_DATA";
const getAuthDataAction = "GET_AUTH_DATA";
const requestInitOptions = {
	credentials: "include",
	mode: "cors"
};
const defaultAuthData = {
	userId: undefined,
	handle: undefined,
	token: undefined,
	createdAt: undefined,
	expiresIn: undefined
};
const authData = Object.assign({}, defaultAuthData);
const authChannel = new BroadcastChannel(authChannelName);

const validateToken = value => {
	const authToken = value.token;
	if (authToken) {
		const createdDate = new Date(value.createdAt);
		const expiryDate = createdDate.setMilliseconds(createdDate.getMilliseconds() + parseInt(value.expiresIn));
		if (new Date() < expiryDate) {
			return true;
		}
	}
	return false;
};

const refreshToken = async value => {
	return await fetch(refreshTokenUrl, {
		headers: {
			"X-UID": value.userId,
			"X-Slug": value.handle
		},
		...requestInitOptions
	});
};

const setToken = async value => {
	Object.assign(authData, value);
	const tokenCache = await caches.open(authCacheName);
	await tokenCache.put(
		"/",
		new Response(JSON.stringify(authData), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		})
	);
};

const getToken = async () => {
	const tokenCache = await caches.open(authCacheName);
	const cachedToken = await tokenCache.match("/");
	Object.assign(authData, cachedToken ? await cachedToken.json() : defaultAuthData);
};

const interceptAuthRequest = async request => {
	const authCache = await caches.open(authCacheName);
	const response = await fetch(request, requestInitOptions);
	const status = response.status;
	await dispatch({
		action: setAuthDataAction,
		payload: status === 200 || status === 201 ? await response.clone().json() : {}
	});
	return response;
};

const interceptApiRequest = async request => {
	if (!validateToken(authData)) {
		const response = await refreshToken(authData);
		await dispatch({
			action: setAuthDataAction,
			payload: response.status === 200 ? await response.json() : defaultAuthData
		});
	}
	const authToken = authData.token;
	if (authToken) {
		const headers = new Headers(request.headers);
		headers.set("Authorization", `Bearer ${authToken}`);
		return await fetch(new Request(request, { headers, ...requestInitOptions }));
	}
	return await fetch(request, requestInitOptions);
};

const dispatch = async ({ action, payload }) => {
	switch (action) {
		case setAuthDataAction:
			await setToken(payload);
			break;
		case getAuthDataAction:
			await getToken();
			break;
		default:
			break;
	}
	authChannel.postMessage(authData);
};

self.addEventListener("message", async event => await dispatch(event.data));

self.addEventListener("fetch", event => {
	const request = event.request;
	const url = request.url;
	if (url.startsWith(authBaseUrl)) {
		event.respondWith(interceptAuthRequest(request));
	} else if (url.startsWith(apiBaseUrl)) {
		event.respondWith(interceptApiRequest(request));
	}
});
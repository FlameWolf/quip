"use strict";

// import { apiBaseUrl, authBaseUrl, authCacheName, authChannelName, getAuthDataAction, refreshToken, requestInitOptions, setAuthDataAction, validateToken } from "./auth-library";
const apiBaseUrl = "https://localhost:4096/";
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

const validateToken = authData => {
	const authToken = authData.token;
	if (authToken) {
		const createdDate = new Date(authData.createdAt);
		const expiryDate = createdDate.setMilliseconds(createdDate.getMilliseconds() + parseInt(authData.expiresIn));
		if (new Date() < expiryDate) {
			return true;
		}
	}
	return false;
};

const refreshToken = async authData => {
	return await fetch(refreshTokenUrl, {
		headers: {
			"X-UID": authData.userId,
			"X-Slug": authData.handle
		},
		...requestInitOptions
	});
};

const authData = {
	userId: undefined,
	handle: undefined,
	token: undefined,
	createdAt: undefined,
	expiresIn: undefined
};
const authChannel = new BroadcastChannel(authChannelName);

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
	Object.assign(authData, await cachedToken.json());
};

const interceptAuthRequest = async request => {
	const authCache = await caches.open(authCacheName);
	const response = await fetch(request, requestInitOptions);
	const status = response.status;
	if (status === 200 || status === 201) {
		authCache.put("/", response.clone());
	} else {
		authCache.delete("/");
	}
	return response;
};

const interceptApiRequest = async request => {
	if (!validateToken(authData)) {
		const response = await refreshToken(authData);
		self.postMessage({
			action: setAuthDataAction,
			payload:
				response.status === 200
					? await response.json()
					: {
							userId: undefined,
							handle: undefined,
							token: undefined,
							createdAt: undefined,
							expiresIn: undefined
					  }
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

self.addEventListener("message", async event => {
	const { action, payload } = event.data;
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
});

self.addEventListener("fetch", event => {
	const request = event.request;
	const url = request.url;
	if (url.startsWith(authBaseUrl)) {
		event.respondWith(interceptAuthRequest(request));
	} else if (url.startsWith(apiBaseUrl)) {
		event.respondWith(interceptApiRequest(request));
	}
});
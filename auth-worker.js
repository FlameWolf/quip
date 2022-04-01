"use strict";

import { apiBaseUrl, authBaseUrl, authCacheName, authChannelName, getAuthDataAction, refreshToken, requestInitOptions, setAuthDataAction, validateToken } from "./auth-library";

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
		authCache.put("/", response);
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
			payload: (
				response.status === 200
				? await response.json()
				: {
					userId: undefined,
					handle: undefined,
					token: undefined,
					createdAt: undefined,
					expiresIn: undefined
				}
			)
		});
	}
	const authToken = authData.token;
	if (authToken) {
		return await fetch(
			new Request(request, {
				headers: {
					...request.headers,
					Authorization: `Bearer ${authToken}`
				},
				...requestInitOptions
			})
		);
	}
	return await fetch(request, requestInitOptions);
};

self.addEventListener("message", async event => {
	const { action, payload } = event.data;
	switch (action) {
		case setAuthDataAction:
			setToken(payload);
			break;
		case getAuthDataAction:
			getToken();
			break;
		default:
			break;
	}
	authChannel.postMessage(authData);
});

self.addEventListener("fetch", async event => {
	const request = event.request;
	const url = request.url;
	if (url.startsWith(authBaseUrl)) {
		return event.respondWith(await interceptAuthRequest(request));
	}
	if (url.startsWith(apiBaseUrl)) {
		return event.respondWith(await interceptApiRequest(request));
	}
});
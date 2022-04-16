"use strict";

const env = {
	apiBaseUrl: undefined,
	authBaseUrl: undefined,
	refreshTokenUrl: undefined,
	authCacheName: undefined,
	authChannelName: undefined,
	setAuthDataAction: undefined,
	getAuthDataAction: undefined
};
const requestInitOptions = {
	credentials: "include",
	mode: "cors"
};
const refreshTokenKey = "refreshToken";
const authTokenKey = "authToken";
const defaultAuthData = {
	userId: undefined,
	handle: undefined,
	[authTokenKey]: undefined,
	[refreshTokenKey]: undefined,
	createdAt: undefined,
	expiresIn: undefined
};
const authData = Object.assign({}, defaultAuthData);
const authChannel = new BroadcastChannel(env.authChannelName);

const validateToken = value => {
	if (value[authTokenKey]) {
		const createdDate = new Date(value.createdAt);
		const expiryDate = createdDate.setMilliseconds(createdDate.getMilliseconds() + parseInt(value.expiresIn));
		if (new Date() < expiryDate) {
			return true;
		}
	}
	return false;
};

const refreshToken = async value => {
	return await fetch(env.refreshTokenUrl, {
		method: "POST",
		body: JSON.stringify({
			refreshToken: value.refreshToken
		}),
		headers: {
			"X-UID": value.userId,
			"X-Slug": value.handle,
			"Content-Type": "application/json"
		},
		...requestInitOptions
	});
};

const setAuthData = async value => {
	Object.assign(authData, value);
	const authCache = await caches.open(env.authCacheName);
	await authCache.put(
		"/",
		new Response(JSON.stringify(authData), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		})
	);
};

const getAuthData = async () => {
	const authCache = await caches.open(env.authCacheName);
	const cachedAuthData = await authCache.match("/");
	Object.assign(authData, cachedAuthData ? await cachedAuthData.json() : defaultAuthData);
};

const interceptAuthRequest = async request => {
	const response = await fetch(request, requestInitOptions);
	const status = response.status;
	await dispatch({
		action: env.setAuthDataAction,
		payload: status === 200 || status === 201 ? await response.json() : defaultAuthData
	});
	return new Response("", { status });
};

const interceptApiRequest = async request => {
	if (!validateToken(authData)) {
		const response = await refreshToken(authData);
		await dispatch({
			action: env.setAuthDataAction,
			payload: response.status === 200 ? await response.json() : defaultAuthData
		});
	}
	const authToken = authData[authTokenKey];
	if (authToken) {
		const headers = new Headers(request.headers);
		headers.set("Authorization", `Bearer ${authToken}`);
		return await fetch(new Request(request, { headers, ...requestInitOptions }));
	}
	return await fetch(request, requestInitOptions);
};

const dispatch = async ({ action, payload }) => {
	switch (action) {
		case env.setAuthDataAction:
			await setAuthData(payload);
			break;
		case env.getAuthDataAction:
			await getAuthData();
			break;
		default:
			Object.assign(env, payload);
			return;
	}
	if (refreshTokenKey in payload) {
		delete payload[refreshTokenKey];
	}
	if (authTokenKey in payload) {
		payload.token = payload[authTokenKey];
		delete payload[authTokenKey];
	}
	authChannel.postMessage(payload);
};

self.addEventListener("message", async event => await dispatch(event.data));

self.addEventListener("fetch", event => {
	const request = event.request;
	const url = request.url;
	if (url.startsWith(env.authBaseUrl)) {
		event.respondWith(interceptAuthRequest(request));
	} else if (url.startsWith(env.apiBaseUrl)) {
		event.respondWith(interceptApiRequest(request));
	}
});
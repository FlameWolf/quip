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
	authToken: undefined,
	refreshToken: undefined,
	createdAt: undefined,
	expiresIn: undefined
};
const authData = Object.assign({}, defaultAuthData);
const authChannel = new BroadcastChannel(authChannelName);

const validateToken = value => {
	if (value.authToken) {
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
		method: "POST",
		body: JSON.stringify({
			refreshToken: value.refreshToken
		}),
		headers: {
			"X-UID": value.userId,
			"X-Slug": value.handle
		},
		...requestInitOptions
	});
};

const setAuthData = async value => {
	Object.assign(authData, value);
	const authCache = await caches.open(authCacheName);
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
	const authCache = await caches.open(authCacheName);
	const cachedAuthData = await authCache.match("/");
	Object.assign(authData, cachedAuthData ? await cachedAuthData.json() : defaultAuthData);
};

const interceptAuthRequest = async request => {
	const response = await fetch(request, requestInitOptions);
	const status = response.status;
	const payload = status === 200 || status === 201 ? await response.json() : defaultAuthData;
	await dispatch({
		action: setAuthDataAction,
		payload
	});
	delete payload.refreshToken;
	payload.token = payload.authToken;
	delete payload.authToken;
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"Content-Type": "application/json"
		}
	});
};

const interceptApiRequest = async request => {
	if (!validateToken(authData)) {
		const response = await refreshToken(authData);
		await dispatch({
			action: setAuthDataAction,
			payload: response.status === 200 ? await response.json() : defaultAuthData
		});
	}
	const authToken = authData.authToken;
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
			await setAuthData(payload);
			break;
		case getAuthDataAction:
			await getAuthData();
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
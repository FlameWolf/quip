"use strict";

const cacheVersion = "v1";
const precacheName = `quip-precache-${cacheVersion}`;
const staticCacheName = `quip-static-${cacheVersion}`;
const assetCacheName = `quip-assets-${cacheVersion}`;
const externalCacheName = `quip-external-${cacheVersion}`;
const offlineUrl = "/index.html";

const ownedCaches = [precacheName, staticCacheName, assetCacheName, externalCacheName];

const precacheUrls = ["/", offlineUrl, "/manifest.json", "/src/assets/favicon.svg"];

const apiHostHints = ["onrender.com", "firebaseio.com", "googleapis.com/identitytoolkit", "cloudfunctions.net"];

const maxAssetEntries = 80;
const maxExternalEntries = 60;

const envKey = "env";
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
const defaultAuthData = {
	userId: undefined,
	handle: undefined,
	authToken: undefined,
	refreshToken: undefined,
	createdAt: undefined,
	expiresIn: undefined
};
const authData = Object.assign({}, defaultAuthData);

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

const setEnv = async value => {
	Object.assign(env, value);
	const envCache = await caches.open(envKey);
	await envCache.put(
		"/",
		new Response(JSON.stringify(env), {
			status: 200,
			headers: {
				"Content-Type": "application/json"
			}
		})
	);
};

const getEnv = async () => {
	const envCache = await caches.open(envKey);
	const cachedEnvData = await envCache.match("/");
	Object.assign(env, cachedEnvData ? await cachedEnvData.json() : {});
};

const setAuthData = async value => {
	if (!authData.authToken && env.authCacheName) {
		await getAuthData();
	}
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
	Object.assign(authData, cachedAuthData ? await cachedAuthData.json() : {});
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
		case env.setAuthDataAction:
			await setAuthData(payload);
			break;
		case env.getAuthDataAction:
			await getAuthData();
			break;
		default:
			await setEnv(payload);
			return;
	}
	const authChannel = new BroadcastChannel(env.authChannelName);
	authChannel.postMessage(
		Object.assign(
			{},
			{
				userId: authData.userId,
				handle: authData.handle,
				token: authData.authToken,
				createdAt: authData.createdAt,
				expiresIn: authData.expiresIn
			}
		)
	);
	authChannel.close();
};

const isNavigationRequest = request => request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));

const isHashedBuildAsset = url => /\/assets\/.+\.[a-f0-9]{6,}\.(?:js|mjs|css)$/i.test(url.pathname);

const isStaticScriptOrStyle = url => /\.(?:js|mjs|css)$/i.test(url.pathname);

const isImageOrFont = url => /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|eot)$/i.test(url.pathname);

const looksLikeApiRequest = url => {
	if (apiHostHints.some(hint => url.host.includes(hint))) {
		return true;
	}
	return /\/(?:api|auth|graphql)(?:\/|$)/i.test(url.pathname);
};

const trimCache = async (cacheName, maxEntries) => {
	const cache = await caches.open(cacheName);
	const keys = await cache.keys();
	if (keys.length <= maxEntries) {
		return;
	}
	const overflow = keys.length - maxEntries;
	for (let index = 0; index < overflow; index++) {
		await cache.delete(keys[index]);
	}
};

const cacheFirst = async (request, cacheName) => {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) {
		return cached;
	}
	const response = await fetch(request);
	if (response.ok || response.type === "opaque") {
		cache.put(request, response.clone()).catch(() => {});
	}
	return response;
};

const staleWhileRevalidate = async (request, cacheName, maxEntries) => {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	const networkPromise = fetch(request)
		.then(response => {
			if (response.ok || response.type === "opaque") {
				cache
					.put(request, response.clone())
					.then(() => trimCache(cacheName, maxEntries))
					.catch(() => {});
			}
			return response;
		})
		.catch(() => cached);
	return cached || networkPromise;
};

const networkFirstNavigation = async request => {
	const cache = await caches.open(precacheName);
	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(offlineUrl, response.clone()).catch(() => {});
		}
		return response;
	} catch {
		const cached = (await cache.match(request)) || (await cache.match(offlineUrl)) || (await cache.match("/"));
		if (cached) {
			return cached;
		}
		return new Response("<h1>Offline</h1><p>The application is not available right now.</p>", {
			status: 503,
			statusText: "Service Unavailable",
			headers: { "Content-Type": "text/html; charset=utf-8" }
		});
	}
};

const handleRequest = async request => {
	const url = new URL(request.url);

	if (!env.authCacheName) {
		await getEnv();
	}

	if (env.authBaseUrl && url.href.startsWith(env.authBaseUrl)) {
		if (!authData.authToken) {
			await getAuthData();
		}
		return interceptAuthRequest(request);
	}
	if (env.apiBaseUrl && url.href.startsWith(env.apiBaseUrl)) {
		if (!authData.authToken) {
			await getAuthData();
		}
		return interceptApiRequest(request);
	}

	if (looksLikeApiRequest(url)) {
		return fetch(request);
	}

	if (request.method !== "GET") {
		return fetch(request);
	}

	if (isNavigationRequest(request)) {
		return networkFirstNavigation(request);
	}

	if (url.origin === self.location.origin) {
		if (isHashedBuildAsset(url)) {
			return cacheFirst(request, staticCacheName);
		}
		if (isStaticScriptOrStyle(url)) {
			return staleWhileRevalidate(request, staticCacheName, maxAssetEntries);
		}
		if (isImageOrFont(url)) {
			return staleWhileRevalidate(request, assetCacheName, maxAssetEntries);
		}
		return staleWhileRevalidate(request, assetCacheName, maxAssetEntries);
	}

	return staleWhileRevalidate(request, externalCacheName, maxExternalEntries);
};

self.addEventListener("install", event => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(precacheName);
			await Promise.all(
				precacheUrls.map(async url => {
					try {
						await cache.add(new Request(url, { cache: "reload" }));
					} catch {}
				})
			);
			await self.skipWaiting();
		})()
	);
});

self.addEventListener("activate", event => {
	event.waitUntil(
		(async () => {
			const cacheNames = await caches.keys();
			await Promise.all(cacheNames.filter(name => name.startsWith("quip-") && !ownedCaches.includes(name)).map(name => caches.delete(name)));
			if ("navigationPreload" in self.registration) {
				try {
					await self.registration.navigationPreload.enable();
				} catch {}
			}
			await self.clients.claim();
		})()
	);
});

self.addEventListener("fetch", event => {
	const request = event.request;
	const url = new URL(request.url);
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		return;
	}
	event.respondWith(handleRequest(request));
});

self.addEventListener("message", event => {
	const data = event.data;
	if (!data) {
		return;
	}
	if (data.type === "SKIP_WAITING") {
		self.skipWaiting();
		return;
	}
	if (data.type === "CLEAR_CACHES") {
		event.waitUntil(Promise.all(ownedCaches.map(name => caches.delete(name))));
		return;
	}
	event.waitUntil(dispatch(data));
});
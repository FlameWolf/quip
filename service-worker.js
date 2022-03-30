const authCacheName = "auth";
const refreshTokenUrl = "https://localhost:4096/auth/refresh-token";

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

const interceptRefreshTokenRequest = async request => {
	const authCache = await caches.open(authCacheName);
	const cachedReponse = await authCache.match(request);
	if (cachedReponse) {
		const authData = await cachedReponse.json();
		if (validateToken(authData)) {
			return new Response(JSON.stringify(authData), {
				status: 200,
				headers: {
					"Content-Type": "application/json"
				}
			});
		}
	}
	const response = await fetch(request);
	const status = response.status;
	if (status === 200) {
		authCache.put(request, response);
	} else {
		authCache.delete(request);
	}
	return response;
};

self.addEventListener("fetch", async event => {
	const request = event.request;
	if (request.url === refreshTokenUrl) {
		return event.respondWith(await interceptRefreshTokenRequest(request));
	}
});
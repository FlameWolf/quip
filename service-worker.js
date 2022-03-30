const authCacheName = "auth";
const authBaseUrl = "https://localhost:4096/auth/";

const verifyAuthToken = authData => {
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

const interceptAuthResponse = async request => {
	const authCache = await caches.open(authCacheName);
	const cachedReponse = await authCache.match(request);
	if (cachedReponse) {
		const authData = await cachedReponse.json();
		if (verifyAuthToken(authData)) {
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
	}
	return response;
};

self.addEventListener("fetch", async event => {
	const request = event.request;
	if (request.url.startsWith(authBaseUrl) && request.method === "GET") {
		return event.respondWith(await interceptAuthResponse(request));
	}
});
"use strict";

export const apiBaseUrl = "https://localhost:4096/";
export const authBaseUrl = `${apiBaseUrl}auth/`;
export const refreshTokenUrl = `${authBaseUrl}refresh-token`;
export const authCacheName = "AUTH_CACHE";
export const authChannelName = "AUTH_CHANNEL";
export const setAuthDataAction = "SET_AUTH_DATA";
export const getAuthDataAction = "GET_AUTH_DATA";
export const requestInitOptions = {
	credentials: "include",
	mode: "cors"
};

export const validateToken = authData => {
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

export const refreshToken = async authData => {
	return await fetch(refreshTokenUrl, {
		headers: {
			"X-UID": authData.userId,
			"X-Slug": authData.handle
		},
		...requestInitOptions
	});
};
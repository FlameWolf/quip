/// <reference types="vite/client"/>

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;
	readonly VITE_USER_ID_COOKIE_NAME: string;
	readonly VITE_HANDLE_COOKIE_NAME: string;
	readonly VITE_AUTH_CHANNEL_NAME: string;
	readonly VITE_AUTH_CACHE_NAME: string;
	readonly VITE_SET_AUTH_DATA_ACTION: string;
	readonly VITE_GET_AUTH_DATA_ACTION: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
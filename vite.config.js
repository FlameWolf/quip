import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import Mkcert from "vite-plugin-mkcert";
import fs from "fs";

export default defineConfig({
	plugins: [solidPlugin()],
	build: {
		target: "esnext",
		polyfillDynamicImport: false
	},
	server: {
		https: {
			key: fs.readFileSync("./src/certificates/key.pem"),
			cert: fs.readFileSync("./src/certificates/cert.pem"),
			passphrase: "Pass@123"
		},
		port: +process.env.PORT || 3000
	}
});
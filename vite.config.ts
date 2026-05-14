/// <reference types="node"/>
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import fs from "fs";

export default defineConfig({
	plugins: [solidPlugin()],
	build: {
		target: "esnext"
	},
	server: {
		https: {
			key: fs.readFileSync("./src/certificates/key.pem"),
			cert: fs.readFileSync("./src/certificates/cert.pem"),
			passphrase: "Pass@123"
		},
		port: +(process.env.PORT ?? 0) || 3000
	}
});
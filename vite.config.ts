import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import stylusAlias from "vite-plugin-stylus-alias-next";
import path from "node:path";

const stylusConfig = {
	additionalData: `@import "${path.resolve(__dirname,'./app/css/mixins')}"`
}

export default defineConfig({
	
	optimizeDeps: {
		esbuildOptions: {
			target: "es2022"
		},
		include: [
			"react-use"
		]
	},
	
	ssr: {
		noExternal: [
			"react-use"
		]
	},
	
	plugins: [
		reactRouter(),
		tsconfigPaths(),
		stylusAlias(),
	],
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./app"),
		}
	},
	css: {
		modules: {
			localsConvention: "camelCase",
			generateScopedName: "[local]_[hash:base64:5]",
		},
		preprocessorOptions: {
			stylus: stylusConfig,
			styl: stylusConfig,
		}
	},
	
	server: {
		fs: {
			// Restrict files that could be served by Vite's dev server.  Accessing
			// files outside this directory list that aren't imported from an allowed
			// file will result in a 403.  Both directories and files can be provided.
			// If you're comfortable with Vite's dev server making any file within the
			// project root available, you can remove this option.  See more:
			// https://vitejs.dev/config/server-options.html#server-fs-allow
			allow: [
				"app",
				"node_modules/react-toastify"
			],
		},
	},
	
});

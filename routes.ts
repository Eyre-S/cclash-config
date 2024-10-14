import { DefineRouteFunction } from "@remix-run/dev/dist/config/routes";

export default function defineRoutes (route: DefineRouteFunction) {
	
	route("/", "routes/index.tsx")
	
	route("/login", "routes/login.tsx")
	
	route("/dashboard", "routes/dashboard/index.tsx", () => {
		
		route(":uuid", "routes/dashboard/uuid.tsx")
		
	})
	
	route("/api", "routes/api/index.ts", () => {
		route("hello", "routes/api/hello.ts")
		route("ping", "routes/api/ping.ts")
		route("login", "routes/api/login.ts")
		route("auth/:auth", "routes/api/require-auth/index.ts", () => {
			route("check", "routes/api/require-auth/check.ts")
			route("check", "routes/api/require-auth/config-reload.ts")
			route("get/:template_name", "routes/api/require-auth/get/index.ts", () => {
				route("raw", "routes/api/require-auth/get/raw.ts")
				route("comment", "routes/api/require-auth/get/comment.ts")
				route("config", "routes/api/require-auth/get/config.ts")
			})
		})
	})
	
}

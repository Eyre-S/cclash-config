import { DefineRouteFunction } from "@remix-run/dev/dist/config/routes";

export default function defineRoutes (route: DefineRouteFunction) {
	
	route("/", "routes/index.tsx")
	
	route("/login", "routes/login.tsx")
	
	route("/templates", "routes/templates/index.tsx", () => {
		
		route(":uuid", "routes/templates/editor.tsx")
		
	})
	
	// after is API Endpoints
	route("/api", "routes/api/index.ts", () => {
		
		// universal api
		route("hello", "routes/api/hello.ts")
		route("ping", "routes/api/ping.ts")
		
		// login api for frontend login, will generate cookies
		route("login", "routes/api/login.ts")
		route("logout", "routes/api/logout.ts")
		
		// backend operator api, will not require cookies, but a token in path
		route("auth/:auth", "routes/api/require-auth/index.ts", () => {
			// check if the token is valid
			route("check", "routes/api/require-auth/check.ts")
			// for admin, reload the server config
			route("config-reload", "routes/api/require-auth/config-reload.ts")
			// do the template operators
			// defaults is the endpoint that returns only the template with upp, will NOT follow API response format
			route("get/:template_name", "routes/api/require-auth/get/index.ts", () => {
				// following are getting data endpoints, will NOT follow API response format
				route("raw", "routes/api/require-auth/get/raw.ts")
				route("comment", "routes/api/require-auth/get/comment.ts")
				route("config", "routes/api/require-auth/get/config.ts")
				// following are data operation endpoints, will follow API response format
				route("about", "routes/api/require-auth/get/about.ts")
				route("set", "routes/api/require-auth/get/set.ts")
			})
		})
		
	})
	
}

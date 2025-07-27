import { index, route, RouteConfig } from "@react-router/dev/routes";

function id (id: string) {
	return {
		id: id
	}
}

export default [
	
	index("routes/index.tsx", id("index")),
	
	route("/login", "routes/login.tsx", id("login")),
	
	route("/settings", "routes/settings/_layout.tsx", id("settings"), [
		
		index("routes/settings/_index.ts", id("settings/index")),
		route("user", "routes/settings/user.tsx", id("settings/user")),
		route("server", "routes/settings/server.tsx", id("settings/server")),
		
	]),
	
	route("/templates", "routes/templates/_layout.tsx", id("templates"), [
		
		index("routes/templates/index.tsx", id("templates/index")),
		route(":uuid", "routes/templates/_uuid/_layout.tsx", id("templates/_uuid"), [
			
			index("routes/templates/_uuid/_index.tsx", id("templates/_uuid/index")),
			route("editor", "routes/templates/_uuid/editor.tsx", id("templates/_uuid/editor")),
			route("settings", "routes/templates/_uuid/settings.tsx", id("templates/_uuid/settings")),
			route("preview", "routes/templates/_uuid/preview.tsx", id("templates/_uuid/preview")),
			
		]),
		
	]),
	
	// after is API Endpoints
	
	route("/api", "routes/api/index.ts", id("api"), [
		
		// universal api
		route("hello", "routes/api/hello.ts", id("api/hello")),
		route("ping", "routes/api/hello.ts", id("api/ping")),
		
		// login api for frontend login, will generate cookies
		route("login", "routes/api/login.ts", id("api/login")),
		route("logout", "routes/api/logout.ts", id("api/logout")),
		
		// backend operator api, will not require cookies, but a token in path
		route("auth/:auth", "routes/api/require-auth/index.ts", id("api/_auth"), [
			
			// check if the token is valid
			route("check", "routes/api/require-auth/check.ts", id("api/_auth/check")),
			// for admin, reload the server config
			route("config-reload", "routes/api/require-auth/config-reload.ts", id("api/_auth/config-reload")),
			
			// do the template operators
			route("get_create", "routes/api/require-auth/get_create.ts", id("api/_auth/get_create")),
			// defaults is the endpoint that returns only the template with upp, will NOT follow API response format
			route("get/:template_name", "routes/api/require-auth/get/index.ts", id("api/_auth/get/_template"), [
				// following are getting data endpoints, will NOT follow API response format
				route("raw", "routes/api/require-auth/get/raw.ts", id("api/_auth/get/_template/raw")),
				route("comment", "routes/api/require-auth/get/comment.ts", id("api/_auth/get/_template/comment")),
				route("config", "routes/api/require-auth/get/config.ts", id("api/_auth/get/_template/config")),
				// following are data operation endpoints, will follow API response format
				route("about", "routes/api/require-auth/get/about.ts", id("api/_auth/get/_template/about")),
				route("set", "routes/api/require-auth/get/set.ts", id("api/_auth/get/_template/set")),
				route("delete", "routes/api/require-auth/get/delete.ts", id("api/_auth/get/_template/delete")),
			]),
			
		]),
		
	]),
	
] satisfies RouteConfig

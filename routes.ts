import { DefineRouteFunction, DefineRouteOptions } from "@remix-run/dev/dist/config/routes";

export function routeKeys (id: string, index?: 'index'): DefineRouteOptions {
	return {
		id: id,
		index: index ? true : undefined
	}
}

export default function defineRoutes (route: DefineRouteFunction) {
	
	route("/", "routes/index.tsx", routeKeys('index', 'index'))
	
	route("/login", "routes/login.tsx", routeKeys('login'))
	
	route("/settings", "routes/settings/_layout.tsx", routeKeys('settings'), () => {
		
		route("", "routes/settings/_index.ts", routeKeys('settings/index', 'index'))
		route("user", "routes/settings/user.tsx", routeKeys('settings/user'))
		route("server", "routes/settings/server.tsx", routeKeys('settings/server'))
		
	})
	
	route("/templates", "routes/templates/_layout.tsx", routeKeys('templates'), () => {
		
		route("", "routes/templates/index.tsx", routeKeys('templates/index', 'index'))
		route(":uuid", "routes/templates/_uuid/_layout.tsx", routeKeys('templates/_uuid'), () => {
			
			route("", "routes/templates/_uuid/_index.tsx", routeKeys('templates/_uuid/index', 'index'))
			route("editor", "routes/templates/_uuid/editor.tsx", routeKeys('templates/_uuid/editor'))
			route("settings", "routes/templates/_uuid/settings.tsx", routeKeys('templates/_uuid/settings'))
			route("preview", "routes/templates/_uuid/preview.tsx", routeKeys('templates/_uuid/preview'))
			
		})
		
	})
	
	// after is API Endpoints
	route("/api", "routes/api/index.ts", routeKeys('api'), () => {
		
		// universal api
		route("hello", "routes/api/hello.ts", routeKeys('api/hello'))
		route("ping", "routes/api/hello.ts", routeKeys('api/ping'))
		
		// login api for frontend login, will generate cookies
		route("login", "routes/api/login.ts", routeKeys('api/login'))
		route("logout", "routes/api/logout.ts", routeKeys('api/logout'))
		
		// backend operator api, will not require cookies, but a token in path
		route("auth/:auth", "routes/api/require-auth/index.ts", routeKeys('api/_auth'), () => {
			
			// check if the token is valid
			route("check", "routes/api/require-auth/check.ts", routeKeys('api/_auth/check'))
			// for admin, reload the server config
			route("config-reload", "routes/api/require-auth/config-reload.ts", routeKeys('api/_auth/config-reload'))
			
			// do the template operators
			route("get_create", "routes/api/require-auth/get_create.ts", routeKeys('api/_auth/get_create'))
			// defaults is the endpoint that returns only the template with upp, will NOT follow API response format
			route("get/:template_name", "routes/api/require-auth/get/index.ts", routeKeys('api/_auth/get/_template'), () => {
				// following are getting data endpoints, will NOT follow API response format
				route("raw", "routes/api/require-auth/get/raw.ts", routeKeys('api/_auth/get/_template/raw'))
				route("comment", "routes/api/require-auth/get/comment.ts", routeKeys('api/_auth/get/_template/comment'))
				route("config", "routes/api/require-auth/get/config.ts", routeKeys('api/_auth/get/_template/config'))
				// following are data operation endpoints, will follow API response format
				route("about", "routes/api/require-auth/get/about.ts", routeKeys('api/_auth/get/_template/about'))
				route("set", "routes/api/require-auth/get/set.ts", routeKeys('api/_auth/get/_template/set'))
			})
			
		})
		
	})
	
}

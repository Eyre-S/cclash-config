import { defineApiResponse, exportResponse } from "~/apis/api";

export async function loader () {
	
	return exportResponse(defineApiResponse({
		endpoints: [
			{ method: "GET", path: "hello", params: { name: "name", type: "string|undefined" } },
			{ alias_to: "hello", path: "ping" },
			{ method: "GET", path: "login", params: [{ name: "token", type: "string|undefined", description: "Server access token in raw format." }] },
			{ method: "GET", path: "logout" },
			{
				method: "GET",
				path: "auth/:token",
				path_params: [{ name: ":token", type: "string|'_cookie_'", description: "Server access token in raw format, or set _cookie_ to to check login status using cookie like the web frontend." }],
				endpoints: [
					{ method: "GET", path: "check" },
					{ method: "GET", path: "config-reload" },
					{ method: "GET", path: "get-create", body: { type: "json(ApiGetCreate_RequestDef)" } },
					{
						method: "GET",
						response: "string",
						path: "get/:template_name",
						path_params: [{ name: ":template_name", type: "string|'uuid:${UUID}'", description: "Name or alias of the template, or the template uuid with 'uuid:' prefixed." }],
						endpoints: [
							{ method: "GET", response: "string", path: "raw" },
							{ method: "GET", response: "string", path: "comment" },
							{ method: "GET", response: "string", path: "config" },
							{ method: "GET", path: "about" },
							{ method: "GET", path: "set", body: { type: "string" } },
						],
					},
				],
			},
		]
	}))
	
}

import { APIs_auths } from "./require-auth"
export default {
	auths: APIs_auths
}

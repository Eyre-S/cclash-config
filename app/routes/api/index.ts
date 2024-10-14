import { defineApiResponse, exportResponse } from "~/apis/api";

export async function loader () {
	
	return exportResponse(defineApiResponse({
		endpoints: [
			{ method: "GET", path: "hello", params: { name: "token", type: "string|undefined" } },
			{ method: "GET", path: "ping", alias_of: "hello" },
			{ method: "GET", path: "auth/:token/check" },
			{ method: "GET", path: "auth/:token/get/:template_name" },
			{ method: "GET", path: "auth/:token/get/:template_name/raw" },
			{ method: "GET", path: "auth/:token/get/:template_name/config" },
			{ method: "GET", path: "auth/:token/get/:template_name/comment" }
		]
	}))
	
}
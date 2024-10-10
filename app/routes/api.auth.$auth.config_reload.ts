import { LoaderFunctionArgs } from "@remix-run/node";
import { ZodError } from "zod";
import config from "~/.server/config";
import { API_RESPONSE_UNAUTHORIZED, defineApiResponse, exportResponse } from "~/apis/api";
import { guardAuthPages } from "~/apis/auth";

export async function loader (args: LoaderFunctionArgs) {
	
	if (!guardAuthPages(args))
		return exportResponse(API_RESPONSE_UNAUTHORIZED)
	
	try {
		
		console.log("calling config reload from API endpoint")
		config.refreshConfig()
		
		return exportResponse(defineApiResponse({
			ok: true
		}))
		
	} catch (e) {
		
		if (e instanceof ZodError) {
			return exportResponse(defineApiResponse({
				ok: false,
				message: "Config schema validation failed",
				error: e
			}))
		} else if (e instanceof Error) {
			if (e.name === "SyntaxError") {
				return exportResponse(defineApiResponse({
					ok: false,
					message: "Config JSON parsing failed",
					error: e.message
				}))
			}
			return exportResponse(defineApiResponse({
				ok: false,
				message: "Internal Error",
				error: {
					name: e.name,
					message: e.message
				}
			}))
		} else {
			return exportResponse(defineApiResponse({
				ok: false,
				message: "Unknown internal error occurred",
				error: e
			}))
		}
		
	}
	
}
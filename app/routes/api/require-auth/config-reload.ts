import { LoaderFunctionArgs } from "@remix-run/node"
import { ZodError } from "zod"

import { requireApiToken } from "~/.server/auth"
import config from "~/.server/config"
import {
	defineApiErrorResponse, defineApiResponse, defineApiUniversalErrorResponse, exportResponse
} from "~/apis/api"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	try {
		
		console.log("calling config reload from API endpoint")
		config.refreshConfig()
		
		return exportResponse(defineApiResponse({
			ok: true
		}))
		
	} catch (e) {
		
		if (e instanceof ZodError) {
			return exportResponse(defineApiErrorResponse(500, "api_config_reload_zod", "Config schema validation failed", e ))
		} else if (e instanceof Error) {
			if (e.name === "SyntaxError") {
				return exportResponse(defineApiErrorResponse(
					500, "api_config_reload_json", "Config JSON parsing failed",
					{
						name: e.name,
						message: e.message,
						cause: e.cause
					}
				))
			}
		}
		
		return exportResponse(defineApiUniversalErrorResponse(e, "api_config_reload_universal"))
		
	}
	
}
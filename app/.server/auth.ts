import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { server_config } from "./config";
import { API_RESPONSE_UNAUTHORIZED, exportResponse } from "~/apis/api";
import { AuthSessionData } from "~/apis/sessions";
import { getCookieHeader, getPathOf } from "~/utils/http-helper";

export function checkToken (token: string): boolean {
	return token === server_config.token
}

export function requireApiToken (args: LoaderFunctionArgs) {
	
	const auth = args.params.auth
	if (auth !== undefined && checkToken(auth))
		return
	
	throw exportResponse(API_RESPONSE_UNAUTHORIZED)
	
}

export async function requireUILogin (request: Request): Promise<void> {
	
	const token = (await AuthSessionData.getSession(getCookieHeader(request)))
		.get("token")
	
	if (token !== undefined && checkToken(token))
		return
	
	throw redirect("/login?redirect=" + encodeURIComponent(getPathOf(request)))
	
}

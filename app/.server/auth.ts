import { LoaderFunctionArgs, redirect } from "@remix-run/node"

import { API_RESPONSE_UNAUTHORIZED, exportResponse } from "~/apis/api"
import { AuthSessionData } from "~/apis/sessions"
import { getCookieHeader, getPathOf } from "~/utils/http-helper"

import { server_config } from "./config"

export function checkToken (token: string): boolean {
	return token === server_config.token
}

export async function requireApiToken (args: LoaderFunctionArgs) {
	
	const auth = args.params.auth
	let authSucceed = false
	if (auth == '_cookie_') {
		authSucceed = await isCookieLoggedIn(args.request)
	} else {
		authSucceed = auth !== undefined && checkToken(auth)
	}
	
	if (authSucceed) return;
	
	throw exportResponse(API_RESPONSE_UNAUTHORIZED)
	
}

export async function isCookieLoggedIn (request: Request): Promise<boolean> {
	const token = (await AuthSessionData.getSession(getCookieHeader(request)))
		.get("token")
	if (token !== undefined && checkToken(token))
		return true
	return false
}

export async function requireUILogin (request: Request): Promise<void> {
	if (await isCookieLoggedIn(request))
		return
	throw redirect("/login?redirect=" + encodeURIComponent(getPathOf(request)))
}

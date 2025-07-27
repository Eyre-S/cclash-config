import { LoaderFunctionArgs, redirect } from "react-router"

import { API_RESPONSE_UNAUTHORIZED, exportResponse } from "~/apis/api"
import { AuthSessionData } from "~/apis/sessions"
import { getCookieHeader, getPathOf } from "~/utils/http-helper"

import { database } from "./database"

export function checkToken (token: string): boolean {
	
	const check = database
		.prepare("select count(*) as ok from tokens where token = ?")
		.all(token) as [{ok: number}]
	
	console.log("Token check:", check)
	return check[0].ok > 0
	
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

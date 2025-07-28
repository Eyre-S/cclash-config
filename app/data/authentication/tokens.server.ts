import { LoaderFunctionArgs } from "react-router"

import { API_RESPONSE_UNAUTHORIZED, exportResponse } from "~/apis/api"
import { database } from "../.server/database"
import { isCookieLoggedIn } from "./login.server"

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

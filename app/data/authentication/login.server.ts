import { getCookieHeader, getPathOf } from "~/utils/http-helper"
import { checkToken } from "./tokens.server"
import { AuthSessionData } from "~/apis/sessions"
import { redirect } from "react-router"

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

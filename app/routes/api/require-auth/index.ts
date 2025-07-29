import { LoaderFunctionArgs } from "react-router"

import { defineApiResponse, exportResponse } from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"

import { AuthCheckResponse } from "./check"
import { APIs_get } from "./get"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	return exportResponse(defineApiResponse({
		ok: true
	} satisfies AuthCheckResponse))
	
}


export interface API_Auths_Params {
	token: string
}
function byToken (token: string) {
	return {
		get: APIs_get({ token })
	}
}
export type APIs_Authed = ReturnType<typeof byToken>
export const APIs_auths = {
	byToken,
	byCookies: byToken("_cookie_")
}

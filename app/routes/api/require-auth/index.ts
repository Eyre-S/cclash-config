import { LoaderFunctionArgs } from "react-router"

import { requireApiToken } from "~/.server/auth"
import { defineApiResponse, exportResponse } from "~/apis/api"

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
const byCookies = byToken("_cookie_")
export const APIs_auths = {
	byToken,
	byCookies
}

import { LoaderFunctionArgs } from "@remix-run/node";
import { requireApiToken } from "~/.server/auth";
import { exportResponse, defineApiResponse } from "~/apis/api";
import { AuthCheckResponse } from "./check";

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	return exportResponse(defineApiResponse({
		ok: true
	} satisfies AuthCheckResponse))
	
}


import { APIs_get } from "./get";
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

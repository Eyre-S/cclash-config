import { LoaderFunctionArgs } from "react-router"

import { defineApiResponse, exportResponse } from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"

export interface AuthCheckResponse {
	ok: boolean
}

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	return exportResponse(defineApiResponse({
		ok: true
	} satisfies AuthCheckResponse))
	
}

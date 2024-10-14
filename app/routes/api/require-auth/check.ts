import { LoaderFunctionArgs } from "@remix-run/node";
import { requireApiToken } from "~/.server/auth";
import { defineApiResponse, exportResponse } from "~/apis/api";

export interface AuthCheckResponse {
	ok: boolean
}

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	return exportResponse(defineApiResponse({
		ok: true
	} satisfies AuthCheckResponse))
	
}

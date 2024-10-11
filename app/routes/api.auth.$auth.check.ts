import { LoaderFunctionArgs } from "@remix-run/node";
import { guardAuthPages } from "~/.server/auth";
import { API_RESPONSE_UNAUTHORIZED, defineApiResponse, exportResponse } from "~/apis/api";

export interface AuthCheckResponse {
	ok: boolean
}

export async function loader (args: LoaderFunctionArgs) {
	
	if (!guardAuthPages(args))
		return exportResponse(API_RESPONSE_UNAUTHORIZED)
	
	return exportResponse(defineApiResponse({
		ok: true
	} satisfies AuthCheckResponse))
	
}
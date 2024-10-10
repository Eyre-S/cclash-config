import { LoaderFunctionArgs } from "@remix-run/node";
import { API_RESPONSE_UNAUTHORIZED, defineApiResponse, exportResponse } from "~/apis/api";
import { guardAuthPages } from "~/apis/auth";

export async function loader (args: LoaderFunctionArgs) {
	
	if (!guardAuthPages(args))
		return exportResponse(API_RESPONSE_UNAUTHORIZED)
	
	return exportResponse(defineApiResponse({
		ok: true
	}))
	
}
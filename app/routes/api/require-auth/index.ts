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
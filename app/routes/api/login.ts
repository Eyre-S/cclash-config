import { LoaderFunctionArgs } from "@remix-run/node";
import { checkToken } from "~/.server/auth";
import { defineApiResponse, exportResponse } from "~/apis/api";
import { AuthSessionData } from "~/apis/sessions";
import { getSearchParams } from "~/utils/http-helper";

export interface LoginResults {
	ok: boolean
}

export async function loader (args: LoaderFunctionArgs) {
	
	const params = getSearchParams(args.request)
	const token = params.get("token")
	if (token !== null && checkToken(token)) {
		
		const session = await AuthSessionData.getSession()
		session.set("token", token)
		return exportResponse(defineApiResponse({
			ok: true
		} satisfies LoginResults), {
			"Set-Cookie": await AuthSessionData.commitSession(session)
		});
		
	}
	
	return exportResponse(defineApiResponse({
		ok: false
	} satisfies LoginResults));
	
}
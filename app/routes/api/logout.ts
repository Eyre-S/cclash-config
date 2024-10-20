import { LoaderFunctionArgs } from "@remix-run/node";
import { checkToken } from "~/.server/auth";
import { defineApiResponse, exportResponse } from "~/apis/api";
import { AuthSessionData } from "~/apis/sessions";
import { getSearchParams } from "~/utils/http-helper";
import { LoginResults } from "./login";

export async function loader (args: LoaderFunctionArgs) {
	
	const session = await AuthSessionData.getSession()
	return exportResponse(defineApiResponse({
		ok: true
	} satisfies LoginResults), {
		"Set-Cookie": await AuthSessionData.destroySession(session)
	});
	
}
import { LoaderFunctionArgs } from "@remix-run/node";
import { checkToken } from "~/.server/auth";
import cookies from "./cookies";

export function guardAuthPages (args: LoaderFunctionArgs): boolean {
	
	const auth = args.params.auth
	if (auth !== undefined) {
		return checkToken(auth)
	} else {
		return false
	}
	
}

export async function validateLogin (request: Request): Promise<boolean> {
	
	const token = await cookies.token.parse(request.headers.get("Cookie"))
	
	if (token !== undefined) {
		return checkToken(token)
	} else {
		return false
	}
	
}

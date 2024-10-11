import { LoaderFunctionArgs } from "@remix-run/node";
import { server_config } from "./config";
import cookies from "~/apis/cookies";

export function checkToken (token: string): boolean {
	return token === server_config.token
}

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

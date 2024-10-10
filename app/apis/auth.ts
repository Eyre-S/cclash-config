import { LoaderFunctionArgs } from "@remix-run/node";
import { checkToken } from "~/.server/auth";

export function guardAuthPages (args: LoaderFunctionArgs): boolean {
	
	const auth = args.params.auth
	if (auth !== undefined) {
		return checkToken(auth)
	} else {
		return false
	}
	
}
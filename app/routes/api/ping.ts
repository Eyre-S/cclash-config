import { LoaderFunctionArgs } from "@remix-run/node";
import { loader as helloLoader } from "./hello"

export async function loader(params: LoaderFunctionArgs) {
	return helloLoader(params)
}

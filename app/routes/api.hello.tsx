import { LoaderFunctionArgs } from "@remix-run/node";
import { defineApiResponse, exportResponse } from "~/apis/api";
import { it } from "~/utils/fp";

export async function loader({ request }: LoaderFunctionArgs) {
	
	const searchParams = new URL(request.url).searchParams
	const name = searchParams.get("name")
	
	const hello_text: string = it(() => {
		if (name === undefined) {
			return "Hello, World!"
		} else {
			return `Hello, ${name}!`
		}
	})
	
	return exportResponse(defineApiResponse({
		response: hello_text
	}))
	
}

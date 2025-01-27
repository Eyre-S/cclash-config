import { LoaderFunctionArgs } from "@remix-run/node"
import { getClientIPAddress } from "remix-utils/get-client-ip-address"

import { defineApiResponse, exportResponse } from "~/apis/api"
import { it } from "~/utils/fp"

export interface HelloResponse {
	hi: string
	requestor: {
		ip: string | null
		'user-agent': string | null
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	
	const searchParams = new URL(request.url).searchParams
	const name = searchParams.get("name")
	
	const hello_text: string = it(() => {
		if (name == undefined) {
			return "Hello, World!"
		} else {
			return `Hello, ${name}!`
		}
	})
	
	return exportResponse(defineApiResponse({
		hi: hello_text,
		requestor: {
			ip: getClientIPAddress(request.headers),
			'user-agent': request.headers.get('user-agent')
		}
	} satisfies HelloResponse))
	
}

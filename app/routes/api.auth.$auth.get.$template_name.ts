import { LoaderFunctionArgs } from "@remix-run/node";
import { readTemplate } from "~/.server/templates/template";
import { API_RESPONSE_UNAUTHORIZED, defineApiErrorResponse, defineApiResponse, exportResponse } from "~/apis/api";
import { guardAuthPages } from "~/.server/auth";
import upp from "uni-preprocessor"

export async function loader (args: LoaderFunctionArgs) {
	
	if (!guardAuthPages(args))
		return exportResponse(API_RESPONSE_UNAUTHORIZED)
	
	const template_name = args.params.template_name as string
	const template = readTemplate(template_name)
	
	if (template == null) {
		return exportResponse(defineApiErrorResponse(
			404, "api_template_notfound", "Template with such name is not found.",
			{
				requesting_template_name: template_name
			}
		))
	} else {
		
		const targets_params = new URL(args.request.url).searchParams.get("target")
		const targets = targets_params == null ? [] : targets_params.split(/,| /).map((x) => x.trim())
		
		const processed = upp.ifdef_js.process_string(
			template, targets
		)
		
		return new Response(
			processed[0],
			{
				headers: {
					"Content-Type": "text/plain"
				}
			}
		)
		
	}
	
}
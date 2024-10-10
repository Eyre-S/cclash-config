import { LoaderFunctionArgs } from "@remix-run/node";
import { readTemplate } from "~/.server/templates/template";
import { API_RESPONSE_UNAUTHORIZED, defineApiResponse, exportResponse } from "~/apis/api";
import { guardAuthPages } from "~/apis/auth";

export async function loader (args: LoaderFunctionArgs) {
	
	if (!guardAuthPages(args))
		return exportResponse(API_RESPONSE_UNAUTHORIZED)
	
	const template_name = args.params.template_name as string
	const template = readTemplate(template_name)
	
	if (template == null) {
		return exportResponse(defineApiResponse({
			ok: false,
			template: template_name,
			message: "Template not found",
		}))
	} else {
		
		return new Response(
			template,
			{
				headers: {
					"Content-Type": "text/plain"
				}
			}
		)
		
	}
	
}
import { LoaderFunctionArgs } from "@remix-run/node";
import { readTemplateComment } from "~/.server/templates/template";
import { API_RESPONSE_UNAUTHORIZED, defineApiErrorResponse, defineApiResponse, exportResponse } from "~/apis/api";
import { guardAuthPages } from "~/.server/auth";

export async function loader (args: LoaderFunctionArgs) {
	
	if (!guardAuthPages(args))
		return exportResponse(API_RESPONSE_UNAUTHORIZED)
	
	const template_name = args.params.template_name as string
	const template = readTemplateComment(template_name)
	
	if (template == null) {
		return exportResponse(defineApiErrorResponse(
			404, "api_template_notfound_comments", "Template with such name is not found.",
			{
				requesting_template_name: template_name
			}
		))
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
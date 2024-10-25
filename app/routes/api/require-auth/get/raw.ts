import { LoaderFunctionArgs } from "@remix-run/node";
import { readTemplate } from "~/.server/templates/template";
import { exportResponse } from "~/apis/api";
import { requireApiToken } from "~/.server/auth";
import { defineTemplateNotFoundResponse } from "./_public";

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const template_name = args.params.template_name as string
	const template = readTemplate(template_name)
	
	if (template == null) {
		return exportResponse(defineTemplateNotFoundResponse(template_name, "raw"))
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
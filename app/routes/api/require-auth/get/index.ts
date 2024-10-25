import { LoaderFunctionArgs } from "@remix-run/node";
import { readTemplate } from "~/.server/templates/template";
import { exportResponse } from "~/apis/api";
import { requireApiToken } from "~/.server/auth";
import upp from "uni-preprocessor"
import { defineTemplateNotFoundResponse } from "./_public";

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const template_name = args.params.template_name as string
	const template = readTemplate(template_name)
	
	if (template == null) {
		return exportResponse(defineTemplateNotFoundResponse(template_name, "get"))
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
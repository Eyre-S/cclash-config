import { LoaderFunctionArgs } from "react-router"

import { requireApiToken } from "~/.server/auth"
import { readTemplateConfigs } from "~/.server/templates/template"
import { exportResponse } from "~/apis/api"

import { defineTemplateNotFoundResponse } from "./_public"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const template_name = args.params.template_name as string
	const template = readTemplateConfigs(template_name)
	
	if (template == null) {
		return exportResponse(defineTemplateNotFoundResponse(template_name, "configs"))
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

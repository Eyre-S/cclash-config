import { LoaderFunctionArgs } from "@remix-run/node"

import { requireApiToken } from "~/.server/auth"
import { readTemplateComment } from "~/.server/templates/template"
import { exportResponse } from "~/apis/api"

import { defineTemplateNotFoundResponse } from "./_public"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const template_name = args.params.template_name as string
	const template = readTemplateComment(template_name)
	
	if (template == null) {
		return exportResponse(defineTemplateNotFoundResponse(template_name, "comments"))
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
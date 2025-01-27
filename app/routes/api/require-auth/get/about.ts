import { LoaderFunctionArgs } from "@remix-run/node"

import { requireApiToken } from "~/.server/auth"
import { TemplateIndex, TemplateIndexDef } from "~/.server/templates/template"
import { defineApiResponse, exportResponse } from "~/apis/api"

import {
	defineTemplateNotFoundResponse, TemplateBaseInformation, TemplateUpdatingResponse
} from "./_public"

export interface TemplateAboutResponse extends TemplateIndexDef, TemplateBaseInformation, TemplateUpdatingResponse {}

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const templateName = args.params.template_name as string
	const template = TemplateIndex.find(templateName)
	if (template === null) {
		return exportResponse(defineTemplateNotFoundResponse(templateName, "about"))
	}
	
	return exportResponse(defineApiResponse({
		...template,
		sha1: template.getTemplateHash()
	} satisfies TemplateAboutResponse))
	
}
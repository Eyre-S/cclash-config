import { LoaderFunctionArgs } from "react-router"

import { defineApiResponse, exportResponse } from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"
import { TemplateIndexes } from "~/data/template/loader.server"
import { TemplateIndexDef } from "~/data/template/template"

import {
	defineTemplateNotFoundResponse, TemplateBaseInformation, TemplateUpdatingResponse
} from "./_public"

export interface TemplateAboutResponse extends TemplateIndexDef, TemplateBaseInformation, TemplateUpdatingResponse {}

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const templateName = args.params.template_name as string
	const template = TemplateIndexes.find(templateName)
	if (template === null) {
		return exportResponse(defineTemplateNotFoundResponse(templateName, "about"))
	}
	
	return exportResponse(defineApiResponse({
		...template,
		sha1: template.getTemplateHash()
	} satisfies TemplateAboutResponse))
	
}
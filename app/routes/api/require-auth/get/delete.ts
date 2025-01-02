import { ActionFunctionArgs } from "@remix-run/node";
import { requireApiToken } from "~/.server/auth";
import { TemplateIndex } from "~/.server/templates/template";
import { defineApiErrorResponse, defineApiResponse, defineApiUniversalErrorResponse, exportResponse } from "~/apis/api";
import { defineTemplateNotFoundResponse, TemplateBaseInformation, TemplateExtendedInformation, TemplateUpdatingResponse } from "./_public";

export interface TemplateDeleteResponse extends TemplateBaseInformation, TemplateUpdatingResponse, TemplateExtendedInformation {
	ok: boolean
}

export async function action (args: ActionFunctionArgs) {
	
	await requireApiToken(args)
	if (args.request.method !== "DELETE") {
		return exportResponse(defineApiErrorResponse(
			405, 'api_template_delete_invalid_method',
			"The HTTP method must be DELETE to delete a template."
		))
	}
	
	const templateName = args.params.template_name as string
	const template = TemplateIndex.find(templateName)
	if (template === null) {
		return exportResponse(defineTemplateNotFoundResponse(templateName, "delete"))
	}
	
	try {
		template.deleteThis()
		return exportResponse(defineApiResponse({
			ok: true,
			uuid: template.uuid,
			name: template.name,
			alias: template.alias,
			sha1: template.getTemplateHash(),
		} satisfies TemplateDeleteResponse))
	} catch (e) {
		return exportResponse(defineApiUniversalErrorResponse(e, 'api_template_delete'))
	}
	
}

import { ActionFunctionArgs } from "@remix-run/node";
import { requireApiToken } from "~/.server/auth";
import { TemplateIndex } from "~/.server/templates/template";
import { defineApiErrorResponse, defineApiResponse, defineApiUniversalErrorResponse, exportResponse } from "~/apis/api";
import { defineTemplateNotFoundResponse, TemplateBaseInformation, TemplateUpdatingResponse } from "./_public";

export interface TemplateSetResponse extends TemplateBaseInformation, TemplateUpdatingResponse {
	ok: boolean
}

export async function action (args: ActionFunctionArgs) {
	
	await requireApiToken(args)
	
	const templateName = args.params.template_name as string
	const template = TemplateIndex.find(templateName)
	if (template === null) {
		return exportResponse(defineTemplateNotFoundResponse(templateName, "set"))
	}
	
	let writingContent: string
	try {
		writingContent = await args.request.text()
	} catch (e) {
		return exportResponse(defineApiErrorResponse(
			400, 'api_template_set_request_invalid_body',
			"A text body must be assigned as the new template content.",
			{
				template: templateName
			}
		))
	}
	
	try {
		template.writeTemplate(writingContent)
		return exportResponse(defineApiResponse({
			ok: true,
			uuid: template.uuid,
			sha1: template.getTemplateHash()
		} satisfies TemplateSetResponse))
	} catch (e) {
		return exportResponse(defineApiUniversalErrorResponse(e, 'api_template_set'))
	}
	
}
import { ActionFunctionArgs } from "@remix-run/node";
import { requireApiToken } from "~/.server/auth";
import { TemplateIndex } from "~/.server/templates/template";
import { ApiResponseError, defineApiErrorResponse, defineApiResponse, defineApiUniversalErrorResponse, exportResponse } from "~/apis/api";
import { defineTemplateNotFoundResponse, TemplateBaseInformation, TemplateExtendedInformation, TemplateNotFoundErrorResponse, TemplateUpdatingResponse } from "./_public";
import { APIs_Get_Params } from ".";
import { errors } from "da4s";
import server from "~/routes/settings/server";

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
		const deletingMetadata = {
			uuid: template.uuid,
			name: template.name,
			alias: template.alias,
			sha1: template.getTemplateHash(),
		}
		await template.deleteThis()
		return exportResponse(defineApiResponse({
			ok: true,
			...deletingMetadata
		} satisfies TemplateDeleteResponse ))
	} catch (e) {
		return exportResponse(defineApiUniversalErrorResponse(e, 'api_template_delete'))
	}
	
}


export function API_delete (context: APIs_Get_Params) { return async function (cbs: {
	onSuccess: (data: TemplateDeleteResponse) => any
	onTemplateNotFound: (data: TemplateNotFoundErrorResponse) => any
	onUnknownApiError: (data: ApiResponseError<any>) => any
	onInvalidApiResponse: (data: SyntaxError) => any
	onUnknownError: (data: any) => any
	onFinally?: () => any
}) {
	try {
		const submitResult = await fetch(`/api/auth/${context.auths.token}/get/${context.template_name}/delete`, { method: 'DELETE' })
		const resultJson = await submitResult.json()
		if ('data' in resultJson) {
			const resultJsonData = resultJson.data as TemplateDeleteResponse
			cbs.onSuccess(resultJsonData)
		} else if ('e_id' in resultJson) {
			const resultError = resultJson as ApiResponseError<any>
			if (resultError.e_id === 'api_template_notfound_delete') {
				const resultErrorData = resultError.error as TemplateNotFoundErrorResponse
				cbs.onTemplateNotFound(resultErrorData)
			} else {
				cbs.onUnknownApiError(resultError)
			}
		}
	} catch (e) {
		if (e instanceof SyntaxError) {
			cbs.onInvalidApiResponse(e)
		}
		cbs.onUnknownError(e)
	} finally { if (cbs.onFinally) cbs.onFinally() }
}}

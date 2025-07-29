import { ActionFunctionArgs } from "react-router"

import {
	ApiResponseError, defineApiErrorResponse, defineApiResponse, defineApiUniversalErrorResponse,
	exportResponse
} from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"
import { TemplateIndexes } from "~/data/template/loader.server"

import {
	APIs_Get_Params, defineTemplateNotFoundResponse, TemplateBaseInformation,
	TemplateNotFoundErrorResponse, TemplateUpdatingResponse
} from "./_public"

export interface TemplateSetResponse extends TemplateBaseInformation, TemplateUpdatingResponse {
	ok: boolean
}

export async function action (args: ActionFunctionArgs) {
	
	await requireApiToken(args)
	
	const templateName = args.params.template_name as string
	const template = TemplateIndexes.find(templateName)
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
			sha1: await template.getTemplateHash()
		} satisfies TemplateSetResponse))
	} catch (e) {
		return exportResponse(defineApiUniversalErrorResponse(e, 'api_template_set'))
	}
	
}


export function API_set (context: APIs_Get_Params) { return async function (newContent: string , cbs: {
	onSuccess: (data: TemplateSetResponse) => any
	onTemplateNotFound: (data: TemplateNotFoundErrorResponse) => any
	onUnknownApiError: (data: ApiResponseError<any>) => any
	onInvalidApiResponse: (data: SyntaxError) => any
	onUnknownError: (data: any) => any
	onFinally?: () => any
}) {
	try {
		const submitResult = await fetch(`/api/auth/${context.auths.token}/get/${context.template_name}/set`, {
			method: 'POST', body: newContent, headers: {
				"Content-Type": "text/plain"
			}
		})
		const resultJson = await submitResult.json()
		if ('data' in resultJson) {
			const resultJsonData = resultJson.data as TemplateSetResponse
			cbs.onSuccess(resultJsonData)
		} else if ('e_id' in resultJson) {
			const resultError = resultJson as ApiResponseError<any>
			if (resultError.e_id === 'api_template_notfound_set') {
				const resultErrorData = resultError.error as TemplateNotFoundErrorResponse
				cbs.onTemplateNotFound(resultErrorData)
			} else {
				cbs.onUnknownApiError(resultError)
			}
		} else cbs.onUnknownError(resultJson)
	} catch (e) {
		if (e instanceof SyntaxError) {
			cbs.onInvalidApiResponse(e)
		} else cbs.onUnknownError(e)
	} finally { if (cbs.onFinally) cbs.onFinally() }
}}

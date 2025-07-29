import { LoaderFunctionArgs } from "react-router"

import { ApiResponseError, defineApiResponse, exportResponse } from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"
import { TemplateIndexes } from "~/data/template/loader.server"
import { TemplateIndexDef } from "~/data/template/template"

import {
	defineTemplateNotFoundResponse, TemplateBaseInformation, TemplateNotFoundErrorResponse, TemplateUpdatingResponse
} from "./_public"
import { APIs_Get_Params } from "./_public"

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
		sha1: await template.getTemplateHash()
	} satisfies TemplateAboutResponse))
	
}


export function API_about (context: APIs_Get_Params) { return async function (cbs: {
	onSuccess: (data: TemplateAboutResponse) => any
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
			const resultJsonData = resultJson.data as TemplateAboutResponse
			cbs.onSuccess(resultJsonData)
		} else if ('e_id' in resultJson) {
			const resultError = resultJson as ApiResponseError<any>
			if (resultError.e_id === 'api_template_notfound_delete') {
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

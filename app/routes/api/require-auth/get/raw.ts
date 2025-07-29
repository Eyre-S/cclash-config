import { LoaderFunctionArgs } from "react-router"

import { ApiResponseError, exportResponse } from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"
import { readTemplate } from "~/data/template/loader.server"

import {
	APIs_Get_Params, defineTemplateNotFoundResponse, TemplateNotFoundErrorResponse
} from "./_public"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const template_name = args.params.template_name as string
	const template = await readTemplate(template_name)
	
	if (template == null) {
		return exportResponse(defineTemplateNotFoundResponse(template_name, "raw"))
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

export function API_raw (context: APIs_Get_Params) { return async function (cbs: {
	onSuccess: (data: string) => any
	onTemplateNotFound: (data: TemplateNotFoundErrorResponse) => any
	onUnknownApiError: (data: ApiResponseError<any>) => any
	onInvalidApiResponse: (data: SyntaxError) => any
	onUnknownError: (data: any) => any
	onFinally?: () => any
}) {
	try {
		const submitResult = await fetch(`/api/auth/${context.auths.token}/get/${context.template_name}/raw`, { method: 'GET' })
		if (submitResult.ok) {
			const resultData = await submitResult.text()
			cbs.onSuccess(resultData)
		} else {
			const resultJson = await submitResult.json()
			if ('e_id' in resultJson) {
				const resultError = resultJson as ApiResponseError<any>
				if (resultError.e_id === 'api_template_notfound_raw') {
					const resultErrorData = resultError.error as TemplateNotFoundErrorResponse
					cbs.onTemplateNotFound(resultErrorData)
				} else {
					cbs.onUnknownApiError(resultError)
				}
			} else cbs.onUnknownError(resultJson)
		}
	} catch (e) {
		if (e instanceof SyntaxError) {
			cbs.onInvalidApiResponse(e)
		} else cbs.onUnknownError(e)
	} finally { if (cbs.onFinally) cbs.onFinally() }
}}

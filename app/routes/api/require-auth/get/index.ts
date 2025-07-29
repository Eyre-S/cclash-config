import { LoaderFunctionArgs } from "react-router"
import upp from "uni-preprocessor"

import { ApiResponseError, exportResponse } from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"
import { readTemplate } from "~/data/template/loader.server"

import { API_Auths_Params as APIs_Auths_Params } from "../"
import {
	APIs_Get_Params, defineTemplateNotFoundResponse, TemplateNotFoundErrorResponse
} from "./_public"
import { API_about } from "./about"
import { API_comment } from "./comment"
import { API_delete } from "./delete"
import { API_raw } from "./raw"
import { API_set } from "./set"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const template_name = args.params.template_name as string
	const template = await readTemplate(template_name)
	
	if (template == null) {
		return exportResponse(defineTemplateNotFoundResponse(template_name, "get"))
	} else {
		
		const targets_params = new URL(args.request.url).searchParams.get("target")
		const targets = targets_params == null ? [] : targets_params.split(/,| /).map((x) => x.trim())
		
		const processed = upp.ifdef_js.process_string(
			template, targets
		)
		
		return new Response(
			processed[0],
			{
				headers: {
					"Content-Type": "text/plain"
				}
			}
		)
		
	}
	
}


export function API_it (context: APIs_Get_Params) { return async function (targets: string[], cbs: {
	onSuccess: (data: string) => any
	onTemplateNotFound: (data: TemplateNotFoundErrorResponse) => any
	onUnknownApiError: (data: ApiResponseError<any>) => any
	onInvalidApiResponse: (data: SyntaxError) => any
	onUnknownError: (data: any) => any
	onFinally?: () => any
}) {
	try {
		const submitResult = await fetch(
			`/api/auth/${context.auths.token}/get/${context.template_name}?target=${encodeURIComponent(targets.join(","))}`,
			{ method: 'GET' }
		)
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

export type APIs_Get = ReturnType<ReturnType<typeof APIs_get>['byName']>
export function APIs_get (context: APIs_Auths_Params) {
	function byName (templateName: string) {
		const params = {
			auths: context,
			template_name: templateName
		} satisfies APIs_Get_Params
		return {
			_: API_it(params),
			about: API_about(params),
			raw: API_raw(params),
			set: API_set(params),
			comment: API_comment(params),
			delete: API_delete(params)
		}
	}
	function byUUID (templateUUID: string) {
		return byName("uuid:" + templateUUID)
	}
	return {
		byName, byUUID
	}
}

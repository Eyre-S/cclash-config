import { ApiResponseError, defineApiErrorResponse } from "~/apis/api"

import { API_Auths_Params } from "../"

export interface TemplateNotFoundErrorResponse {
	requesting_template_name: string
}

export interface TemplateBaseInformation {
	uuid: string
}

export interface TemplateExtendedInformation extends TemplateBaseInformation {
	name: string
	alias: string[]
}

export interface TemplateUpdatingResponse {
	sha1: string
}

export function defineTemplateNotFoundResponse (templateName: string, scopeName: string): ApiResponseError<TemplateNotFoundErrorResponse> {
	return defineApiErrorResponse(
		404, `api_template_notfound_${scopeName}`, "Template with such name is not found.",
		{
			requesting_template_name: templateName
		}
	)
}

export interface APIs_Get_Params {
	auths: API_Auths_Params,
	template_name: string
}

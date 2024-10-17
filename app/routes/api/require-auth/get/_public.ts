import { ApiResponseError, defineApiErrorResponse } from "~/apis/api"

export interface TemplateNotFoundErrorResponse {
	requesting_template_name: string
}

export interface TemplateBaseInformation {
	uuid: string
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

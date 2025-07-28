import { ActionFunctionArgs } from "react-router"
import { z, ZodError } from "zod"

import {
	defineApiErrorResponse, defineApiResponse, defineApiUniversalErrorResponse, exportResponse
} from "~/apis/api"
import { requireApiToken } from "~/data/authentication/tokens.server"
import { TemplateCreateError, TemplateIndexes } from "~/data/template/loader.server"
import { TemplateIndexDef } from "~/data/template/template"

export const ApiGetCreate_Request = z.object({
	name: z.string(),
	alias: z.string().array().default([])
})
export type ApiGetCreate_Request = z.infer<typeof ApiGetCreate_Request>
export type ApiGetCreate_RequestDef = z.input<typeof ApiGetCreate_Request>

export interface ApiGetCreate_Response_Ok {
	ok: boolean,
	new_template: TemplateIndexDef
}

export interface ApiGetCreate_Response_ECreate {
	caused: string
}

export async function action (args: ActionFunctionArgs) {
	
	await requireApiToken(args)
	
	try {
		
		const requestArgs = ApiGetCreate_Request.parse(await args.request.json())
		
		const newTemplate = TemplateIndexes.create(requestArgs.name, requestArgs.alias)
		
		return exportResponse(defineApiResponse<ApiGetCreate_Response_Ok>({
			ok: true,
			new_template: newTemplate
		}))
		
	} catch (e) {
		
		if (e instanceof TemplateCreateError) {
			return exportResponse(defineApiErrorResponse(
				400, "api_getCreate_create",
				"Cannot create new template with existing params",
				{
					caused: e.message
				} satisfies ApiGetCreate_Response_ECreate
			))
		}
		
		if (e instanceof ZodError) {
			return exportResponse(defineApiErrorResponse(400, "api_getCreate_request_jsonSchema", "Requesting JSON is not in a valid request schema.", e))
		} else if (e instanceof Error) {
			if (e.name === "SyntaxError") {
				return exportResponse(defineApiErrorResponse(
					400, "api_getCreate_request_jsonFmt", "Requesting JSON is not formatted.",
					{
						name: e.name,
						message: e.message,
						cause: e.cause
					}
				))
			}
		}
		
		return exportResponse(defineApiUniversalErrorResponse(e, "api_getCreate_universal"))
		
	}
	
}
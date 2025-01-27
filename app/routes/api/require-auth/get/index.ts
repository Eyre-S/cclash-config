import { LoaderFunctionArgs } from "@remix-run/node"
import upp from "uni-preprocessor"

import { requireApiToken } from "~/.server/auth"
import { readTemplate } from "~/.server/templates/template"
import { exportResponse } from "~/apis/api"

import { API_Auths_Params as APIs_Auths_Params } from "../"
import { defineTemplateNotFoundResponse } from "./_public"
import { API_delete } from "./delete"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireApiToken(args)
	
	const template_name = args.params.template_name as string
	const template = readTemplate(template_name)
	
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

export interface APIs_Get_Params {
	auths: APIs_Auths_Params,
	template_name: string
}
export function APIs_get (context: APIs_Auths_Params) {
	function byName (templateName: string) {
		const params = {
			auths: context,
			template_name: templateName
		}
		return {
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

import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./_layout.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { requireUILogin } from "~/.server/auth";
import { TemplateIndex, TemplateIndexDef } from "~/.server/templates/template";
import { Link, Outlet, useBeforeUnload, useLoaderData, useParams, useRevalidator } from "@remix-run/react";
import { $ } from "~/utils/reactive";
import { is, iss } from "~/utils/fp";
import { InputButton, InputText } from "~/utils/components/Inputs";
import { MouseEvent, useEffect } from "react";
import { ApiGetCreate_Request, ApiGetCreate_RequestDef, ApiGetCreate_Response_ECreate } from "../api/require-auth/get_create";
import { ApiResponse, ApiResponseError } from "~/apis/api";

export const meta: MetaFunction = () => {
	return [
		{ title: "Dashboard - CClash Config Deliver" },
	];
};

export async function loader ({ request }: LoaderFunctionArgs) {
	
	await requireUILogin(request)
	
	return {
		indexes: TemplateIndex.readIndex()
	};
	
}

function TemplateIndexItem (_: { index: TemplateIndexDef, enabled: boolean }) {
	
	return (
		<Link
			to={`${_.index.uuid}`}
			className={classes("template-index-item", css.templateIndexItem, _.enabled ? css.enabled : undefined)}>
			<div>
				<span>{_.index.name}</span>
			</div>
			<div className={classes(css.indicator)}></div>
		</Link>
	);
	
}

export default function Index() {
	
	const revalidator = useRevalidator()
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const current_index = params.uuid
	
	const isAdding = $(false)
	const addingName = $('')
	
	async function createNewTemplate () {
		
		const createResponse = await fetch("/api/auth/_cookie_/get_create", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name: addingName.value
			} satisfies ApiGetCreate_RequestDef)
		})
		const json = await createResponse.json() as ApiResponse
		if (json.status === 200) {
			revalidator.revalidate()
		} else {
			const jsonErr = json as ApiResponseError<any>
			if (jsonErr.e_id == 'api_getCreate_create') {
				const jsonErrCreate = jsonErr as ApiResponseError<ApiGetCreate_Response_ECreate>
				alert("Failed to create new template: " + jsonErrCreate.error.caused)
			} else {
				alert("500 Internal Server Error: " + JSON.stringify(json))
			}
		}
		cancelAdd()
		
	}
	function cancelAdd (event?: MouseEvent) {
		if (event) event.stopPropagation()
		isAdding.value = false
		addingName.value = ''
	}
	function startAdd (event?: MouseEvent) {
		if (event) event.stopPropagation()
		if (isAdding.value) return
		isAdding.value = true
		addingName.value = ''
	}
	
	function handleOverAddAreaClick () {
		cancelAdd()
	}
	useEffect(() => {
		window.onclick = handleOverAddAreaClick
	}, [])
	useBeforeUnload(() => {
		window.onclick = null
	})
	
	return (
		<>
			<div className={classes(css.page)}>
				<div className={classes(css.pageSidebar)}>
					
					{data.indexes.map(item => {
						return (
							<TemplateIndexItem
								key={item.uuid}
								index={item}
								enabled={item.uuid === current_index}
							/>
						);
					})}
					
					<div className={classes(css.templateIndexItem, css.adder, is(isAdding.value, css.inUse))}
						onClick={startAdd}>
						{iss(isAdding.value,
							<>
								<InputText className={[css.inputName]} value={addingName.value} onValueChange={e => addingName.value = e} />
								<div className={classes(css.controller)}>
									<InputButton onClick={cancelAdd}>-</InputButton>
									<InputButton onClick={createNewTemplate}>+</InputButton>
								</div>
							</>,
							<span>+</span>
						)}
						
					</div>
					
				</div>
				<div className={classes(css.pageContent)}>
					<Outlet />
				</div>
			</div>
		</>
	);
}

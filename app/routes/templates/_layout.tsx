import { LoaderFunctionArgs } from "@remix-run/node"
import {
	Link, Outlet, useBeforeUnload, useLoaderData, useOutletContext, useParams, useRevalidator
} from "@remix-run/react"
import { MouseEvent, useEffect } from "react"

import { requireUILogin } from "~/.server/auth"
import { TemplateIndex, TemplateIndexDef } from "~/.server/templates/template"
import { ApiResponse, ApiResponseError } from "~/apis/api"
import { AppLayoutContext } from "~/root"
import {
	ApiGetCreate_RequestDef, ApiGetCreate_Response_ECreate
} from "~/routes/api/require-auth/get_create"
import { defineAppTitle, defineMeta } from "~/universal/app-meta"
import { InputButton, InputText } from "~/utils/components/Inputs"
import { is, iss } from "~/utils/fp"
import { classes } from "~/utils/jsx-helper"
import { $ } from "~/utils/reactive"

import css from "./_layout.module.stylus"
import { I } from "~/utils/components/icons"
import toast from "~/universal/toast"

export const meta = defineMeta((args) => {
	return [ defineAppTitle(args.matches, 'Templates') ]
})

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

export interface TemplatesLayoutContext extends AppLayoutContext {
	templateIndexRevalidator: ReturnType<typeof useRevalidator>
}

export default function TemplatesLayout() {
	
	const layoutContext = useOutletContext<AppLayoutContext>()
	const revalidator = useRevalidator()
	const params = useParams()
	const data = useLoaderData<typeof loader>()
	const current_index = params.uuid
	
	const isAdding = $(false)
	const isAddingInputFocusing = $(false)
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
				toast.pop({ type: toast.types.ERROR })(<>
					<h4>Failed to create new template:</h4>
					<p>{jsonErrCreate.error.caused}</p>
				</>)
			} else {
				toast.pop({ type: toast.types.ERROR })(<>
					<h4>500 Internal Server Error:</h4>
					<pre><code>{JSON.stringify(json)}</code></pre>
				</>)
			}
		}
		cancelAdd()
		
	}
	function cancelAdd () {
		isAdding.value = false
		isAddingInputFocusing.value = false
		addingName.value = ''
	}
	function startAdd (event?: MouseEvent) {
		if (event) event.stopPropagation()
		if (isAdding.value) return
		isAdding.value = true
		isAddingInputFocusing.value = true
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
								<InputText className={[css.inputName]}
									focus={isAddingInputFocusing.value}
									value={addingName.value}
									onValueChange={e => addingName.value = e}
									onEnterKeyDown={createNewTemplate} onEscKeyDown={cancelAdd} />
								<div className={classes(css.controller)}>
									<InputButton onClick={createNewTemplate}><I mg>check</I></InputButton>
								</div>
							</>,
							<span>+</span>
						)}
						
					</div>
					
				</div>
				<div className={classes(css.pageContent)}>
					<Outlet context={{
						...layoutContext,
						templateIndexRevalidator: revalidator
					} satisfies TemplatesLayoutContext } />
				</div>
			</div>
		</>
	);
}

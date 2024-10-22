import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./_layout.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { requireUILogin } from "~/.server/auth";
import { TemplateIndex, TemplateIndexDef } from "~/.server/templates/template";
import { Link, Outlet, useBeforeUnload, useLoaderData, useParams } from "@remix-run/react";
import { $ } from "~/utils/reactive";
import { is, iss } from "~/utils/fp";
import { InputButton, InputText } from "~/utils/components/Inputs";
import { MouseEvent, useEffect } from "react";

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
	
	const data = useLoaderData<typeof loader>()
	const params = useParams()
	const current_index = params.uuid
	
	const isAdding = $(false)
	const addingName = $('')
	
	async function createNewTemplate () {
		alert(`Failed add new template with name ${addingName.value}: Not implemented yet`)
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

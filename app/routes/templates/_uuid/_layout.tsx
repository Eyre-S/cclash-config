import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, Outlet, useLoaderData, useMatches, useNavigate, useRevalidator } from "@remix-run/react"
import { requireUILogin } from "~/.server/auth"
import { TemplateIndex } from "~/.server/templates/template"

import css from './_layout.module.stylus'
import { classes } from "~/utils/jsx-helper"
import { InputButton } from "~/utils/components/Inputs"
import { SlideSwitch, SlideSwitchItem } from "~/utils/components/slide-switch"
import { ReactNode, Ref, RefObject, useEffect, useRef } from "react"
import { $ } from "~/utils/reactive"
import { is } from "~/utils/fp"

export async function loader ({ params, request }: LoaderFunctionArgs) {
	
	await requireUILogin(request)
	
	const uuid = params.uuid as string
	const item = TemplateIndex.findByUUID(uuid) as TemplateIndex
	
	return {
		item: item,
		content: item.getTemplate(),
		contentSha1: item.getTemplateHash()
	}
	
}

export function TemplateEditorNav (current: string, path: string, children: ReactNode) {
	const isEnabled = path === current
	return <SlideSwitchItem className={classes(is(isEnabled, css.enabled))} isEnabled={isEnabled} onClick={()=>{}}>
		<Link to={path}>{children}</Link>
	</SlideSwitchItem>
}

export interface TemplateItemLayoutContext {
	titleRef: RefObject<HTMLDivElement | null>
	controllerRef: RefObject<HTMLDivElement | null>
}

export default function TemplateItemLayout () {
	
	const data = useLoaderData<typeof loader>()
	const route = useMatches()
	const navigate = useNavigate()
	
	const elemTitleBox = useRef<HTMLDivElement>(null)
	const elemControllerBox = useRef<HTMLDivElement>(null)
	
	const currentSubPage = $('')
	useEffect(() => {
		
		currentSubPage.value = route[3].id.split('/').pop() || 'editor'
		
	}, [route])
	
	async function deleteThisTemplate () {
		
		if (!confirm("Really want to delete this template?\n You will lost this template FOREVER!!!"))
			return
		
		alert("Deletion not implemented.")
		navigate("..", { relative: 'route' })
		
	}
	
	return <>
		<div className={classes(css.itemEdit)}>
			<div className={classes(css.header)}>
				<div className={classes(css.title)}>
					<h2 ref={elemTitleBox} id="template-title">
						{data.item.name}
					</h2>
					<p>{data.item.uuid}</p>
				</div>
				<div className={classes(css.gap)} />
				<div className={classes(css.controller)}>
					<SlideSwitch className={classes(css.nav)}>
						{TemplateEditorNav(currentSubPage.value, 'editor', "Editor")}
						{TemplateEditorNav(currentSubPage.value, 'settings', "Settings")}
						{TemplateEditorNav(currentSubPage.value, 'preview', "Preview")}
					</SlideSwitch>
					<div className={classes(css.buttons)}>
						<div ref={elemControllerBox} id="template-controller-box" className={css.buttons}/>
						<InputButton
							theme="red" longPress
							onClick={deleteThisTemplate}
							><span>Delete</span></InputButton>
					</div>
				</div>
			</div>
			<div className={css.editorBox}>
				<div className={css.editorContainer}>
					<Outlet context={{
						titleRef: elemTitleBox,
						controllerRef: elemControllerBox,
					} satisfies TemplateItemLayoutContext} />
				</div>
			</div>
		</div>
		
	</>
	
}
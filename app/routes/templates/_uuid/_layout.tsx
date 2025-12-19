import { LoaderFunctionArgs } from "react-router"
import { Link, Outlet, useLoaderData, useMatches, useOutletContext } from "react-router"
import { ReactNode, RefObject, useEffect, useRef } from "react"

import { defineAppTitle, defineMeta } from "~/universal/app-meta"
import { SlideSwitch, SlideSwitchItem } from "~/utils/components/slide-switch"
import { is } from "~/utils/fp"
import { classes } from "~/utils/jsx-helper"
import { $ } from "~/utils/reactive"

import { TemplatesLayoutContext } from "../_layout"

import css from "./_layout.module.styl"
import { requireUILogin } from "~/data/authentication/login.server"
import { TemplateIndexes } from "~/data/template/loader.server"
import { TemplateIndex } from "~/data/template/template"

export const meta = defineMeta<typeof loader, {}>((args) => {
	return [
		defineAppTitle(args.matches, 'Templates', args.data?.item.name || "???")
	]
})

export async function loader ({ params, request }: LoaderFunctionArgs) {
	
	await requireUILogin(request)
	
	const uuid = params.uuid as string
	const item = TemplateIndexes.findByUUID(uuid) as TemplateIndex
	
	return {
		item: item
	}
	
}

export function TemplateEditorNav (current: string, path: string, children: ReactNode) {
	const isEnabled = path === current
	return <SlideSwitchItem className={classes(is(isEnabled, css.enabled))} isEnabled={isEnabled} onClick={()=>{}}>
		<Link to={path}>{children}</Link>
	</SlideSwitchItem>
}

export interface TemplateItemLayoutContext extends TemplatesLayoutContext {
	titleRef: RefObject<HTMLDivElement | null>
	controllerRef: RefObject<HTMLDivElement | null>
}

export default function TemplateItemLayout () {
	
	const layoutContext = useOutletContext<TemplatesLayoutContext>()
	const data = useLoaderData<typeof loader>()
	const route = useMatches()
	
	const elemTitleBox = useRef<HTMLDivElement>(null)
	const elemControllerBox = useRef<HTMLDivElement>(null)
	
	const currentSubPage = $('')
	useEffect(() => {
		
		currentSubPage.value = route[3].id.split('/').pop() || 'editor'
		
	}, [route])
	
	return <>
		<div className={classes(css.itemEdit)}>
			<div className={classes(css.header)}>
				<div className={classes(css.title)}>
					<h2 className={classes(css.name)}>
						<div ref={elemTitleBox} />
						<span>{data.item.name}</span>
					</h2>
					<p className={classes(css.uuid)}>{data.item.uuid}</p>
				</div>
				<div className={classes(css.gap)} />
				<div className={classes(css.controller)}>
					<SlideSwitch className={classes(css.nav)}>
						{TemplateEditorNav(currentSubPage.value, 'editor', "Editor")}
						{TemplateEditorNav(currentSubPage.value, 'settings', "Settings")}
						{TemplateEditorNav(currentSubPage.value, 'preview', "Preview")}
					</SlideSwitch>
					<div className={classes(css.buttons)}>
						<div ref={elemControllerBox} className={css.buttons}/>
					</div>
				</div>
			</div>
			<div className={css.editorBox}>
				<div className={css.editorContainer}>
					<Outlet context={{
						...layoutContext,
						titleRef: elemTitleBox,
						controllerRef: elemControllerBox,
					} satisfies TemplateItemLayoutContext} />
				</div>
			</div>
		</div>
		
	</>
	
}
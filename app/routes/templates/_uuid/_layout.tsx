import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, Outlet, useLoaderData, useMatches, useNavigate, useOutletContext } from "@remix-run/react"
import { requireUILogin } from "~/.server/auth"
import { TemplateIndex } from "~/.server/templates/template"

import css from './_layout.module.stylus'
import { classes } from "~/utils/jsx-helper"
import { InputButton } from "~/utils/components/Inputs"
import { SlideSwitch, SlideSwitchItem } from "~/utils/components/slide-switch"
import { ReactNode, RefObject, useEffect, useRef } from "react"
import { $ } from "~/utils/reactive"
import { aIt, is } from "~/utils/fp"
import { defineAppTitle, defineMeta } from "~/universal/app-meta"
import { TemplatesLayoutContext } from "../_layout"
import toast, { ToastParameters } from "~/universal/toast"
import { errors } from "da4s"
import { TemplateDeleteResponse } from "~/routes/api/require-auth/get/delete"
import { ApiResponseError } from "~/apis/api"
import { TemplateNotFoundErrorResponse } from "~/routes/api/require-auth/get/_public"

export const meta = defineMeta<typeof loader, {}>((args) => {
	return [
		defineAppTitle(args.matches, 'Templates', args.data?.item.name || "???")
	]
})

export async function loader ({ params, request }: LoaderFunctionArgs) {
	
	await requireUILogin(request)
	
	const uuid = params.uuid as string
	const item = TemplateIndex.findByUUID(uuid) as TemplateIndex
	
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
	const navigate = useNavigate()
	
	const elemTitleBox = useRef<HTMLDivElement>(null)
	const elemControllerBox = useRef<HTMLDivElement>(null)
	
	const currentSubPage = $('')
	useEffect(() => {
		
		currentSubPage.value = route[3].id.split('/').pop() || 'editor'
		
	}, [route])
	
	async function deleteThisTemplate () {
		
		async function doDeletion () {
			
			toast.promise()<ToastParameters, ToastParameters, any>(new Promise((resolve, reject) => { aIt(async () => {
				try {
					const submitResult = await fetch(`/api/auth/_cookie_/get/uuid:${data.item.uuid}/delete`, { method: 'DELETE' })
					const resultJson = await submitResult.json()
					if ('data' in resultJson) {
						const resultJsonData = resultJson.data as TemplateDeleteResponse
						resultJsonData.name
						resolve({
							text: <>
								<h4>Template deleted:</h4>
								<p>Successfully deleted <code>{resultJsonData.name}</code>.</p>
								<ul>
									<li>uuid: <code>{resultJsonData.uuid}</code></li>
									<li>also known as: {resultJsonData.alias.map((x, i) => <code key={i}>{x}</code>)}</li>
								</ul>
							</>
						} satisfies ToastParameters)
					} else if ('e_id' in resultJson) {
						const resultError = resultJson as ApiResponseError<any>
						if (resultError.e_id === 'api_template_notfound_delete') {
							const resultErrorData = resultError.error as TemplateNotFoundErrorResponse
							reject({
								text: <>
									<h4>Failed delete template:</h4>
									<p>Template <code>{resultErrorData.requesting_template_name}</code> not found.</p>
								</>
							} satisfies ToastParameters)
						} else {
							reject({
								text: <>
									<h4>Failed delete template:</h4>
									<p>Unknown server error:</p>
									<pre><code>{errors.normalError(resultError.error)}</code></pre>
								</>
							} satisfies ToastParameters)
						}
					}
				} catch (e) {
					if (e instanceof SyntaxError) {
						// response is not valid json error
						reject({
							text: <>
								<h4>Failed delete template:</h4>
								<p>Unknown server response: {e.message}</p>
							</>
						} satisfies ToastParameters)
					}
					// unknown error
					reject({
						text: <>
							<h4>Failed delete template:</h4>
							<p>Unknown server error:</p>
							<pre><code>{errors.normalError(e)}</code></pre>
						</>
					} satisfies ToastParameters)
				} finally {
					navigate("..", { relative: 'route' })
					layoutContext.templateIndexRevalidator.revalidate()
				}
			})}), {
				pending: { text: <><h4>Deleting template...</h4><p>Deleting <code>{data.item.name}</code></p></> },
				success: (data) => data,
				error: (data) => data
			})
		}
		
		layoutContext.popups.open({
			
			title: "Deleting Template",
			children: "Do you really want to delete this template? You will lost it FOREVER.",
			
			onChecked: false,
			button_mode: 'center',
			buttons: (closePopups) => {
				return (<>
					<InputButton theme="red" longPress onClick={async () => {
						closePopups()
						doDeletion()
					}}>Yes, do as I say!</InputButton>
					<InputButton onClick={async () => {
						closePopups()
					}}>Let me keep it for now.</InputButton>
				</>)
			}
			
		})
		
	}
	
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
						<InputButton
							theme="red"
							onClick={deleteThisTemplate}
							><span>Delete</span></InputButton>
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
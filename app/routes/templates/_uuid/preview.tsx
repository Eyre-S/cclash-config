import { Editor } from "@monaco-editor/react"
import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useMount } from "react-use"
import { ClientOnly } from "remix-utils/client-only"

import toast from "~/universal/toast"
import { guessCodeLanguage } from "~/utils/code-lang"
import { InputText } from "~/utils/components/Inputs"
import { SettingItem } from "~/utils/components/panel/setting-item"
import { isIt, it } from "~/utils/fp"
import { classes } from "~/utils/jsx-helper"
import { useReadyState } from "~/utils/react-utils"
import { $ } from "~/utils/reactive"

import { TemplateItemLayoutContext } from "./_layout"

import css from "./preview.module.stylus"

export async function loader ({ params }: LoaderFunctionArgs) {
	
	const uuid = params.uuid as string
	
	return {
		uuid
	}
	
}

export default function TemplatePreviewPage () {
	
	const isReady = useReadyState()
	const layoutContext = useOutletContext<TemplateItemLayoutContext>()
	const loaderData = useLoaderData<typeof loader>()
	
	const websiteRoot = useRef('')
	
	const userToken = $('_cookie_')
	const previewTemplateName = $(`uuid:${loaderData.uuid}`)
	
	const previewUseRawMode = $(true)
	
	const previewParams = it(() => {
		if (previewUseRawMode.current) return "/raw"
		else return ""
	})
	
	useMount(() => {
		websiteRoot.current = window.location.origin
	})
	useEffect(() => {
		updateContent()
	})
	
	const previewUrlPrevious = useRef('')
	const previewUrl = `${websiteRoot.current}/api/auth/${userToken.current}/get/${previewTemplateName.current}${previewParams}`
	
	const previewContent = $('')
	async function updateContent () {
		
		if (previewUrl == previewUrlPrevious.current) return
		previewUrlPrevious.current = previewUrl
		
		const response = await fetch(previewUrl, {
			method: 'GET'
		})
		const content = await response.text()
		
		previewContent.current = content
		toast.pop()("Content updated")
		
	}
	
	function ContentPreview (props: { content: string }) {
		
		const language = $('plaintext')
		useEffect(() => {
			language.current = guessCodeLanguage(props.content)
		}, [props.content])
		
		return <>
			<Editor className={classes(css.editor)}
				value={props.content}
				options={{
					readOnly: true,
				}}
			/>
		</>
		
	}
	
	return <>
		
		<ClientOnly>{() => <>{isIt(isReady.value, () => createPortal(
			<>
				<select>
					<option>[new setup]</option>
				</select>
			</>,
			layoutContext.controllerRef.current as HTMLElement
		))}</>}</ClientOnly>
		
		<div className={classes(css.previewPage)}>
			
			<div className={classes(css.previewHeading)}>
				<InputText className={[css.url]} value={previewUrl} disabled />
			</div>
			
			<div className={classes(css.previewControlPanel)}>
				<SettingItem
					description={<><span>auth uses</span></>}
					inputs={<>
						<select>
							<option>_cookie_</option>
							<option>key</option>
						</select>
					</>}
				/>
				<SettingItem
					description={<><span>name uses</span></>}
					inputs={<>
						<select>
							<option>uuid</option>
							<option>name</option>
						</select>
					</>}
				/>
				<SettingItem
					description={<><span>raw mode</span></>}
					inputs={<>
						<input type='checkbox'
							checked={previewUseRawMode.current}
							onChange={(e) => previewUseRawMode.current = e.target.checked}
						/>
					</>}
				/>
				{/* <SettingItem
					description={<><span>params</span></>}
					inputs={<>
						<InputText value={previewParams.current} onValueChange={nv => previewParams.current = nv} />
					</>}
				/> */}
			</div>
			
			<div className={classes(css.previewBody)}>
				<ContentPreview content={previewContent.current} />
			</div>
			
		</div>
		
	</>
	
}

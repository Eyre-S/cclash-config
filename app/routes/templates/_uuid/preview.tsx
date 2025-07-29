import { Editor } from "@monaco-editor/react"
import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { LoaderFunctionArgs, useLoaderData, useOutletContext } from "react-router"
import { useMount } from "react-use"
import { ClientOnly } from "remix-utils/client-only"

import { TemplateIndexes } from "~/data/template/loader.server"
import { TemplateConfig, TemplateConfigs, TemplateIndex } from "~/data/template/template"
import toast from "~/universal/toast"
import { guessCodeLanguage } from "~/utils/code-lang"
import { array2map } from "~/utils/collections"
import { InputSelect, InputSwitch, InputText } from "~/utils/components/Inputs"
import { SettingItem } from "~/utils/components/panel/setting-item"
import { FlexStack } from "~/utils/components/panel/stacks"
import { isIt, it } from "~/utils/fp"
import { bindInputValue, classes } from "~/utils/jsx-helper"
import { useReadyState } from "~/utils/react-utils"
import { $ } from "~/utils/reactive"

import { TemplateItemLayoutContext } from "./_layout"

import css from "./preview.module.stylus"

export async function loader ({ params }: LoaderFunctionArgs) {
	
	const uuid = params.uuid as string
	const item = TemplateIndexes.findByUUID(uuid)
	if (!item) {
		throw new Response("Template not found", { status: 404 })
	}
	
	return {
		uuid,
		item: item satisfies TemplateIndex,
		configs: await item.getConfigs() satisfies TemplateConfig[]
	}
	
}

const INIT_RAW_CONFIG_NAME = '[raw]'

export default function TemplatePreviewPage () {
	
	const isReady = useReadyState()
	const layoutContext = useOutletContext<TemplateItemLayoutContext>()
	const loaderData = useLoaderData<typeof loader>()
	
	const websiteRoot = useRef('')
	
	const userToken = $('_cookie_')
	const previewTemplateName = $(`uuid:${loaderData.uuid}`)
	
	const configs = $(array2map([TemplateConfigs.getDefaultRaw(), ...loaderData.configs], (x) => x.name))
	const previewUsingConfigName = $(INIT_RAW_CONFIG_NAME)
	
	const previewParams = it(() => {
		if (configs.value[previewUsingConfigName.value].is_raw) return "/raw"
		else {
			return "?target=" + configs.value[previewUsingConfigName.value].targets.join(",")
		}
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
				<InputSelect
					options={[INIT_RAW_CONFIG_NAME, ...loaderData.configs.map(c => c.name)]}
					selected={previewUsingConfigName.value}
					onSelect={nv => previewUsingConfigName.value = nv}
				/>
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
						<InputSelect
							options={['_cookie_', '<some very random key>']}
							selected='_cookie_'
						/>
					</>}
				/>
				<SettingItem
					description={<><span>name uses</span></>}
					inputs={<FlexStack>
						<InputSelect
							options={[`uuid:${loaderData.uuid}`, loaderData.item.name, ...loaderData.item.alias]}
							selected={previewTemplateName.current}
							onSelect={nv => previewTemplateName.current = nv}
						/>
					</FlexStack>}
				/>
				<SettingItem
					description={<><span>raw mode</span></>}
					inputs={<>
						<InputSwitch
							// {...bindInputValue(configs.value[previewUsingConfigName.value].is_raw)}
							value={configs.value[previewUsingConfigName.value].is_raw}
							onValueChange={()=>{}}
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

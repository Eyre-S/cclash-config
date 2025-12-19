import { Editor } from "@monaco-editor/react"
import { errors } from "da4s"
import { ReactNode, useRef } from "react"
import { LoaderFunctionArgs, useLoaderData, useNavigate, useOutletContext } from "react-router"
import { useUpdate } from "react-use"

import { TemplateIndexes } from "~/data/template/loader.server"
import { ClientAPIs } from "~/routes/api"
import toast, { ToastParameters } from "~/universal/toast"
import { I } from "~/utils/components/icons"
import { InputButton, InputText } from "~/utils/components/Inputs"
import { SettingItem } from "~/utils/components/panel/setting-item"
import { FlexStack, HorizontalStack, VerticalStack } from "~/utils/components/panel/stacks"
import { aIt } from "~/utils/fp"
import { classes } from "~/utils/jsx-helper"
import { $ } from "~/utils/reactive"

import { TemplateItemLayoutContext } from "./_layout"

import css from "./settings.module.styl"

export async function loader ({ params }: LoaderFunctionArgs) {
	
	const uuid = params.uuid as string
	const item = TemplateIndexes.findByUUID(uuid)
	
	if (!item) {
		throw new Response("Template not found", { status: 404 })
	}
	
	return {
		item: item,
		itemComments: await item.getComments()
	}
	
}

export default function TemplateSettingsPage (): ReactNode {
	
	const loaderData = useLoaderData<typeof loader>()
	
	const navigate = useNavigate()
	const layoutContext = useOutletContext<TemplateItemLayoutContext>()
	
	const settingItems = [
		
		function TemplateName (): ReactNode {
			const templateName = $(loaderData.item.name)
			return <SettingItem
				description={<><span className={classes(css.title)}>Name</span></>}
				inputs={<FlexStack>
					<InputText value={templateName.value} onValueChange={nv => templateName.value = nv} />
				</FlexStack>}
			/>
		},
		
		function TemplateAliases (): ReactNode {
			
			const rerender_TemplateAliases = useUpdate()
			const aliases = useRef(loaderData.item.alias)
			
			function AliasItemEditor (props: { value: string, onValueChange: (nv: string) => void, onDeleteThis: ()=>void }): ReactNode {
				const cache = $(props.value)
				return <HorizontalStack align="center">
					<InputText value={cache.value} onValueChange={(newValue) => {
						cache.value = newValue
						props.onValueChange(newValue)
					}} />
					<InputButton blocks className={[css.smallDeleteButton]} theme="red" onClick={props.onDeleteThis}><I mg>delete</I></InputButton>
				</HorizontalStack>
			}
			
			function addAlias () {
				aliases.current = [...aliases.current, ""]
				rerender_TemplateAliases()
				saveAlias()
			}
			
			async function saveAlias () {
				// todo: save the aliases
			}
			
			return <SettingItem
				description={<><span className={classes(css.title)}>Aliases</span></>}
				inputs={<VerticalStack>
					{aliases.current.map((alias, i) =>
						<AliasItemEditor key={i} value={alias}
							onValueChange={nv => {
								const newAliases = [...aliases.current]
								newAliases[i] = nv
								aliases.current = newAliases
								saveAlias()
							}}
							onDeleteThis={() => {
								const newAliases = [...aliases.current]
								newAliases.splice(i, 1)
								aliases.current = newAliases
								rerender_TemplateAliases()
								saveAlias()
							}}
						/>
					)}
					<InputButton blocks onClick={addAlias}><I mg>add</I></InputButton>
				</VerticalStack>}
			/>
			
		},
		
		function TemplateComment (): ReactNode {
			
			const itemComments = $(loaderData.itemComments)
			const itemCommentsSubmitted = useRef(loaderData.itemComments)
			
			itemComments.addDebounceListener(500, () => {
				tryUpdateTemplateComment()
			})
			
			function tryUpdateTemplateComment () {
				itemComments.runs(newValue => {
					
					// do not save if the comments are not changed
					if (itemCommentsSubmitted.current === newValue) return
					
					// TODO: save the comments
					itemCommentsSubmitted.current = newValue
					console.log("comments saved")
					toast.pop({ type: toast.types.NOTICE })(<h4>comments saved</h4>)
					
				})
			}
			
			return <SettingItem
				description={<><span className={classes(css.title)}>Comments</span></>}
				inputs={<VerticalStack>
					<Editor className={classes(css.commentEditor)}
						language="markdown"
						value={itemComments.value} onChange={value => itemComments.value = value as string} />
				</VerticalStack>}
			/>
			
		},
		
		function deleteTemplate (): ReactNode {
			
			async function deleteThisTemplate () {
				
				async function doDeletion () {
					
					toast.promise()<ToastParameters, ToastParameters, any>(new Promise((resolve, reject) => { aIt(async () => {
						// executing delete action
						ClientAPIs.auths.byCookies.get.byUUID(loaderData.item.uuid).delete({
							onSuccess: (data) => resolve({
								text: <>
									<h4>Template deleted:</h4>
									<p>Successfully deleted <code>{data.name}</code>.</p>
									<ul>
										<li>uuid: <code>{data.uuid}</code></li>
										<li>also known as: {data.alias.map((x, i) => <code key={i}>{x}</code>)}</li>
									</ul>
								</>
							}),
							onTemplateNotFound: (data) => reject({
								text: <>
									<h4>Failed delete template:</h4>
									<p>Template <code>{data.requesting_template_name}</code> not found.</p>
								</>
							} satisfies ToastParameters),
							onUnknownApiError: (data) => reject({
								text: <>
									<h4>Failed delete template:</h4>
									<p>Unknown server error:</p>
									<pre><code>{errors.normalError(data.error)}</code></pre>
								</>
							} satisfies ToastParameters),
							onInvalidApiResponse: (data) => reject({
								text: <>
									<h4>Failed delete template:</h4>
									<p>Unknown server response: {data.message}</p>
								</>
							} satisfies ToastParameters),
							onUnknownError: (data) => reject({
								text: <>
									<h4>Failed delete template:</h4>
									<p>Unknown server error:</p>
									<pre><code>{errors.normalError(data)}</code></pre>
								</>
							} satisfies ToastParameters),
							onFinally: () => {
								// navigating back and refresh index
								navigate("../..", { relative: 'route' })
								layoutContext.templateIndexRevalidator.revalidate()
							}
						})
					})}), {
						pending: { text: <><h4>Deleting template...</h4><p>Deleting <code>{loaderData.item.name}</code></p></> },
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
			
			return <SettingItem
				description={<><span className={classes(css.title)}>Delete</span></>}
				inputs={<>
					<InputButton theme="red" className={[css.deleteButton]}
						onClick={deleteThisTemplate} >Delete</InputButton>
				</>}
			/>
			
		}
		
	]
	
	return <>
		<div className={classes(css.settingsPage)}>
			{settingItems.map((Item, i) => <Item key={i}></Item>)}
		</div>
	</>
	
}

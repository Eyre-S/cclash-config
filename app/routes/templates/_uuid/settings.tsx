import { classes } from "~/utils/jsx-helper";

import css from './settings.module.stylus';
import { ReactNode, useRef } from "react";
import { InputButton, InputText } from "~/utils/components/Inputs";
import { $ } from "~/utils/reactive";
import { Editor } from "@monaco-editor/react";
import { FlexStack, VerticalStack } from "~/utils/components/panel/stacks";
import { useLoaderData, useNavigate, useOutletContext } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { TemplateIndex } from "~/.server/templates/template";
import { editor } from "monaco-editor";
import toast, { ToastParameters } from "~/universal/toast";
import { aIt } from "~/utils/fp";
import api from "~/routes/api";
import { errors } from "da4s";
import { TemplateItemLayoutContext } from "./_layout";

export async function loader ({ params }: LoaderFunctionArgs) {
	
	const uuid = params.uuid as string
	const item = TemplateIndex.findByUUID(uuid) as TemplateIndex
	
	return {
		item: item,
		itemComments: item.getComments()
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
			
			const aliases = $(loaderData.item.alias)
			
			function AliasItemEditor (props: { value: string, onValueChange: (nv: string) => void }): ReactNode {
				return <InputText {...props} />
			}
			
			function addAlias () {
				aliases.value = [...aliases.value, ""]
			}
			
			return <SettingItem
				description={<><span className={classes(css.title)}>Aliases</span></>}
				inputs={<VerticalStack>
					{aliases.value.map((alias, i) =>
						<AliasItemEditor key={i} value={alias} onValueChange={nv => {
							const newAliases = [...aliases.value]
							newAliases[i] = nv
							aliases.value = newAliases
						}} />
					)}
					<InputButton onClick={addAlias}>+</InputButton>
				</VerticalStack>}
			/>
			
		},
		
		function TemplateComment (): ReactNode {
			
			const itemCommentsSubmitted = useRef(loaderData.itemComments)
			const itemComments = $(loaderData.itemComments)
			
			function tryUpdateTemplateComment () {
				itemComments.runs(newValue => {
						
					// do not save if the comments are not changed
					if (itemCommentsSubmitted.current === newValue) {
						console.log("comments are not changed, no need to save")
						console.log("comments:", newValue)
						console.log("commentsSubmitted:", itemCommentsSubmitted.current)
						return
					}
					
					// TODO: save the comments
					itemCommentsSubmitted.current = newValue
					console.log("comments saved")
					toast.pop({ type: toast.types.NOTICE })(<h4>comments saved</h4>)
					
				})
			}
			
			function onEditorMounts (editor: editor.IStandaloneCodeEditor) {
				editor.onDidBlurEditorText(tryUpdateTemplateComment)
			}
			
			return <SettingItem
				description={<><span className={classes(css.title)}>Comments</span></>}
				inputs={<VerticalStack>
					<Editor className={classes(css.commentEditor)}
						language="markdown" onMount={onEditorMounts}
						value={itemComments.value} onChange={value => itemComments.value = value as string} />
				</VerticalStack>}
			/>
			
		},
		
		function deleteTemplate (): ReactNode {
			
			async function deleteThisTemplate () {
				
				async function doDeletion () {
					
					toast.promise()<ToastParameters, ToastParameters, any>(new Promise((resolve, reject) => { aIt(async () => {
						// executing delete action
						api.auths.byCookies.get.byUUID(loaderData.item.uuid).delete({
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

export function SettingItem (props: { description: ReactNode, inputs: ReactNode }): ReactNode {
	
	return <>
		<div className={classes(css.settingItem)}>
			<div className={classes(css.descriptionBox)}>
				<div className={classes(css.descriptionContent)}>
					{props.description}
				</div>
			</div>
			{/* <div className={classes(css.gap)}></div> */}
			<div className={classes(css.inputsBox)}>
				<div className={classes(css.inputsContent)}>
					{props.inputs}
				</div>
			</div>
		</div>
	</>
	
}

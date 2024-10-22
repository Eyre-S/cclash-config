import { LoaderFunctionArgs } from "@remix-run/node";
import { TemplateIndex } from "~/.server/templates/template";

import css from "./editor.module.stylus"
import { unstable_usePrompt, useBeforeUnload, useLoaderData, useRevalidator } from "@remix-run/react";
import { classes } from "~/utils/jsx-helper";
import { InputButton, InputText } from "~/utils/components/Inputs";
import { $ } from "~/utils/reactive";
import { is, it } from "~/utils/fp";
import CryptoJS from "crypto-js";
import { Editor } from "@monaco-editor/react";
import { guessCodeLanguage } from "~/utils/code-lang";

export async function loader ({ params }: LoaderFunctionArgs) {
	
	const uuid = params.uuid as string
	const item = TemplateIndex.findByUUID(uuid) as TemplateIndex
	
	return {
		item: item,
		content: item.getTemplate(),
		contentSha1: item.getTemplateHash()
	}
	
}

export default function () {
	
	const data = useLoaderData<typeof loader>()
	const revalidator = useRevalidator()
	
	const editingTemplate = $('')
	const editingContent = $('')
	const editingInitialStatus = $('')
	const editingContentLanguage = $('')
	
	async function tryInit (enforce = false) {
		if (editingTemplate.value != data.item.uuid || editingInitialStatus.value != data.contentSha1 || enforce) {
			console.log("seems like the template has been changed, reloading data")
			editingTemplate.value = data.item.uuid
			editingContent.value = data.content
			editingInitialStatus.value = data.contentSha1
			editingContentLanguage.value = guessCodeLanguage(data.content)
			console.log("reloaded data of", await editingTemplate.state())
		}
	} tryInit()
	
	const isClearState = it(() => {
		return editingInitialStatus.value == CryptoJS.SHA1(editingContent.value).toString()
	})
	unstable_usePrompt({
		when: !isClearState,
		message: "You have unsaved changes, are you sure you want to leave?"
	})
	useBeforeUnload(() => window.onbeforeunload = null)
	if (typeof window !== 'undefined') {
		if (isClearState) {
			window.onbeforeunload = null
		} else {
			window.onbeforeunload = (e) => {
				e.preventDefault()
			}
		}
	}
	
	function resetToInitial () {
		tryInit(true)
	}
	
	async function updateContent () {
		
		const submitResult = await fetch(`/api/auth/_cookie_/get/uuid:${data.item.uuid}/set`, {
			method: 'POST',
			body: editingContent.value,
			headers: {
				"Content-Type": "text/plain"
			}
		})
		
		alert(await submitResult.text())
		revalidator.revalidate()
		
	}
	
	async function reDetectCurrentLanguage () {
		editingContentLanguage.value = guessCodeLanguage(editingContent.value)
	}
	
	return <>
		<div className={classes(css.itemEdit)}>
			<div className={classes(css.header)}>
				<div className={classes(css.title)}>
					<h2>
						{data.item.name}
						<div className={classes(css.editedIndicator, is(!isClearState, css.show))} />
					</h2>
					<p>{data.item.uuid}</p>
					<div className={classes(css.gap)} />
					<div className={classes(css.controller)}>
						<InputButton
							disabled={isClearState}
							onClick={resetToInitial}
							>Reset</InputButton>
						<InputButton
							disabled={isClearState}
							onClick={updateContent}
							>Save</InputButton>
					</div>
				</div>
			</div>
			<div className={css.editorBox}>
				<Editor
					className={classes(css.editor)}
					value={editingContent.value} onChange={e => editingContent.value = e as string}
					path={editingTemplate.value}
					language={editingContentLanguage.value}
					options={{ renderWhitespace: 'boundary' }} />
			</div>
			<div className={classes(css.controller)}>
				<span>Language:</span>
				<InputText value={editingContentLanguage.value} onValueChange={e => editingContentLanguage.value = e} />
				<InputButton onClick={reDetectCurrentLanguage} >Re-Detect</InputButton>
			</div>
		</div>
	</>
	
}
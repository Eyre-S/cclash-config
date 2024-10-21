import { LoaderFunctionArgs } from "@remix-run/node";
import { TemplateIndex } from "~/.server/templates/template";

import css from "./uuid.module.stylus"
import { unstable_usePrompt, useBeforeUnload, useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
import { classes } from "~/utils/jsx-helper";
import { InputButton } from "~/utils/components/Inputs";
import { $ } from "~/utils/reactive";
import { it } from "~/utils/fp";
import CryptoJS from "crypto-js";

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
	
	async function tryInit (enforce = false) {
		if (editingTemplate.value != data.item.uuid || editingInitialStatus.value != data.contentSha1 || enforce) {
			console.log("seems like the template has been changed, reloading data")
			editingTemplate.value = data.item.uuid
			editingContent.value = data.content
			editingInitialStatus.value = data.contentSha1
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
		
		const submitResult = await fetch(`/api/auth/_cookie_/get/${data.item.uuid}/set`, {
			method: 'POST',
			body: editingContent.value,
			headers: {
				"Content-Type": "text/plain"
			}
		})
		
		alert(await submitResult.text())
		revalidator.revalidate()
		
	}
	
	return <>
		<div className={classes(css.itemEdit)}>
			<div className={classes(css.header)}>
				<div className={classes(css.title)}>
					<h2>{data.item.name}</h2>
					<p>{data.item.uuid}</p>
				</div>
			</div>
			<textarea
				className={classes(css.editor)}
				value={editingContent.value}
				onChange={e => editingContent.value = e.target.value}/>
			<div className={classes(css.controller)}>
				<span>{isClearState ? "" : "changes in query..."}</span>
				<InputButton
					disabled={isClearState}
					onClick={resetToInitial}
					>Reset</InputButton>
				<InputButton
					disabled={isClearState}
					onClick={updateContent}
					>Update</InputButton>
			</div>
		</div>
	</>
	
}
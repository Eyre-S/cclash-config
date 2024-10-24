import { LoaderFunctionArgs } from "@remix-run/node";
import { TemplateIndex } from "~/.server/templates/template";

import css from "./editor.module.stylus"
import { unstable_usePrompt, useBeforeUnload, useLoaderData, useNavigate, useRevalidator } from "@remix-run/react";
import { classes } from "~/utils/jsx-helper";
import { InputButton, InputText } from "~/utils/components/Inputs";
import { $ } from "~/utils/reactive";
import { inCase, is, it } from "~/utils/fp";
import CryptoJS from "crypto-js";
import { Editor } from "@monaco-editor/react";
import { guessCodeLanguage, showSpecialChars } from "~/utils/code-lang";
import { editor, Selection } from "monaco-editor";
import { useRef } from "react";

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
	const navigate = useNavigate()
	
	const editingTemplate = $('')
	const editingContent = $('')
	const editingInitialStatus = $('')
	const editingContentLanguage = $('')
	
	const monacoInstance = useRef<editor.IStandaloneCodeEditor|null>(null)
	const monacoStatus = $({
		lineNumber: undefined as number | undefined,
		column: undefined as number | undefined,
		eol: undefined as string | undefined,
		selection: undefined as Selection | undefined,
		selection_areas: 0 as number,
		insertSpaces: undefined as boolean | undefined,
		tabSize: undefined as number | undefined,
	})
	function setMonacoStatus (newValues: Partial<typeof monacoStatus.value>) {
		monacoStatus.set((current) => {
			return { ...current, ...newValues }
		})
	}
	function onMonacoMounts (editor: editor.IStandaloneCodeEditor) {
		monacoInstance.current = editor
		const editorModel = editor.getModel()
		setMonacoStatus({
			lineNumber: editor.getPosition()?.lineNumber,
			column: editor.getPosition()?.column,
			selection: editor.getSelection()||undefined,
			selection_areas: editor.getSelections()?.length || 0,
			eol: editorModel?.getEOL(),
			tabSize: editorModel?.getOptions().indentSize,
			insertSpaces: editorModel?.getOptions().insertSpaces,
		})
		editor.onDidChangeCursorPosition((e) => {
			setMonacoStatus({
				lineNumber: e.position.lineNumber,
				column: e.position.column
			})
		})
		editor.onDidChangeCursorSelection((e) => {
			setMonacoStatus({
				selection: editor.getSelection()||undefined,
				selection_areas: editor.getSelections()?.length || 0
			})
		})
		editor.onDidChangeModel((e) => {
			const editorModel = editor.getModel()
			setMonacoStatus({
				eol: editorModel?.getEOL(),
				tabSize: editorModel?.getOptions().indentSize,
				insertSpaces: editorModel?.getOptions().insertSpaces,
			})
		})
		editor.onDidChangeModelContent((e) => {
			setMonacoStatus({
				eol: e.eol,
			})
		})
		editor.onDidChangeModelOptions((e) => {
			setMonacoStatus({
				tabSize: editor.getModel()?.getOptions().indentSize,
				insertSpaces: editor.getModel()?.getOptions().insertSpaces,
			})
		})
	}
	
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
	
	async function deleteThisTemplate () {
		
		if (!confirm("Really want to delete this template?\n You will lost this template FOREVER!!!"))
			return
		
		alert("Deletion not implemented.")
		navigate("..", { relative: 'route' })
		
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
						<InputButton
							theme="red" longPress
							onClick={deleteThisTemplate}
							><span>Delete</span></InputButton>
					</div>
				</div>
			</div>
			<div className={css.editorBox}>
				<Editor
					className={classes(css.editor)}
					value={editingContent.value} onChange={e => editingContent.value = e as string}
					path={editingTemplate.value}
					language={editingContentLanguage.value}
					options={{ renderWhitespace: 'boundary' }}
					onMount={onMonacoMounts} />
			</div>
			<div className={classes(css.controller)}>
				<InputText value={inCase(monacoStatus.value.insertSpaces, [[undefined, ''], [true, 'Spaces'], [false, 'Tabs']])}
					prefix="indents" disabled hideIndicator className={[css.tabType]}
					onClick={() => alert("not implemented")} />
				<InputText value={monacoStatus.value.tabSize?.toString()||''}
					prefix="tab size" disabled hideIndicator className={[css.tabSize]} />
				<InputText value={showSpecialChars(monacoStatus.value.eol||'')}
					disabled hideIndicator className={[css.eolType]} />
				<InputText value={it(() => {
						let content = ''
						content += (monacoStatus.value.selection?.startLineNumber||'0') + ":" + (monacoStatus.value.selection?.startColumn||'0')
						if (
							monacoStatus.value.selection?.startLineNumber != monacoStatus.value.selection?.endLineNumber ||
							monacoStatus.value.selection?.startColumn != monacoStatus.value.selection?.endColumn
						) content += " - " + (monacoStatus.value.selection?.endLineNumber||'0') + ":" + (monacoStatus.value.selection?.endColumn||'0')
						if (monacoStatus.value.selection_areas > 1) content += " * " + monacoStatus.value.selection_areas
						return content
					})}
					disabled hideIndicator className={[css.cursor]}
					onClick={() => alert("not implemented")} />
				<InputText value={editingContentLanguage.value} onValueChange={e => editingContentLanguage.value = e}
					prefix="Language" placeholder="..."
					/>
				<InputButton onClick={reDetectCurrentLanguage} >Re-Detect</InputButton>
			</div>
		</div>
	</>
	
}
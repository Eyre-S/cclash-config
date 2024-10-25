import { LoaderFunctionArgs } from "@remix-run/node";
import { TemplateIndex } from "~/.server/templates/template";

import css from "./editor.module.stylus"
import { unstable_usePrompt, useBeforeUnload, useLoaderData, useNavigate, useOutletContext, useRevalidator } from "@remix-run/react";
import { classes } from "~/utils/jsx-helper";
import { InputButton, InputText } from "~/utils/components/Inputs";
import { $ } from "~/utils/reactive";
import { inCase, is, isIt, it } from "~/utils/fp";
import CryptoJS from "crypto-js";
import { Editor } from "@monaco-editor/react";
import { guessCodeLanguage, showSpecialChars } from "~/utils/code-lang";
import { editor, Selection } from "monaco-editor";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TemplateItemLayoutContext } from "./_layout";
import { ClientOnly } from "remix-utils/client-only";
import { useHydrated } from "remix-utils/use-hydrated";

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
	const layoutContext = useOutletContext<TemplateItemLayoutContext>()
	const revalidator = useRevalidator()
	
	const ready = $(false)
	useEffect(() => { ready.value = true }, [])
	
	const editingTemplate = $('')
	const editingContent = $('')
	const editingInitialStatus = $('')
	const editingContentLanguage = $('')
	
	useEffect(() => {
		console.log("seems like the template has been changed, reloading data")
		initData()
	}, [data])
	
	async function initData () {
		editingTemplate.value = data.item.uuid
		editingContent.value = data.content
		editingInitialStatus.value = data.contentSha1
		editingContentLanguage.value = guessCodeLanguage(data.content)
		console.log("reloaded data of", await editingTemplate.state())
	}
	
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
		initData()
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
		<div className={classes(css.editorPage)}>
			
			<ClientOnly>{() => <>
				{isIt(ready.value, () => createPortal(<>
					<div className={classes(css.editedIndicator, is(!isClearState, css.show))} />
				</>, layoutContext.titleRef.current as HTMLElement))}
				{isIt(ready.value, () => createPortal(<>
					<InputButton
						disabled={isClearState}
						onClick={resetToInitial}
						>Reset</InputButton>
					<InputButton
						disabled={isClearState}
						onClick={updateContent}
						>Save</InputButton>
				</>, layoutContext.controllerRef.current as HTMLElement))}
			</>}</ClientOnly>
			
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
					prefix="Language" placeholder="..." className={[css.language]}
					/>
				<InputButton onClick={reDetectCurrentLanguage} >Re-Detect</InputButton>
			</div>
			
		</div>
	</>
	
}
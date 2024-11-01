import { classes } from "~/utils/jsx-helper";

import layoutCss from './_layout.module.stylus'
import { useOutletContext } from "@remix-run/react";
import { SettingsLayoutContext } from "./_layout";
import { InputButton } from "~/utils/components/Inputs";
import { usePopupNotification } from "~/utils/components/popup";
import { toast } from "react-toastify";

export default function ClientSettingsPage () {
	
	const layoutContext = useOutletContext<SettingsLayoutContext>()
	
	const PopupNotification = usePopupNotification(layoutContext)
	
	function openCheckbox () {
		PopupNotification.openPopup({
			title: "Checkbox",
			children: "This is a checkbox!",
		})
	}
	
	async function openCheckbox2 () {
		
		await layoutContext.popups.open({
			title: "Another Checkbox",
			children: "This is another checkbox! should be different from the first one!",
		})
		
		await layoutContext.popups.open({
			children: "This is another another checkbox! This should appears after the previous one is closed!",
		})
		
	}
	
	async function openToast () {
		toast("This is a toast!", {
			position: 'top-center',
		})
	}
	
	return <>
		<div className={classes(layoutCss.innerPage)}>
			
			{PopupNotification.element}
			
			<h1>Client Settings</h1>
			
			<p>Not implemented...</p>
			
			<InputButton onClick={openCheckbox}>Open checkbox!</InputButton>
			<InputButton onClick={openCheckbox2}>Open another checkbox!</InputButton>
			<InputButton onClick={openToast}>Open toast!</InputButton>
			
		</div>
	</>
	
}

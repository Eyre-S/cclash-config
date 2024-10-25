import { classes } from "~/utils/jsx-helper";

import layoutCss from './_layout.module.stylus'
import { useOutletContext } from "@remix-run/react";
import { SettingsLayoutContext } from "./_layout";
import { ClientOnly } from "remix-utils/client-only";
import { createPortal } from "react-dom";
import { isIt, nonnull } from "~/utils/fp";
import { InputButton } from "~/utils/components/Inputs";
import { $ } from "~/utils/reactive";
import { PopupNotification, usePopupNotification } from "~/utils/components/popup";

export default function ClientSettingsPage () {
	
	const layoutContext = useOutletContext<SettingsLayoutContext>()
	
	const PopupNotification = usePopupNotification(layoutContext)
	
	function openCheckbox () {
		PopupNotification.openPopup({
			title: "Checkbox",
			children: "This is a checkbox!",
		})
	}
	
	function openCheckbox2 () {
		PopupNotification.openPopup({
			title: "Another Checkbox",
			children: "This is another checkbox! should be different from the first one!",
		})
	}
	
	return <>
		<div className={classes(layoutCss.innerPage)}>
			
			{PopupNotification.element}
			
			<h1>Client Settings</h1>
			
			<p>Not implemented...</p>
			
			<InputButton onClick={openCheckbox}>Open checkbox!</InputButton>
			<InputButton onClick={openCheckbox2}>Open another checkbox!</InputButton>
			
		</div>
	</>
	
}

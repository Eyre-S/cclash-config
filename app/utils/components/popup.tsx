import { ReactNode } from "react"

import { is, isIt, it } from "../fp"
import { classes } from "../jsx-helper"
import { $ } from "../reactive"
import { InputButton } from "./Inputs"

import css from "./popup.module.styl"

export type PopupButtonsDefining = (closePopups: ()=>void) => ReactNode
export interface PopupNotificationOnCheckedButtonDefinition { callback: () => any, text: ReactNode }

export interface PopupNotificationProps {
	
	title?: ReactNode
	
	children: ReactNode
	
	onChecked?: {
		callback?: (closePopups: () => void) => any,
		text?: ReactNode
	} | false
	button_mode?: 'center' | 'align-right' | 'off'
	buttons?: PopupButtonsDefining
	
}

export interface PopupNotificationInnerArguments {
	
	title?: ReactNode
	
	children: ReactNode
	
	onChecked?: PopupNotificationOnCheckedButtonDefinition
	button_mode: 'center' | 'align-right' | 'off'
	buttons?: ReactNode
	
}

interface PopupsContext {
	closePopups: () => void
}

function Props2InnerArguments (props: PopupNotificationProps, context: PopupsContext): PopupNotificationInnerArguments {
	const {onChecked, button_mode, buttons, ...rest} = props
	return {
		...rest,
		onChecked: it(() => {
			if (typeof onChecked === 'undefined') {
				return { callback: context.closePopups, text: 'Ok' }
			} else if (onChecked === false) {
				return undefined
			} else {
				return {
					callback: it(() => {
						const cb = onChecked.callback
						if (cb === undefined) return context.closePopups
						else return () => { cb(context.closePopups) }
					}),
					text: onChecked.text || 'Ok'
				}
			}
		}),
		button_mode: button_mode || 'align-right',
		buttons: buttons ? buttons(context.closePopups) : null
	}
}

export function PopupNotification (props: PopupNotificationInnerArguments) {
	
	return <>
		<div className={classes(css.popup)}>
			{is(props.title, <div className={classes(css.title)}>{props.title}</div>)}
			<div className={classes(css.message)}>{props.children}</div>
			<div className={classes(css.buttons, css['type-' + (props.button_mode)])}>
				{props.buttons}
				{isIt(props.onChecked, () => <InputButton onClick={props.onChecked?.callback}>{props.onChecked?.text}</InputButton>)}
			</div>
		</div>
	</>
	
}

// export function usePopupNotification (context: AppLayoutContext) {
	
// 	const isOpen = $(false)
// 	const parameters = $<PopupNotificationInnerArguments>({
// 		title: '',
// 		children: '',
// 		button_mode: 'align-right'
// 	})
	
// 	function openPopup (props: Omit<PopupNotificationInnerArguments, 'onChecked'>) {
// 		parameters.value = {
// 			...parameters.value,
// 			...props
// 		}
// 		isOpen.value = true
// 		context.appCover.controller.value = true
// 	}
	
// 	return {
// 		element: <ClientOnly>{() => isIt(isOpen.value, () => createPortal(
// 			<PopupNotification {...parameters.value} />,
// 			nonnull(context.appCover.node)
// 		))}</ClientOnly>,
// 		openPopup,
// 	}
	
// }

export function useGlobalPopups () {
	
	const isOpen = $(false)
	function closePopups () {
		isOpen.value = false
	}
	const parameters = $<PopupNotificationInnerArguments>(Props2InnerArguments({
		children: 'nothing here...'
	}, { closePopups }))
	
	async function open (props: PopupNotificationProps): Promise<void> {
		const promise = new Promise<void>((resolve) => {
			const myClosePopups = () => {
				closePopups()
				resolve()
			}
			parameters.value = Props2InnerArguments(props, { closePopups: myClosePopups })
			isOpen.value = true
			
		})
		return promise
	}
	
	return {
		element: <PopupNotification {...parameters.value} />,
		open,
		status: isOpen.value
	}
	
}

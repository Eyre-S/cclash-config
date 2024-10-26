import { ReactNode } from 'react'
import { classes } from '../jsx-helper'
import { InputButton } from './Inputs'
import css from './popup.module.stylus'
import { is, isIt, nonnull } from '../fp'
import { $ } from '../reactive'
import { AppLayoutContext } from '~/root'
import { ClientOnly } from 'remix-utils/client-only'
import { createPortal } from 'react-dom'

export interface PopupNotificationProps { title?: ReactNode, children: ReactNode, onChecked: () => any }
export function PopupNotification (_: PopupNotificationProps) {
	
	return <>
		<div className={classes(css.popup)}>
			{is(_.title, <div className={classes(css.title)}>{_.title}</div>)}
			<div className={classes(css.message)}>{_.children}</div>
			<div className={classes(css.buttons)}>
				<InputButton onClick={_.onChecked}>Ok</InputButton>
			</div>
		</div>
	</>
	
}

export function usePopupNotification (context: AppLayoutContext) {
	
	const isOpen = $(false)
	const parameters = $<PopupNotificationProps>({
		title: '',
		children: '',
		onChecked: () => {
			isOpen.value = false
			context.appCover.controller.value = false
		}
	})
	
	function openPopup (props: Omit<PopupNotificationProps, 'onChecked'>) {
		parameters.value = {
			...parameters.value,
			...props
		}
		isOpen.value = true
		context.appCover.controller.value = true
	}
	
	return {
		element: <ClientOnly>{() => isIt(isOpen.value, () => createPortal(
			<PopupNotification {...parameters.value} />,
			nonnull(context.appCover.node)
		))}</ClientOnly>,
		openPopup,
	}
	
}

export function useGlobalPopups () {
	
	const isOpen = $(false)
	function onCheckedDefaults () {
		isOpen.value = false
	}
	const parameters = $<PopupNotificationProps>({
		title: '',
		children: '',
		onChecked: onCheckedDefaults
	})
	
	async function open ({onChecked: propsOnChecked, ...props}: Omit<PopupNotificationProps, 'onChecked'> & { onChecked?: () => any }): Promise<void> {
		const promise = new Promise<void>((resolve) => {
			
			let parametersNew: PopupNotificationProps = {
				...parameters.value,
				...props,
				onChecked: () => {
					if (propsOnChecked) propsOnChecked()
					onCheckedDefaults()
					resolve()
				}
			}
			
			parameters.value = parametersNew
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

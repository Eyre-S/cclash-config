import { toast, ToastContentProps, ToastOptions } from "react-toastify"
import { getIcon, I, IconDefinition } from "~/utils/components/icons"
import { classes } from "~/utils/jsx-helper"

import "~/css/global-overrides/toastify-toast.stylus"
import css from "./toast.module.stylus"
import { ReactNode, useRef } from "react"
import { inCase, is, isIt, iss, it, select } from "~/utils/fp"
import { Reactive } from "~/utils/reactive"

export interface ToastType {
	css_class: () => string
	default_icon: () => string
}

export class ToastTypeSimple implements ToastType {
	
	private readonly classNameValue: string
	private readonly defaultIconValue: string
	
	public constructor (css_class: string, default_icon: string) {
		this.classNameValue = css_class
		this.defaultIconValue = default_icon
	}
	
	public css_class (): string { return this.classNameValue }
	public default_icon (): string { return this.defaultIconValue }
	
}

export class ToastTypes {
	
	public static readonly ERROR: ToastType = new ToastTypeSimple(css.typeError, "cancel")
	public static readonly WARNING: ToastType = new ToastTypeSimple(css.typeWarn, "warning")
	public static readonly DEV: ToastType = new ToastTypeSimple(css.typeDev, "emoji_nature")
	public static readonly NOTICE: ToastType = new ToastTypeSimple(css.typeDev, "info")
	
}

export interface ToastParameters {
	
	text: ReactNode,
	
	type?: ToastType,
	icon?: IconDefinition,
	
	buttons?: ToastButton[],
	checkButton?: boolean|IconDefinition
	
	timeout?: number | false
	
}

export type ToastButtonCallback = (closeToast: ()=>void) => void
export interface ToastButton {
	icon: IconDefinition,
	onClick?: ToastButtonCallback,
	closeToast?: "before"|"after"|"none"
}

export function createToast (props: ToastParameters) {
	
	return function ({ closeToast }: ToastContentProps) {
		
		return <ToastItem
			{...props}
			closeToast={closeToast}
		/>
		
	}
	
}

function ToastItem ({closeToast, ...props}: ToastParameters & { closeToast: ()=>void }) {
	
	const icon = it(() => {
		const icon_def = select(props.icon, props.type?.default_icon())
		if (typeof icon_def === "string") {
			return <I fill={1}>{icon_def}</I>
		} else if (typeof icon_def === 'object') {
			return (<I {...icon_def} />)
		} else {
			return undefined
		}
	})
	
	const buttons: JSX.Element[] = props.buttons?.map((buttonDef, index) => {
		const onClick: ToastButtonCallback = buttonDef.onClick || ((_) => {})
		const callback: ()=>void = inCase(buttonDef.closeToast, [
			["before", () => {
				closeToast()
				onClick(closeToast)
			}],
			[["after", undefined], () => {
				onClick(closeToast)
				closeToast()
			}],
			["none", () => {
				onClick(closeToast)
			}],
		])
		return (<button key={index} className={classes(css.button)} onClick={callback}>
			{getIcon(buttonDef.icon)}
		</button>)
	}) || []
	
	const isPaused = new Reactive<boolean>(false)
	
	return (<>
		<div className={classes(css.testToast, css.toastItem, props.type?.css_class())}
			onMouseEnter={() => isPaused.value = true}
			onMouseLeave={() => isPaused.value = false}
		>
			
			{isIt(props.timeout !== false, () => <ToastProgressBar
				timeout={props.timeout || 3000}
				isPaused={isPaused.value}
				closeToast={closeToast}
			/>)}
			
			<div className={classes(css.starterGap)}></div>
			
			<div className={classes(css.icon)}>{icon}</div>
			<div className={classes(css.content)}>
				<span>{props.text}</span>
			</div>
			
			<div className={classes(css.buttons)}>
				{buttons.map((buttonDef) => {
					return buttonDef
				})}
				{iss(props.checkButton === false, <></>, <button className={classes(css.button)} onClick={() => closeToast()}>
					{it(() => {
						if (typeof props.checkButton !== "boolean" && props.checkButton !== undefined) {
							return getIcon(props.checkButton)
						} else {
							return <I>check</I>
						}
					})}
				</button>)}
			</div>
			
		</div>
	</>)
	
}

function ToastProgressBar (props: {isPaused: boolean, timeout: number, closeToast: ()=>void}): JSX.Element {
	
	const timeoutMs = props.timeout
	const timer = useRef<NodeJS.Timeout|undefined>(undefined)
	
	if (props.isPaused) {
		clearTimeout(timer.current)
		timer.current = undefined
	}
	else {
		clearTimeout(timer.current)
		timer.current = setTimeout(() => {props.closeToast()}, timeoutMs)
	}
	
	return (<>
		{is(!props.isPaused, <div className={classes(css.progressBar)} style={{
			animationDuration: `${timeoutMs}ms`
		}}></div>)}
	</>)
	
}

export const defaultToastingConfig: ToastOptions<unknown> = {
	position: 'top-center',
	closeButton: false,
	autoClose: false,
	hideProgressBar: true
}

export function popupToast (params: Omit<ToastParameters, "text"> = {}, options: ToastOptions<unknown> = defaultToastingConfig) {
	return function (text: ToastParameters["text"]) {
		return toast(createToast({ text: text, ...params }), options)
	}
}

export default {
	
	defaultToastingConfig,
	createToast,
	
	types: ToastTypes,
	
	pop: popupToast
	
}

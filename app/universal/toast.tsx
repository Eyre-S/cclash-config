import { JSX, ReactNode, useRef } from "react"
import { toast, ToastContentProps, ToastOptions } from "react-toastify"

import { getIcon, I, IconDefinition } from "~/utils/components/icons"
import { inCase, is, isIt, iss, it, select } from "~/utils/fp"
import { classes } from "~/utils/jsx-helper"
import { $ } from "~/utils/reactive"

import css from "./toast.module.stylus"

import "~/css/global-overrides/toastify-toast.stylus"
import "./toast.stylus"

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

export const ToastTimeouts = {
	short: 2400,
	normal: 5000
}

export interface ToastParameters {
	
	text: ReactNode,
	
	type?: ToastType,
	icon?: IconDefinition,
	
	buttons?: ToastButton[],
	checkButton?: boolean|IconDefinition
	hideButtons?: boolean
	
	timeout?: number | false
	
}

export type ToastButtonCallback = (closeToast: ()=>void) => void
export interface ToastButton {
	icon: IconDefinition,
	onClick?: ToastButtonCallback,
	closeToast?: "before"|"after"|"none"
}

export function createToast <T> (props: ToastParameters) {
	return function ({ closeToast }: ToastContentProps<T>) {
		return <ToastItem
			{...props}
			closeToast={closeToast}
		/>
	}
}

export function createParamToast <T> (props: (data: T) => ToastParameters, mixins: Partial<ToastParameters> = {}) {
	return function ({ closeToast, data }: ToastContentProps<T>) {
		return <ToastItem
			{...mixins}
			{...props(data)}
			closeToast={closeToast}
		/>
	}
}

function ToastItem ({closeToast, ...props}: ToastParameters & { closeToast: ()=>void }) {
	
	const icon = it(() => {
		const icon_def = select(props.icon, props.type?.default_icon())
		// console.log("props.icon is", props.icon)
		// console.log("icon def is", icon_def)
		if (icon_def === undefined) {
			return undefined
		} else if (typeof icon_def === "string") {
			return <I fill={1}>{icon_def}</I>
		} else if ("type" in icon_def) {
			return icon_def
		} else {
			return (<I {...icon_def} />)
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
	
	const timeout = props.timeout || ToastTimeouts.normal
	
	const isPaused = $<boolean>(false)
	
	return (<>
		<div className={classes("toast-item", css.toastItem, props.type?.css_class())}
			onMouseEnter={() => isPaused.value = true}
			onMouseLeave={() => isPaused.value = false}
		>
			
			{isIt(props.timeout !== false, () => <ToastProgressBar
				timeout={timeout}
				isPaused={isPaused.value}
				closeToast={closeToast}
			/>)}
			
			<div className={classes(css.starterGap)}></div>
			
			<div className={classes(css.icon)}>{icon}</div>
			<div className={classes(css.content)}>
				<span>{props.text}</span>
			</div>
			
			<div className={classes(css.buttons, is(props.hideButtons, css.hidden))}>
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

export type ToastParametersFunc<T> = (data: T) => ToastParameters
export type ToastParametersRich<T> = ToastParameters | ((data: T) => ToastParameters)
export function enrichToastParameters <T> (params: ToastParametersRich<T>): ToastParametersFunc<T> {
	if (typeof params === "function") return params
	else return () => params
}
export interface PromiseToastParameters <TData, TError, TPending> {
	pending: ToastParametersRich<TPending>,
	success: ToastParametersRich<TData>,
	error: ToastParametersRich<TError>,
}
export function popupPromiseToast (options: Omit<ToastOptions<any>, "render"> = defaultToastingConfig) {
	return function <PT, ET, NT> (promise: Promise<PT>, parameters: PromiseToastParameters<PT, ET, NT>) {
		const param_func_pending = enrichToastParameters(parameters.pending)
		const param_func_success = enrichToastParameters(parameters.success)
		const param_func_error = enrichToastParameters(parameters.error)
		toast.promise<PT, ET, NT>(promise, {
			pending: {
				render: createParamToast(param_func_pending, {
					type: ToastTypes.NOTICE,
					icon: <I fill={1} optical={40} grade={200} className={classes(css.pending)}>atr</I>,
					timeout: false,
					checkButton: false,
					hideButtons: true
				}),
				...options
			},
			success: {
				render: createParamToast(param_func_success, {
					type: ToastTypes.DEV,
					timeout: ToastTimeouts.short
				}),
				...options
			},
			error: {
				render: createParamToast(param_func_error, {
					type: ToastTypes.ERROR
				}),
				...options
			}
		})
	}
}

export default {
	
	defaultToastingConfig,
	createToast,
	
	types: ToastTypes,
	timeouts: ToastTimeouts,
	
	pop: popupToast,
	promise: popupPromiseToast
	
}

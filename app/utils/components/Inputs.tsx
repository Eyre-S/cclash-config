import { useElementSize } from "@reactuses/core"
import {
	CSSProperties, FocusEventHandler, KeyboardEventHandler, MouseEventHandler, ReactNode, useEffect,
	useRef
} from "react"
import { useLifecycles } from "react-use"

import { is, iss } from "../fp"
import { classes } from "../jsx-helper"
import { $, toggle$ } from "../reactive"
import { Collapsible } from "./collapsible"
import { I } from "./icons"

import css from "./Inputs.module.stylus"

export type ButtonReceiveEvents = React.MouseEvent<HTMLButtonElement>|React.TouchEvent<HTMLButtonElement>

export function InputButton (_: {
	
	disabled?: boolean,
	
	theme?: 'red',
	longPress?: boolean,
	blocks?: boolean,
	
	children?: ReactNode
	className?: string[]
	onClick?: (e: ButtonReceiveEvents) => any
	
}): ReactNode {
	
	const isPressing = $(false)
	const pressTimeout = useRef<NodeJS.Timeout>()
	
	function startTimer (e: ButtonReceiveEvents) {
		e.stopPropagation()
		isPressing.value = true
		pressTimeout.current = setTimeout(() => {
			isPressing.value = false
			pressTimeout.current = undefined
			if (_.onClick) _.onClick(e)
		}, 2000)
	}
	
	function stopTimer (e: ButtonReceiveEvents) {
		e.stopPropagation()
		if (pressTimeout.current != undefined) {
			clearTimeout(pressTimeout.current)
			pressTimeout.current = undefined
			isPressing.value = false
		}
	}
	
	return <>
		<button
			className={classes(
				'input', 'button', css.input, css.button,
				is(_.disabled, css.disabled), css[_.theme||''], is(_.blocks, css.paddingBlocks),
				..._.className||[]
			)}
			type="button"
			onClick={is(!_.longPress, _.onClick)}
			onMouseDown={is(_.longPress, startTimer)}
			onMouseUp={is(_.longPress, stopTimer)}
			onMouseLeave={is(_.longPress, stopTimer)}
			onTouchStart={is(_.longPress, startTimer)}
			onTouchEnd={is(_.longPress, stopTimer)}
			onTouchCancel={is(_.longPress, stopTimer)} >
			{is(_.longPress, <div className={classes(css.longPressIndicator, is(isPressing.value, css.pressing))} />)}
			{_.children}
		</button>
	</>
	
}

export function InputText (_: {
	
	value: string
	onValueChange?: (value: string) => void
	
	onClick?: MouseEventHandler<HTMLElement>
	onEnterKeyDown?: KeyboardEventHandler<HTMLInputElement>
	onEscKeyDown?: KeyboardEventHandler<HTMLInputElement>
	onFocus?: FocusEventHandler<HTMLInputElement>
	onBlur?: FocusEventHandler<HTMLInputElement>
	
	disabled?: boolean
	autofocus?: boolean
	placeholder?: string
	
	password?: boolean
	showPassword?: boolean
	
	maxLength?: number
	minLength?: number
	pattern?: RegExp
	
	className?: string[],
	
	children?: ReactNode,
	prefix?: ReactNode,
	suffix?: ReactNode,
	hideIndicator?: boolean
	
	noSelect?: boolean
	focus?: boolean
	
}): ReactNode {
	
	const showPassword = $(_.showPassword||false)
	function toggleShowPassword () {
		showPassword.value = !showPassword.value
	}
	
	const type = iss(_.password && !showPassword.value, 'password', 'text')
	function onKeyDown (e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter' && _.onEnterKeyDown) {
			_.onEnterKeyDown(e)
		} else if (e.key === 'Escape' && _.onEscKeyDown) {
			_.onEscKeyDown(e)
		}
	}
	
	const elem_input = useRef<HTMLInputElement>(null)
	
	useEffect(() => {
		if (_.focus && elem_input.current) {
			elem_input.current.focus()
		}
	}, [_.focus])
	
	return <>
		<div className={classes('input', 'input-text', css.input, css.text, is(_.password, 'password'), is(showPassword.value, css.showPassword), ..._.className||[])}
			onClick={_.onClick}>
			
			{is(typeof _.prefix !== 'undefined', <>
				<span className={classes(css.prefix)}
					// onClick={_.onClick}
					>{_.prefix}</span>
				<span className={classes(css.prefixSeparator)}
					// onClick={_.onClick}
					/>
			</>)}
			
			<input
				name="__universal_input_text" ref={elem_input}
				value={_.value} onInput={e => { if (_.onValueChange) {_.onValueChange(e.currentTarget.value)} }}
				onKeyDown={onKeyDown} onFocus={_.onFocus} onBlur={_.onBlur}
				type={type} disabled={_.disabled} placeholder={_.placeholder} autoFocus={_.autofocus}
				minLength={_.minLength} maxLength={_.maxLength} pattern={_.pattern?.source}
			/>
			
			{is(typeof _.suffix !== 'undefined', <>
				<span className={classes(css.suffix)}
					// onClick={_.onClick}
					>{_.suffix}</span>
			</>)}
			
			{is(!_.hideIndicator, iss(_.password,
				<div className={classes(css.marker, css.password)} onClick={toggleShowPassword}>
					<div className={classes(css.showPassword, is(showPassword.value, css.on))}></div>
				</div>,
				<div className={classes(css.marker)}></div>,
			))}
			
			{is(_.noSelect, <div className={classes(css.cover, is(_.onClick, css.canClicks))} onClick={_.onClick} />)}
			
		</div>
	</>
	
}

export function InputSwitch (props: {
	value: boolean,
	onValueChange: (newValue: boolean) => void,
}): ReactNode {
	
	return <>
		<div className={classes('input', 'switch', css.input, css.switch, is(props.value, css.on))}
			onClick={() => props.onValueChange(!props.value)}
		>
			<div className={classes(css.checkIcon)}></div>
			<div className={classes(css.checkEmpty)}></div>
		</div>
	</>
	
}

export function InputSelect (props: {
	
	options: string[],
	selected: string,
	
	onSelect?: (option: string) => void
	
}): ReactNode {
	
	const optionBox = useRef<HTMLDivElement>(null)
	const [optionBoxWidth, _] = useElementSize(optionBox, { box: 'border-box' })
	const outerBoxStyle = {
		width: optionBoxWidth + "px"
	} satisfies CSSProperties
	
	const isSelecting = toggle$(false)
	const isSelecting_nextValue = $<boolean|null>(null)
	function toggleSelector () {
		isSelecting_nextValue.runs(vNext => {
			if (vNext == null) {
				// there are no previous click, means the click from outside
				// close the selector
				isSelecting.value = false
			} else { isSelecting.runs(v => {
				if (vNext == v) {
					// the status should not change, ignore
				} else {
					// apply the change that from the previous click
					isSelecting.current = vNext
					isSelecting_nextValue.value = null
				}
			}) }
		})
	}
	useLifecycles(
		() => { window.addEventListener('click', toggleSelector) },
		() => { window.removeEventListener('click', toggleSelector) }
	)
	
	function onSelect (selectingOption: string) {
		if (props.selected == selectingOption) return
		if (props.onSelect) props.onSelect(selectingOption)
	}
	
	return <>
		<div className={classes('input', 'select', css.input, css.select)}
			style={outerBoxStyle}
			onClick={() => isSelecting_nextValue.current = !isSelecting.current}
		>
			
			<div className={classes(css.selected)}>
				<span className={classes(css.text)}>{props.selected}</span>
			</div>
			
			<div className={classes(css.indicator, is(isSelecting.current, css.open))}>
				<I mg>keyboard_arrow_up</I>
			</div>
			
			<Collapsible show={isSelecting.current} outerProps={{ className: classes(css.optionSelectorBox) }}>
				<div className={classes(css.optionSelector, is(isSelecting.current, css.show))}
				ref={optionBox} onClick={() => { isSelecting_nextValue.value = true }}>
					{props.options.map(option => <>
						<div className={classes(css.option, is(option == props.selected, css.selected))}
							onClick={() => onSelect(option)}>
							<span className={classes(css.text)}>{option}</span>
							<div className={classes(css.indicator)} />
						</div>
					</>)}
				</div>
			</Collapsible>
			
		</div>
	</>
	
}

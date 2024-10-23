import { ReactNode, useRef } from "react"
import { is, iss } from "../fp"
import { classes } from "../jsx-helper"
import { $ } from "../reactive"

import css from './Inputs.module.stylus'

type ButtonReceiveEvents = React.MouseEvent<HTMLButtonElement>|React.TouchEvent<HTMLButtonElement>

export function InputButton (_: {
	
	disabled?: boolean,
	
	theme?: 'red',
	longPress?: boolean,
	
	children?: string | JSX.Element
	className?: string[]
	onClick?: (e: ButtonReceiveEvents) => any
	
}) {
	
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
			className={classes('input', 'button', css.input, css.button, is(_.disabled, css.disabled), css[_.theme||''], ..._.className||[])}
			onClick={is(!_.longPress, _.onClick)}
			onMouseDown={is(_.longPress, startTimer)}
			onMouseUp={is(_.longPress, stopTimer)}
			onMouseLeave={is(_.longPress, stopTimer)}
			onTouchStart={is(_.longPress, startTimer)}
			onTouchEnd={is(_.longPress, stopTimer)}
			onTouchCancel={is(_.longPress, stopTimer)}>
			{is(_.longPress, <div className={classes(css.longPressIndicator, is(isPressing.value, css.pressing))} />)}
			{_.children}
		</button>
	</>
	
}

export function InputText (_: {
	
	value: string
	onValueChange: (value: string) => void
	
	disabled?: boolean
	placeholder?: string
	
	password?: boolean
	showPassword?: boolean
	
	maxLength?: number
	minLength?: number
	pattern?: RegExp
	
	className?: string[],
	
	children?: ReactNode,
	prefix?: ReactNode,
	suffix?: ReactNode
	
}) {
	
	const showPassword = $(_.showPassword||false)
	function toggleShowPassword () {
		showPassword.value = !showPassword.value
	}
	
	const type = iss(_.password && !showPassword.value, 'password', 'text')
	
	return <>
		<div className={classes('input', 'input-text', css.input, css.text, is(_.password, 'password'), is(showPassword.value, css.showPassword), ..._.className||[])}>
			
			{is(typeof _.prefix !== 'undefined', <>
				<span className={classes(css.prefix)}>{_.prefix}</span>
				<span className={classes(css.prefixSeparator)} />
			</>)}
			
			<input
				value={_.value} onInput={e => _.onValueChange(e.currentTarget.value)}
				type={type} disabled={_.disabled} placeholder={_.placeholder}
				minLength={_.minLength} maxLength={_.maxLength} pattern={_.pattern?.source}
			/>
			
			{is(typeof _.suffix !== 'undefined', <>
				<span className={classes(css.suffix)}>{_.suffix}</span>
			</>)}
			
			{iss(_.password,
				<div className={classes(css.marker, css.password)} onClick={toggleShowPassword}>
					<div className={classes(css.showPassword, is(showPassword.value, css.on))}></div>
				</div>,
				<div className={classes(css.marker)}></div>,
			)}
			
		</div>
	</>
	
}
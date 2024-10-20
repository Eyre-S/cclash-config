import { MouseEventHandler } from "react"
import { is, iss } from "../fp"
import { classes } from "../jsx-helper"
import { $ } from "../reactive"

import css from './Inputs.module.stylus'

export function InputButton (_: {
	
	disabled?: boolean,
	
	children?: string | JSX.Element
	className?: string[]
	onClick?: MouseEventHandler<HTMLButtonElement>
	
}) {
	
	return <>
		<button
			className={classes('input', 'button', css.input, css.button, is(_.disabled, css.disabled), ..._.className||[])}
			onClick={_.onClick}>
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
	
	className?: string[]
	
}) {
	
	const showPassword = $(_.showPassword||false)
	function toggleShowPassword () {
		showPassword.value = !showPassword.value
	}
	
	const type = iss(_.password && !showPassword.value, 'password', 'text')
	
	return <>
		<div className={classes('input', 'input-text', css.input, css.text, is(_.password, 'password'), is(showPassword.value, css.showPassword), ..._.className||[])}>
			
			<input
				value={_.value} onInput={e => _.onValueChange(e.currentTarget.value)}
				type={type} disabled={_.disabled} placeholder={_.placeholder}
				minLength={_.minLength} maxLength={_.maxLength} pattern={_.pattern?.source}
			/>
			
			{iss(_.password,
				<div className={classes(css.marker, css.password)} onClick={toggleShowPassword}>
					<div className={classes(css.showPassword, is(showPassword.value, css.on))}></div>
				</div>,
				<div className={classes(css.marker)}></div>,
			)}
			
		</div>
	</>
	
}
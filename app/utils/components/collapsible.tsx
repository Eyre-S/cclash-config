import { CSSProperties, HTMLProps, ReactNode, SyntheticEvent, useEffect, useRef } from "react"

import { define } from "../fp"
import { classes } from "../jsx-helper"
import { $ } from "../reactive"

import css from "./collapsible.module.stylus"

export function Collapsible ({
	show,
	children,
	outerProps,
	...innerProps
}: { show: boolean, children: ReactNode, outerProps?: HTMLProps<HTMLDivElement> } & HTMLProps<HTMLDivElement>) {
	
	const innerBox = useRef<HTMLDivElement>(null)
	const innerHeight = useRef(0)
	const shouldShowHeight = $(0)
	
	function innerOnResize (event: SyntheticEvent<HTMLDivElement>) {
		// console.log("due to inner box resize, updating inner box height is", event.currentTarget.scrollHeight)
		innerHeight.current = event.currentTarget.offsetHeight
		if (show) shouldShowHeight.value = innerHeight.current
	}
	useEffect(() => {
		// console.log("due to inner box change, updating inner box height is", innerBox.current?.scrollHeight)
		innerHeight.current = innerBox.current?.offsetHeight||0
		if (show) shouldShowHeight.value = innerHeight.current
	}, [innerBox.current, children])
	
	useEffect(() => {
		if (show) {
			shouldShowHeight.value = innerHeight.current
		} else {
			shouldShowHeight.value = 0
		}
	}, [show])
	
	const outerStyles = define<CSSProperties>({
		height: `${shouldShowHeight.value}px`
	})
	
	return <>
		<div className={classes(css.outerBox)} style={outerStyles} {...outerProps} >
			<div className={classes(css.innerBox)} ref={innerBox} onResize={innerOnResize} {...innerProps}>
				{children}
			</div>
		</div>
	</>
	
}

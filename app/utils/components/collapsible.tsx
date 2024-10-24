import { CSSProperties, ReactNode, SyntheticEvent, useEffect, useRef } from "react";
import { define } from "../fp";
import { classes } from "../jsx-helper";

import css from './collapsible.module.stylus'
import { $ } from "../reactive";

export function Collapsible (_: { show: boolean, children: ReactNode, [key: string]: any }) {
	
	const innerBox = useRef<HTMLDivElement>(null)
	const innerHeight = $(0)
	const shouldShowHeight = $(0)
	
	function innerOnResize (event: SyntheticEvent<HTMLDivElement>) {
		// console.log("due to inner box resize, updating inner box height is", event.currentTarget.scrollHeight)
		innerHeight.value = event.currentTarget.scrollHeight
	}
	useEffect(() => {
		// console.log("due to inner box change, updating inner box height is", innerBox.current?.scrollHeight)
		innerHeight.value = innerBox.current?.scrollHeight||0
	}, [innerBox.current, _.children])
	
	useEffect(() => {
		if (_.show) {
			shouldShowHeight.value = innerHeight.value
		} else {
			shouldShowHeight.value = 0
		}
	}, [_.show])
	
	const outerStyles = define<CSSProperties>({
		height: `${shouldShowHeight.value}px`
	})
	
	return <>
		<div className={classes(css.outerBox)} style={outerStyles}>
			<div className={classes(css.innerBox)} ref={innerBox} onResize={innerOnResize}>
				{_.children}
			</div>
		</div>
	</>
	
}

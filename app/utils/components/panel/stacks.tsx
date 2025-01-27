import { ReactNode } from "react"

import { classes } from "~/utils/jsx-helper"

import css from "./stacks.module.stylus"

export function VerticalStack (props: { children: ReactNode }) {
	return <div className={classes(css.verticalStack)}>
		{props.children}
	</div>
}

export function FlexStack (props: { children: ReactNode }) {
	return <div className={classes(css.flexStack)}>
		{props.children}
	</div>
}

export function HorizontalStack (props: { children: ReactNode, align?: 'center' }) {
	return <div className={classes(css.horizontalStack, css[props.align||''])}>
		{props.children}
	</div>
}

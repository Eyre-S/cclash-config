import { HTMLProps, ReactElement, useEffect } from 'react'
import { classes } from '../jsx-helper'
import { $ } from '../reactive'
import css from './slide-switch.module.stylus'

// export interface SlideSwitchItem {
	
// 	isEnabled?: boolean,
// 	node: React.ReactNode,
	
// 	property?: HTMLProps<HTMLDivElement>
	
// }

export type SlideSwitchItemProps = { isEnabled?: boolean } & HTMLProps<HTMLDivElement>
export function SlideSwitchItem ({
	className: classNameProps,
	isEnabled,
	children,
	...restProps
}: SlideSwitchItemProps) {
	
	return <>
		<div className={classes(css.slideSwitchItem, classNameProps)}
			{...restProps} >
			{ children }
		</div>
	</>
	
}

export function SlideSwitch ({
	children,
	className: boxPropertyClass,
	style: boxPropertyStyle,
	indicatorProps,
	...boxProperty
}: {
	
	children: ReactElement<SlideSwitchItemProps, typeof SlideSwitchItem>[],
	
	indicatorProps?: HTMLProps<HTMLDivElement>,
	
} & Omit<HTMLProps<HTMLDivElement>, 'children'>) {
	
	const enabled = $(-1)
	
	useEffect(() => {
		
		children.forEach((item, index) => {
			if (item.props.isEnabled) enabled.value = index
		})
		
	}, [children])
	
	const boxCss = {
		'--enabled-item-index': enabled.value
	} as React.CSSProperties
	
	const { className: indicatorClass, ...indicatorPropsRests } = indicatorProps||{}
	
	return <>
		<div className={classes(css.slideSwitch, boxPropertyClass)}
			style={Object.assign(boxCss, boxPropertyStyle)}
			{...boxProperty} >
			
			{children.map((item, index) => {
				
				let newProps = { ...item.props } satisfies SlideSwitchItemProps
				if (newProps.onClick === undefined) {
					newProps = { ...newProps, onClick: () => enabled.value = index }
				}
				
				return <SlideSwitchItem {...newProps} key={index} />
				
			})}
			
			<div className={classes(css.indicator, indicatorClass)} {...indicatorPropsRests} ></div>
		</div>
	</>
	
}

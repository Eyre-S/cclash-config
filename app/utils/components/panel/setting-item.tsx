import { ReactNode } from "react"

import { classes } from "~/utils/jsx-helper"

import css from "./setting-item.module.stylus"

export function SettingItem (props: { description: ReactNode, inputs: ReactNode }): ReactNode {
	
	return <>
		<div className={classes(css.settingItem)}>
			<div className={classes(css.descriptionBox)}>
				<div className={classes(css.descriptionContent)}>
					{props.description}
				</div>
			</div>
			{/* <div className={classes(css.gap)}></div> */}
			<div className={classes(css.inputsBox)}>
				<div className={classes(css.inputsContent)}>
					{props.inputs}
				</div>
			</div>
		</div>
	</>
	
}

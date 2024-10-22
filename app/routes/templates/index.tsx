import { classes } from '~/utils/jsx-helper'
import css from './index.module.stylus'

export default function TemplatesIndex () {
	return <>
		<div className={css.elementIndicator} />
		<div className={classes(css.backgrounds)}>
			<img src="/cclash.png" />
			<div className={classes(css.labels)}>
				<span>Choose one on the sidebar to edit or test, or click '+' to create a new one.</span>
			</div>
		</div>
	</>
}
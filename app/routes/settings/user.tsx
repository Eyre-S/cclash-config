import { classes } from "~/utils/jsx-helper";
import { $ } from "~/utils/reactive";

export default function ClientSettingsPage () {
	
	const shouldShowAll = $(false)
	
	return <>
		<div className={classes()}>
			<h1>Client Settings</h1>
		</div>
	</>
	
}

import { LoaderFunctionArgs } from "@remix-run/node"

import { requireUILogin } from "~/.server/auth"
import { classes } from "~/utils/jsx-helper"

import layoutCss from "./_layout.module.stylus"

export async function loader (args: LoaderFunctionArgs) {
	
	await requireUILogin(args.request)
	
	return null
	
}

export default function ServerSettingsPage () {
	
	return <>
		<div className={classes(layoutCss.innerPage)}>
			<h1>Server Configs</h1>
			<p>Not implemented...</p>
		</div>
	</>
	
}

import { LoaderFunctionArgs } from "react-router"
import { Link } from "react-router"

import { classes } from "~/utils/jsx-helper"

import css from "./index.module.stylus"
import { defineAppTitle, defineMeta } from "~/universal/app-meta"

export const meta = defineMeta((args) => [
	defineAppTitle(args.matches)
])

export async function loader ({}: LoaderFunctionArgs) {
	
	return {};
	
}

export default function Index() {
	return (
		<>
			<div className={classes(css.page)}>
				<img src="/cclash.png" />
				<table><tbody>
					<tr>
						<td>Login to unlock full access</td>
						<td><Link to="/login">/login</Link></td>
					</tr>
					<tr>
						<td>Edit or test templates</td>
						<td><Link to="/templates">/templates/$uuid</Link></td>
					</tr>
					<tr>
						<td>Change website or user settings</td>
						<td><Link to="/settings">/settings</Link></td>
					</tr>
					<tr>
						<td>API Endpoints</td>
						<td><Link to="/api" reloadDocument>/api</Link></td>
					</tr>
				</tbody></table>
			</div>
		</>
	);
}

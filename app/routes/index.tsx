import { LoaderFunctionArgs } from "@remix-run/node"
import { Link } from "@remix-run/react"

import { classes } from "~/utils/jsx-helper"

import css from "./index.module.stylus"

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

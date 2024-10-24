import { Outlet } from "@remix-run/react";
import { Link } from "react-router-dom";
import { classes } from "~/utils/jsx-helper";

import css from './_layout.module.stylus'
import moduleCss from "~/css/modules/module-css";

export default function SettingsLayout () {
	
	return <>
		<div className={classes(css.settingsPage, moduleCss.page.page)}>
			
			<div className={classes(css.header)}>
				<div className={classes(css.title)}>
					<h2>Settings</h2>
				</div>
				<div className={classes(css.nav)}>
					<Link to="user">User</Link>
					<Link to="server">Server</Link>
				</div>
			</div>
			
			<div className={classes(css.subPage)}>
				<Outlet />
			</div>
			
		</div>
	</>
	
}

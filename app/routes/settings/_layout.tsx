import { Outlet, useMatches } from "@remix-run/react";
import { Link, useOutletContext } from "react-router-dom";
import { classes } from "~/utils/jsx-helper";

import css from './_layout.module.stylus'
import moduleCss from "~/css/modules/module-css";
import { SlideSwitch, SlideSwitchItem } from "~/utils/components/slide-switch";
import { ReactNode, useEffect } from "react";
import { $ } from "~/utils/reactive";
import { is } from "~/utils/fp";
import { defineAppTitle, defineMeta } from "~/universal/app-meta";
import { AppLayoutContext } from "~/root";

export const meta = defineMeta((args) => {
	return [
		defineAppTitle(args.matches, 'Settings')
	]
})

export function SettingsNav (targetPath: string, children: ReactNode, status: string) {
	const enabled = status == targetPath
	return <SlideSwitchItem className={classes(css.navItem, is(enabled, css.enabled))}
		isEnabled={enabled}
		onClick={()=>{}} >
		<Link to={targetPath}>{children}</Link>
	</SlideSwitchItem>
}

export interface SettingsLayoutContext extends AppLayoutContext {}

export default function SettingsLayout () {
	
	const layoutContext = useOutletContext<AppLayoutContext>()
	const routes = useMatches()
	
	const currentOnSubPage = $('')
	
	useEffect(() => {
		currentOnSubPage.value = routes[2].id.split('/')[1]
	}, [routes])
	
	return <>
		<div className={classes(css.settingsPage, moduleCss.page.page)}>
			
			<div className={classes(css.header)}>
				<SlideSwitch className={classes(css.nav)}>
					{SettingsNav('user', 'User', currentOnSubPage.value)}
					{SettingsNav('server', 'Server', currentOnSubPage.value)}
				</SlideSwitch>
			</div>
			
			<div className={classes(css.subPageBox)}>
				<div className={classes(css.subPageContainer)}></div>
				<Outlet context={{...layoutContext} satisfies SettingsLayoutContext} />
			</div>
			
		</div>
	</>
	
}

import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useMatches,
	useNavigation,
	useRouteLoaderData,
} from "@remix-run/react";

import './root.stylus';
import css from './root.module.stylus'
import { classes } from "./utils/jsx-helper";
import { is, iss } from "./utils/fp";
import { server_config } from "./.server/config";
import React, { CSSProperties, forwardRef, Ref, useImperativeHandle, useRef } from "react";
import { $ } from "./utils/reactive";

export function AppNavigatorLink (props: { to: string, children: React.ReactNode, className?: string, onCurrent?: () => any, onNonCurrent?: () => any}) {
	const onCurrentLast = $(false)
	const toNormalized = props.to.startsWith('/') ? props.to : '/' + props.to
	const currentRoute = useMatches()
	const isOnCurrent = currentRoute[1]?.pathname == toNormalized
	if (onCurrentLast.value != isOnCurrent) {
		onCurrentLast.value = isOnCurrent
		if (isOnCurrent) (props.onCurrent||(()=>{}))()
		else (props.onNonCurrent||(()=>{}))()
	}
	return <>
		<Link to={props.to} className={classes(css.navigatorItem, is(isOnCurrent, css.on), props.className)}>
			{props.children}
		</Link>
	</>
}

export interface AppNavigationBar_Exposed {
	unsetCurrentIndex: () => void
}

export const AppNavigationBar = forwardRef(function AppNavigationBar (props: {}, ref: Ref<AppNavigationBar_Exposed>) {
	
	const currentEnabled = $(-1)
	
	let navIdStyles = {
		'--nav-current-index': currentEnabled.value
	} as CSSProperties
	
	useImperativeHandle(ref, () => {return {
		unsetCurrentIndex: () => {
			currentEnabled.value = -1
		}
	}})
	
	return <>
		<div className={classes(css.navigatorBox)}>
			<div className={classes(css.navigatorIndicator)} style={navIdStyles} />
			<AppNavigatorLink onCurrent={() => currentEnabled.value = 0} to="templates">Templates</AppNavigatorLink>
			<AppNavigatorLink onCurrent={() => currentEnabled.value = 1} to="settings">Settings</AppNavigatorLink>
			<AppNavigatorLink onCurrent={() => currentEnabled.value = 2} to="login">Login</AppNavigatorLink>
		</div>
	</>
	
})

export function AppHeader (_: {siteName: string, siteIcon: string}) {
	
	const appNavigationBar = useRef<AppNavigationBar_Exposed>(null)
	
	return <>
		
		<div className={classes(css.pageHeader)}>
			
			<div className={classes(css.left)}>
				<AppNavigatorLink to="/" className={classes(css.logo)} onCurrent={() => appNavigationBar.current?.unsetCurrentIndex()}>
					<img src={_.siteIcon} alt="logo" />
				</AppNavigatorLink>
			</div>
			
			<div className={classes(css.title)}>
				<span>{ _.siteName }</span>
			</div>
			
			<div className={classes(css.right)}>
				<AppNavigationBar ref={appNavigationBar} />
			</div>
			
		</div>
		
	</>
	
}

export async function loader () {
	
	return {
		siteName: server_config.site_name
	}
	
}

export function Layout({ children }: { children: React.ReactNode }) {
	
	const navigation = useNavigation()
	const data = useRouteLoaderData<typeof loader>('root')
	if (data === undefined) {
		throw new Error('Website root information cannot be loaded.')
	}
	
	const shouldAppCoverShows = navigation.state != 'idle'
	
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<link rel="icon" href="/cclash.png" />
			</head>
			<body>
				<div id="app" className={classes(css.app)}>
					
					<AppHeader
						siteName={data.siteName}
						siteIcon="/cclash.png" />
					
					<div className={classes(css.pageBodyBox)}>
						<div className={classes(css.pageBody)}>
							{children}
						</div>
					</div>
					
					<div className={classes(css.appCover, iss(shouldAppCoverShows, css.show, css.notShow))}>
						<div className={classes(css.progress)} />
					</div>
					
				</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
	
}

export default function App() {
	return <Outlet />;
}

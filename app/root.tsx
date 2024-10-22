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

export function AppNavigatorLink (_: { to: string, children: React.ReactNode, className?: string }) {
	const toNormalized = _.to.startsWith('/') ? _.to : '/' + _.to
	const currentRoute = useMatches()
	const isOnCurrent = currentRoute[1]?.pathname == toNormalized
	return <>
		<Link to={_.to} className={classes(is(isOnCurrent, css.on), _.className)}>
			{_.children}
		</Link>
	</>
}

export async function loader () {
	
	return {
		siteName: server_config.site_name
	}
	
}

export function Layout({ children }: { children: React.ReactNode }) {
	
	const data = useRouteLoaderData<typeof loader>('root')
	if (data === undefined) {
		throw new Error('Website root information cannot be loaded.')
	}
	
	const navigation = useNavigation()
	
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
					
					<div className={classes(css.pageHeader)}>
						
						<div className={classes(css.left)}>
							<AppNavigatorLink to="/" className={classes(css.logo)}>
								<img src="/cclash.png" alt="logo" />
							</AppNavigatorLink>
						</div>
						
						<div className={classes(css.title)}>
							<span>{ data.siteName }</span>
						</div>
						
						<div className={classes(css.right)}>
							<AppNavigatorLink to="templates">Templates</AppNavigatorLink>
							<AppNavigatorLink to="settings">Settings</AppNavigatorLink>
							<AppNavigatorLink to="login">Login</AppNavigatorLink>
						</div>
						
					</div>
					
					<div className={classes(css.pageBody)}>
						{children}
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

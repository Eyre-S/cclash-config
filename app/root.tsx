import {
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useNavigation,
} from "@remix-run/react";

import './root.stylus';
import css from './root.module.stylus'
import { classes } from "./utils/jsx-helper";
import { iss } from "./utils/fp";

export const siteName = "CClash Config Deliver";

export function Layout({ children }: { children: React.ReactNode }) {
	
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
							<Link to="/" className={classes(css.logo)}>
								<img src="/cclash.png" alt="logo" />
							</Link>
						</div>
						
						<div className={classes(css.title)}>
							<span>{ siteName }</span>
						</div>
						
						<div className={classes(css.right)}>
							<Link to="/login">Login</Link>
							<Link to="/dashboard">Dashboard</Link>
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

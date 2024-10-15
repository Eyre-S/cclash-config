import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./index.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { requireUILogin } from "~/.server/auth";

export const meta: MetaFunction = () => {
	return [
		{ title: "Dashboard - CClash Config Deliver" },
	];
};

export async function loader ({ request }: LoaderFunctionArgs) {
	
	await requireUILogin(request)
	
	return {};
	
}

export default function Index() {
	return (
		<>
			<div className={classes(css.page)}>
				<img src="/cclash.png" />
			</div>
		</>
	);
}

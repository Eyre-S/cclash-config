import { redirect, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./_index.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { validateLogin } from "~/.server/auth";

export const meta: MetaFunction = () => {
	return [
		{ title: "Dashboard - CClash Config Deliver" },
	];
};

export async function loader ({ request }: LoaderFunctionArgs) {
	
	if (!await validateLogin(request)) {
		return redirect("/login");
	}
	
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

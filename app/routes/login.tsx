import { ActionFunctionArgs, json, redirect, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./login.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { Form } from "@remix-run/react";
import { checkToken } from "~/.server/auth";
import cookies from "~/apis/cookies";

export const meta: MetaFunction = () => {
	return [
		{ title: "Login - CClash Config Deliver" },
	];
};

export default function Index() {
	return (
		<>
			<div className={classes(css.page)}>
				<div className={classes(css.loginBox)}>
					<h1 className={classes(css.title)}>Login</h1>
					<Form method="post">
						<input type="password"
							name="token"
							placeholder="token..."
							className={classes(css.input, css.field)} />
						<input type="submit"
							className={classes(css.input, css.button)}
							value="login" />
					</Form>
				</div>
			</div>
		</>
	);
}

export async function action ({ request }: ActionFunctionArgs) {
	
	const body = await request.formData()
	const token = body.get("token")?.toString()
	if (token === undefined) {
		return json({ error: "token is required" }, { status: 400 })
	}
	
	if (checkToken(token)) {
		return redirect("/", {
			headers: {
				"set-cookie": await cookies.token.serialize(token)
			}
		})
	}
	
	return json({ error: "invalid token" }, { status: 400 })
	
}

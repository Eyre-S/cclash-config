import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./login.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { AuthSessionData } from "~/apis/sessions";
import { getCookieHeader } from "~/utils/http-helper";
import { checkToken } from "~/.server/auth";
import { it } from "~/utils/fp";
import { useRef, useState } from "react";
import { LoginResults } from "./api/login";
import { ApiResponseOk } from "~/apis/api";
import { wait } from "remix-utils/timers";

export const meta: MetaFunction = () => {
	return [
		{ title: "Login - CClash Config Deliver" },
	];
};

type AuthStatus = "success" | "fail" | "none"

export async function loader ({ request }: LoaderFunctionArgs) {
	
	const authSession = await AuthSessionData.getSession(getCookieHeader(request))
	if (authSession.has("token")) {
		if (checkToken(authSession.get("token") as string)) {
			return "success" satisfies AuthStatus
		} else {
			return "fail" satisfies AuthStatus
		}
	} else {
		return "none" satisfies AuthStatus
	}
	
}

export default function Index() {
	
	const navigate = useNavigate()
	
	const loginStatus = useLoaderData<typeof loader>()
	const [status_message, status_message_set] = useState(it(() => { switch (loginStatus) {
		case "success":
			return "logged in"
		case "fail":
			return "failed to login"
		case "none":
			return "not logged in"
	}}))
	const [login_message, login_message_set] = useState<string|null>(null)
	const [login_button_message, login_button_message_set] = useState("Login")
	const inputToken = useRef<HTMLInputElement>(null)
	async function doLogin () {
		try {
			const result = await fetch(`/api/login?token=${encodeURIComponent(inputToken.current?.value||"")}`, {
				method: "GET"
			})
			const result_json = await result.json() as ApiResponseOk<LoginResults>
			if (result_json.data.ok) {
				login_message_set("login success, will redirect in 3 seconds")
				login_button_message_set("Redirecting...")
				await wait(3000)
				navigate("/")
			} else {
				login_message_set("login failed")
				login_button_message_set("Login")
			}
		} catch {
			login_message_set("login failed due to unknown error")
			login_button_message_set("Login")
		}
	}
	
	return (
		<>
			<div className={classes(css.page)}>
				<div className={classes(css.loginBox)}>
					
					<h1 className={classes(css.title)}>Login</h1>
					<span><small>You are currently { status_message }</small></span>
					{ login_message && <span><small>{ login_message }</small></span> }
					<div className={classes(css.form)}>
						<input type="password"
							name="token"
							placeholder="token..."
							ref={inputToken}
							className={classes(css.input, css.field)} />
						<button type="submit"
							className={classes(css.input, css.button)}
							onClick={() => doLogin()}
							disabled={login_button_message != "Login"}>
							{ login_button_message }
						</button>
					</div>
					
				</div>
			</div>
		</>
	);
	
}

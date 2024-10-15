import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./login.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { AuthSessionData } from "~/apis/sessions";
import { getCookieHeader } from "~/utils/http-helper";
import { checkToken } from "~/.server/auth";
import { inCase, inCaseSafe, is, it } from "~/utils/fp";
import { useRef, useState } from "react";
import { LoginResults } from "./api/login";
import { ApiResponseOk } from "~/apis/api";
import { wait } from "remix-utils/timers";
import { $ } from "~/utils/reactive";
import { Gap } from "~/utils/components";

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
	
	const initialLoginStatus = useLoaderData<typeof loader>()
	const loggingActionStatus = $<"idle"|"logging-in"|"success-waiting"|"success-redir">("idle")
	const loggingResultStatus = $<"idle"|"success"|"fail"|'fail-err'>("idle")
	
	const inputToken = useRef<HTMLInputElement>(null)
	
	async function doLogin () {
		try {
			loggingResultStatus.value = "idle"
			loggingActionStatus.value = "logging-in"
			const result = await fetch(`/api/login?token=${encodeURIComponent(inputToken.current?.value||"")}`, {
				method: "GET"
			})
			const result_json = await result.json() as ApiResponseOk<LoginResults>
			if (result_json.data.ok) {
				loggingResultStatus.value = "success"
				loggingActionStatus.value = "success-waiting"
				await wait(3000)
				loggingActionStatus.value = "success-redir"
				navigate("/")
			} else {
				loggingResultStatus.value = 'fail'
				loggingActionStatus.value = "idle"
			}
		} catch {
			loggingResultStatus.value = 'fail-err'
			loggingActionStatus.value = 'idle'
		}
	}
	
	return (
		<>
			<div className={classes(css.page)}>
				<div className={classes(css.loginBox)}>
					
					<h1 className={classes(css.title)}>Login</h1>
					<div className={classes(css.noticeBox)}>
						{inCase(initialLoginStatus, [
							['none', <></>],
							[
								'success',
								<div className={classes(css.notice, css.currentStatus)}>
									<span>You are already logged in.</span>
								</div>
							],
							[
								'fail',
								<div className={classes(css.notice, css.currentStatus)}>
									<span>Your token seems already being invalid. Please re-login.</span>
								</div>
							],
						])}
						{inCase(loggingResultStatus.value, [
							['idle', <></>],
							[
								'success',
								<div className={classes(css.notice, css.newStatus)}>
									<span>Login succeed, redirecting...</span>
								</div>
							],
							[
								'fail',
								<div className={classes(css.notice, css.newStatus)}>
									<span>Login failed, please check your token and try again.</span>
								</div>
							],
							[
								'fail-err',
								<div className={classes(css.notice, css.newStatus)}>
									<span>Unknown error occurred.</span>
								</div>
							],
						])}
					</div>
					
					<Gap size="10px" />
					
					<div className={classes(css.form)}>
						<input type="password"
							name="token"
							placeholder="token..."
							ref={inputToken}
							onKeyDownCapture={e => {e.key == "Enter" && doLogin()}}
							className={classes(css.input, css.field)} />
						{/* <Gap size="10px" /> */}
						<button type="submit"
							className={classes(css.input, css.button)}
							onClick={() => doLogin()}
							disabled={loggingActionStatus.value != 'idle'}>
							{inCase (loggingActionStatus.value, [
								['idle',            'Login'],
								['logging-in',      'Logging in...'],
								['success-waiting', 'Success! waiting...'],
								['success-redir',   'Success! waiting...']
							])}
						</button>
					</div>
					
				</div>
			</div>
		</>
	);
	
}

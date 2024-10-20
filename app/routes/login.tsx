import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./login.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { LiveReload, useLoaderData, useNavigate } from "@remix-run/react";
import { AuthSessionData } from "~/apis/sessions";
import { getCookieHeader, getSearchParams } from "~/utils/http-helper";
import { checkToken } from "~/.server/auth";
import { aIt, inCase, is, it } from "~/utils/fp";
import { LoginResults } from "./api/login";
import { ApiResponseOk } from "~/apis/api";
import { wait } from "remix-utils/timers";
import { $ } from "~/utils/reactive";
import { Gap } from "~/utils/components";
import { InputButton, InputText } from "~/utils/components/Inputs";

export const meta: MetaFunction = () => {
	return [
		{ title: "Login - CClash Config Deliver" },
	];
};

type AuthStatus = "success" | "fail" | "none"

export async function loader ({ request }: LoaderFunctionArgs) {
	
	const isRedirect: string | null = getSearchParams(request).get("redirect")
	
	return {
		
		authStatus: await aIt<AuthStatus>(async () => {
			const authSession = await AuthSessionData.getSession(getCookieHeader(request))
			if (authSession.has("token")) {
				if (checkToken(authSession.get("token") as string)) {
					return "success"
				} else {
					return "fail"
				}
			} else {
				return "none"
			}
		}),
		
		redirAfterLogin: isRedirect satisfies string | null
		
	}
	
}

export default function Index() {
	
	const navigate = useNavigate()
	
	const {
		authStatus: initialLoginStatus,
		redirAfterLogin
	} = useLoaderData<typeof loader>()
	console.log(`User started login page with existing login status: `, initialLoginStatus)
	if (redirAfterLogin) console.log(`User is redirect from ${redirAfterLogin}, and will be redirected to there after login.`)
	
	const loggingActionStatus = $<"idle"|"logging-in"|"success-waiting"|"success-redir">("idle")
	const loggingResultStatus = $<"idle"|"success"|"fail"|'fail-err'>("idle")
	const inputPassword = $("")
	async function doLogin () {
		try {
			loggingResultStatus.value = "idle"
			loggingActionStatus.value = "logging-in"
			const result = await fetch(`/api/login?token=${encodeURIComponent(inputPassword.value)}`, {
				method: "GET"
			})
			const result_json = await result.json() as ApiResponseOk<LoginResults>
			if (result_json.data.ok) {
				loggingResultStatus.value = "success"
				loggingActionStatus.value = "success-waiting"
				await wait(1000)
				loggingActionStatus.value = "success-redir"
				if (redirAfterLogin) navigate(redirAfterLogin)
				else navigate("/")
			} else {
				loggingResultStatus.value = 'fail'
				loggingActionStatus.value = "idle"
			}
		} catch {
			loggingResultStatus.value = 'fail-err'
			loggingActionStatus.value = 'idle'
		}
	}
	
	const logOutActionStatus = $<"idle"|"requesting">("idle")
	const logOutResultStatus = $<"idle"|"success"|'fail-err'>("idle")
	async function doLogout () {
		logOutActionStatus.value = "requesting"
		try {
			const result = await fetch(`/api/logout`, {
				method: "GET"
			})
			const result_json = await result.json() as ApiResponseOk<LoginResults>
			if (result_json.data.ok) {
				logOutResultStatus.value = "success"
				await wait(1000)
				window.location.reload()
			} else {
				logOutResultStatus.value = 'fail-err'
			}
		} catch {
			logOutResultStatus.value = 'fail-err'
		}
		logOutActionStatus.value = 'idle'
	}
	
	const isInAction = loggingActionStatus.value != 'idle' || logOutActionStatus.value != 'idle'
	
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
						{is(redirAfterLogin, <>
							<div className={classes(css.notice, css.redirStatus)}>
								<span>You must login to access that page!</span><br/>
								<span><small>You will be redirected to {redirAfterLogin} after logged in.</small></span>
							</div>
						</>)}
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
						
						<InputText password className={[css.inputElem]} value={inputPassword.value} onValueChange={v => inputPassword.value = v} />
						
						<InputButton
							className={[css.inputButton]}
							onClick={() => doLogin()}
							disabled={isInAction}>
							{inCase (loggingActionStatus.value, [
								['idle',            <>Login</>],
								['logging-in',      <span className={css.waiting}>|</span>],
								['success-waiting', <>Success! waiting...</>],
								['success-redir',   <>Success! waiting...</>]
							])}
						</InputButton>
						
						{is(initialLoginStatus == 'success', <>
							<InputButton
								className={[css.inputButton]}
								onClick={() => doLogout()}
								disabled={isInAction}>
								{inCase (logOutActionStatus.value, [
									['idle',            <>Logout</>],
									['requesting',      <span className={css.waiting}>|</span>]
								])}
							</InputButton>
						</>)}
						
					</div>
					
				</div>
			</div>
		</>
	);
	
}

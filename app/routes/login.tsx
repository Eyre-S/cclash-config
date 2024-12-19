import { LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import css from "./login.module.stylus";
import { classes } from "~/utils/jsx-helper";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { AuthSessionData } from "~/apis/sessions";
import { getCookieHeader, getSearchParams } from "~/utils/http-helper";
import { checkToken } from "~/.server/auth";
import { aIt, inCase, is } from "~/utils/fp";
import { LoginResults } from "./api/login";
import { ApiResponseOk } from "~/apis/api";
import { wait } from "remix-utils/timers";
import { $ } from "~/utils/reactive";
import { Gap } from "~/utils/components";
import { InputButton, InputText } from "~/utils/components/Inputs";
import { defineAppTitle, defineMeta } from "~/universal/app-meta";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { errors } from "da4s";
import { I } from "~/utils/components/icons";

export const meta = defineMeta((args) => {
	return [
		defineAppTitle(args.matches, 'Login')
	]
})

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
	if (redirAfterLogin)
		console.log(`User is redirect from ${redirAfterLogin}, and will be redirected to there after login.`)
	useEffect(() => {
		
		console.log(`notifying redir`)
		if (redirAfterLogin) {
			toast(<>
				<p>You must login to access that page!</p>
				<p>You will be redirect to {redirAfterLogin} after successfully logged in.</p>
			</>, { position: 'top-center', type: 'warning' })
		}
		
		if (initialLoginStatus == 'fail') {
			toast(<>
				<p>Your token seems already being invalid. Please re-login.</p>
			</>, { position: 'top-center', type: 'warning' })
		} else if (initialLoginStatus == 'success') {
			toast(<>
				<p>You are currently already logged in.</p>
			</>, { position: 'top-center', type: 'info' })
		}
		
	}, [])
	
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
				toast(<>
					<p>Login succeed, redirecting...</p>
				</>, { position: 'top-center', type: 'success' })
				await wait(1000)
				loggingActionStatus.value = "success-redir"
				if (redirAfterLogin) navigate(redirAfterLogin)
				else navigate("/")
			} else {
				toast(<>
					<p>Login failed, please check your token and try again.</p>
				</>, { position: 'top-center', type: 'error' })
				loggingResultStatus.value = 'fail'
				loggingActionStatus.value = "idle"
			}
		} catch (e) {
			toast(<>
				<p>Login failed: Unknown error occurred.</p>
				<pre><code>{errors.normalError(e)}</code></pre>
			</>, { position: 'top-center', type: 'error' })
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
	const isCanLogin = !isInAction && inputPassword.value != ''
	
	return (
		<>
			<div className={classes(css.page)}>
				<div className={classes(css.loginBox)}>
					
					<h1 className={classes(css.title)}>Login</h1>
					
					<Gap size="10px" />
					
					<div className={classes(css.form)}>
						
						<div className={classes(css.inputElem)}>
							<label>Token</label>
							<InputText password value={inputPassword.value} onValueChange={v => inputPassword.value = v} />
						</div>
						
						<InputButton
							className={[css.inputButton]}
							onClick={() => doLogin()}
							disabled={!isCanLogin}>
							{inCase (loggingActionStatus.value, [
								['idle',            <>Login</>],
								['logging-in',      <span className={css.waiting}><I>progress_activity</I></span>],
								['success-waiting', <>Success! waiting...</>],
								['success-redir',   <>Success! waiting...</>]
							])}
						</InputButton>
						
						{is(initialLoginStatus == 'success', <>
							<InputButton
								className={[css.inputButton]}
								theme="red"
								onClick={() => doLogout()}
								disabled={isInAction}>
								{inCase (logOutActionStatus.value, [
									['idle',            <>Logout</>],
									['requesting',      <span className={css.waiting}><I>progress_activity</I></span>]
								])}
							</InputButton>
						</>)}
						
					</div>
					
				</div>
			</div>
		</>
	);
	
}

import { createCookieSessionStorage } from "@remix-run/node"
import { it } from "~/utils/fp"

export interface AuthSessionData {
	token: string
}

export const AuthSessionData = it(() => {
	const { getSession, commitSession, destroySession } = createCookieSessionStorage<AuthSessionData, undefined>({
		cookie: {
			name: "auth",
			sameSite: "strict",
			maxAge: 60 * 60 * 24 * 7,
			secrets: ["1070172019730"]
		}
	})
	return {
		getSession,
		commitSession,
		destroySession
	}
})

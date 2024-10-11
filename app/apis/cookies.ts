import { createCookie } from "@remix-run/node";

const token = createCookie("token", {
	maxAge: 60 * 60 * 24 * 30,
	httpOnly: true,
	secure: true,
	sameSite: "strict",
});

export default {
	token,
}

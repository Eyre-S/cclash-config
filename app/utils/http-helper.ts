export function getCookieHeader (request: Request): string | null {
	return request.headers.get("Cookie")
}

export function getSearchParams (request: Request): URLSearchParams {
	return new URL(request.url).searchParams
}

export function getPathOf (request: Request): string {
	return new URL(request.url).pathname
}

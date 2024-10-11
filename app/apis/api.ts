export interface ApiResponse {
	status: number
	timestamp: number
	time_date: string
}

export interface ApiResponseOk <T> extends ApiResponse {
	status: 200
	data: T
}

export interface ApiResponseError <T> extends ApiResponse {
	e_id: string
	message: string
	error: T
}

export function genBasicApiResponse (): ApiResponse {
	const currentDateTime = Date.now()
	return {
		status: -1,
		timestamp: currentDateTime,
		time_date: new Date(currentDateTime).toISOString()
	}
}

export function defineApiResponse <T> (data: T): ApiResponseOk<T> {
	const basicResponse = genBasicApiResponse() as ApiResponseOk<T>
	basicResponse.status = 200
	basicResponse.data = data
	return basicResponse
}

export function defineApiErrorResponse <T> (status: number, e_id: string, message: string, error: T|undefined = undefined): ApiResponseError <T> {
	const basicResponse = genBasicApiResponse() as ApiResponseError<T>
	basicResponse.e_id = e_id
	basicResponse.status = status
	basicResponse.message = message
	if (error) basicResponse.error = error
	return basicResponse
}

export function defineApiUniversalErrorResponse <T> (error: T, e_id?: string): ApiResponseError <any> {
	const basicResponse = genBasicApiResponse() as ApiResponseError<any>
	const _eid = e_id || "api_universal"
	if (error instanceof Error) {
		basicResponse.status = 500
		basicResponse.e_id = _eid + "_named"
		basicResponse.message = `Unknown Internal Server Error: ${Object.getPrototypeOf(error).constructor.name}`
		basicResponse.error = {
			name: error.name,
			message: error.message,
			cause: error.cause
		}
		return basicResponse
	}
	basicResponse.status = 500
	basicResponse.e_id = _eid + "_unknown"
	basicResponse.message = "Unknown Internal Server Error"
	basicResponse.error = error
	return basicResponse
}

export const API_RESPONSE_UNAUTHORIZED = defineApiErrorResponse(401, "api_unauthorized_universal", "Unauthorized")

export function exportResponse (response: ApiResponse): Response {
	return new Response(
		JSON.stringify(response),
		{
			status: response.status,
			headers: {
				"Content-Type": "application/json"
			}
		}
	)
}

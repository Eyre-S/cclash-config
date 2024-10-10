export interface ApiResponse {
	status: number
	timestamp: number
	time_date: string
}

export interface ApiResponseOk <T> extends ApiResponse {
	status: 200
	data: T
}

export interface ApiResponseError extends ApiResponse {
	message: string
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

export function defineApiResponseError (status: number, message: string): ApiResponseError {
	const basicResponse = genBasicApiResponse() as ApiResponseError
	basicResponse.status = status
	basicResponse.message = message
	return basicResponse
}

export const API_RESPONSE_UNAUTHORIZED = defineApiResponseError(401, "Unauthorized")

export function exportResponse (response: ApiResponse): Response {
	return new Response(
		JSON.stringify(response),
		{
			headers: {
				"Content-Type": "application/json"
			}
		}
	)
}

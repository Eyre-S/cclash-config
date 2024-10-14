import { useState } from "react"
import { xml } from "remix-utils/responses"

export function classes (...args: (string | undefined)[]): string {
	return args.filter(Boolean).join(" ")
}

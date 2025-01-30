import { useEffect } from "react"
import { useUnmount } from "react-use"

import { $, Reactive } from "./reactive"

export function useReadyState (): Reactive<boolean> {
	const isReady = $<boolean>(false)
	useEffect(() => { isReady.value = true }, [])
	useUnmount(() => { isReady.value = false })
	return isReady
}

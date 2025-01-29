import { Dispatch, MutableRefObject, SetStateAction, useRef, useState } from "react"
import { useDebounce } from "react-use"

export interface DebounceController {
	/**
	 * Returns true if the debounced value is ready.
	 * 
	 * - `false`: *pending*, means that the original value has changed and the debounced value is not ready yet.
	 * - `true`: *ready*, means that the debounced value is ready.
	 * - `null`: *initial*, means that the debounced value has not been initialized yet, or the debounce is
	 *   cancelled by the {@link cancelDebounce} function.
	 */
	isDebounceReady: () => boolean|null
	/** cancel the debounce */
	cancelDebounce: () => void
}

export class Reactive<T> {
	
	private readonly getter: T
	private readonly setter: Dispatch<SetStateAction<T>>
	
	constructor (initValue: T) {
		const [getter, setter] = useState(initValue)
		this.getter = getter
		this.setter = setter
	}
	
	get value (): T {
		return this.getter
	}
	
	set value (newValue: T) {
		this.setter(newValue)
	}
	
	public set (x: SetStateAction<T>): void {
		this.setter(x)
	}
	
	public runs (x: (newState: T) => void): void {
		this.setter((state) => {
			x(state)
			return state
		})
	}
	
	public state (): Promise<T> {
		return new Promise((resolve) => {
			this.runs((state) => {
				resolve(state)
			})
		})
	}
	
	/**
	 * Create a debounce listener for this reactive value.
	 * 
	 * Uses react-use's {@link useDebounce} hook.
	 * 
	 * @param delayMs the debounce delay to wait before updating the debounced value, in milliseconds.
	 * @param callback callback that will be called when the debounced value is ready(changed/updated).
	 */
	public addDebounceListener (delayMs: number, callback: (newValue: T) => void): DebounceController {
		const debounceController = useDebounce(callback, delayMs, [this.value])
		return {
			isDebounceReady: debounceController[0],
			cancelDebounce: debounceController[1]
		}
	}
	
}

export function $<T> (initValue: T): Reactive<T> {
	return new Reactive<T>(initValue)
}

export interface DebouncedMutableRefObject<T> extends MutableRefObject<T>, DebounceController {}

/**
 * Create a debounced ref value from a reactive value.
 * @param value the original reactive value. must be created by the {@link $} function (or being the
 *        {@link Reactive} object).
 * @param delayMs the debounce delay to wait before updating the debounced value, in milliseconds.
 * @param onDebounced callback that will be called when the debounced value is ready(changed/updated).
 * @returns a {@link DebouncedMutableRefObject}, which is a mutable ref object that contains the debounced value,
 *          with some additional debounce-related properties/functions.
 */
export function useDebouncedRef <T> (value: Reactive<T>, delayMs: number, onDebounced?: (newValue: T) => any): DebouncedMutableRefObject<T> {
	const debouncedRef = useRef(value.value)
	const controller = value.addDebounceListener(delayMs, () => {
		debouncedRef.current = value.value
		onDebounced?.(debouncedRef.current)
		if (onDebounced) onDebounced(value.value)
	})
	return {
		...debouncedRef,
		...controller
	}
}

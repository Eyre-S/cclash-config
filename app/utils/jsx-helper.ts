import { Reactive } from "./reactive"

export function classes (...args: (string | undefined)[]): string {
	return args.filter(Boolean).join(" ")
}

export function getInput (e: Event): HTMLInputElement {
	return e.target as HTMLInputElement
}

export function getInputValue (e: Event): HTMLInputElement['value'] {
	return getInput(e).value
}

export function bindInputValue <T> (value: Reactive<T>) {
	return {
		value: value.value,
		onValueChange: (newValue: T) => {
			value.value = newValue
		}
	}
}

export interface InputExternalValues {
	target: HTMLInputElement
	value: HTMLInputElement['value']
}

type EventFromInput = Event & {
	target: HTMLInputElement
}

type InputEventCapable = ((payload: Event) => void) | undefined

export function asOnInput (cb: (event: Event & InputExternalValues) => void): InputEventCapable {
	return (e: Event) => {
		cb(
			Object.assign(
				e as EventFromInput,
				{
					value: getInputValue(e)
				}
			)
		)
	}
}

import { Dispatch, SetStateAction, useState } from "react"

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
	
}

export function $<T> (initValue: T): Reactive<T> {
	return new Reactive<T>(initValue)
}

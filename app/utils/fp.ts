export function define <T> (value: T): T {
	return value
}

export function nonnull <T> (nonnullValue: T | null | undefined): T {
	if (typeof nonnullValue == 'undefined' || nonnullValue == null)
		throw new Error('Value is null or undefined')
	return nonnullValue
}

export function it <T> (func: () => T): T {
	return func()
}

export function aIt <T> (func: () => Promise<T>): Promise<T> {
	return func()
}

export function is <T> (statement: boolean|any, value: T): T | undefined {
	if (typeof statement == 'boolean') {
		return statement ? value : undefined
	} else {
		return statement ? value : undefined
	}
}

export function isIt <T> (statement: boolean|any, func: ()=>T): T | undefined {
	if (statement)
		return func()
	else return undefined
}

export function iss <T> (statement: boolean|any, value: T, orElse: T): T {
	if (typeof statement == 'boolean') {
		return statement ? value : orElse
	} else {
		return statement ? value : orElse
	}
}

export type CaseDefinition <T, R> = [CaseMatcherDefinition<T>, R]
export type CaseMatcherDefinition <T> = T | T[] | ((value: T) => boolean)

export function inCase <T, R> (value: T, cases: CaseDefinition<T, R>[]): R {
	return inCaseSafe(value, cases, () => { throw new Error('No case matched, in value ' + value) })
}

export function inCaseU <T, R> (value: T, cases: CaseDefinition<T, R>[]): R | undefined {
	return inCaseSafe(value, cases, () => undefined)
}

export function inCaseOr <T, R> (value: T, cases: CaseDefinition<T, R>[], orElse: R): R {
	return inCaseSafe(value, cases, () => orElse)
}

export function inCaseSafe <T, R> (value: T, cases: CaseDefinition<T, R>[], excepts: (value: T) => R): R {
	for (const [matcher, result] of cases) {
		if (typeof matcher == 'function') {
			if ((matcher as (v: T)=>R)(value)) {
				return result
			}
		} else if (Array.isArray(matcher)) {
			if (matcher.includes(value)) {
				return result
			}
		} else {
			if (matcher == value) {
				return result
			}
		}
	}
	return excepts(value)
}

export function select <T> (...value: (T|undefined)[]): T | undefined {
	for (const i of value)
		if (i !== undefined)
			return i
	return undefined
}

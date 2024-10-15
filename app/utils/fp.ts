export function it <T> (func: () => T): T {
	return func()
}

export function is <T> (statement: boolean|any, value: T): T | undefined {
	if (typeof statement == 'boolean') {
		return statement ? value : undefined
	} else {
		return statement ? value : undefined
	}
}

export function is_or <T> (statement: boolean|any, value: T, orElse: T): T {
	if (typeof statement == 'boolean') {
		return statement ? value : orElse
	} else {
		return statement ? value : orElse
	}
}

export function inCase <T, R> (value: T, cases: [T, R][]): R {
	return inCaseSafe(value, cases, () => { throw new Error('No case matched, in value ' + value) })
}

export function inCaseSafe <T, R> (value: T, cases: [T, R][], excepts: (value: T) => R): R {
	for (const cas of cases) {
		if (value === cas[0]) {
			return cas[1]
		}
	}
	return excepts(value)
}

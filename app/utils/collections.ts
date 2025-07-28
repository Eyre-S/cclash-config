export function array2map <T> (arr: T[], keyFunc: (item: T) => string): Record<string, T> {
	return arr.reduce((acc, item) => {
		const key = keyFunc(item)
		acc[key] = item
		return acc
	}, {} as Record<string, T>)
}
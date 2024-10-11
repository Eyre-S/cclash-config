export function classes (...args: (string | undefined)[]): string {
	return args.filter(Boolean).join(" ")
}
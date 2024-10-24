import hljs from "highlight.js"

export const supportedLanguages = ['apex', 'azcli', 'bat', 'c', 'clojure', 'coffeescript', 'cpp', 'csharp', 'csp', 'css', 'dockerfile', 'fsharp', 'go', 'graphql', 'handlebars', 'html', 'ini', 'java', 'javascript', 'json', 'kotlin', 'less', 'lua', 'markdown', 'msdax', 'mysql', 'objective-c', 'pascal', 'perl', 'pgsql', 'php', 'plaintext', 'postiats', 'powerquery', 'powershell', 'pug', 'python', 'r', 'razor', 'redis', 'redshift', 'ruby', 'rust', 'sb', 'scheme', 'scss', 'shell', 'sol', 'sql', 'st', 'swift', 'tcl', 'typescript', 'vb', 'xml', 'yaml']

export function guessCodeLanguage (code: string): string {
	
	return hljs.highlightAuto(code, supportedLanguages).language||'plaintext'
	
}

export function showSpecialChars (code: string): string {
	return code
		.replace(/\r/g, 'CR')
		.replace(/\n/g, 'LF')
		.replace(/\t/g, 'TAB')
		.replace(/ /g, 'SPACE')
}


export interface TemplateIndexDef {
	uuid: string,
	name: string,
	alias: string[]
}

export type TemplateIndexList = TemplateIndexDef[]

export interface TemplateIndex extends TemplateIndexDef {
	
	getTemplate (): string
	getTemplateHash (): string
	writeTemplate (write: string): void
	getComments (): string
	writeComments (write: string): void
	listConfigs (): string
	getConfigs (): TemplateConfig[]
	getConfig (configName: string): TemplateConfig|null
	
	deleteThis (): Promise<void>
	
}

export interface TemplateConfig {
	name: string,
	is_raw: boolean,
	targets: string[]
}

export class TemplateConfigs {
	
	static readonly DEFAULT_RAW_NAME: string = "[raw]"
	
	public static getDefaultRaw (): TemplateConfig {
		return {
			name: TemplateConfigs.DEFAULT_RAW_NAME,
			is_raw: true,
			targets: []
		}
	}
	
}

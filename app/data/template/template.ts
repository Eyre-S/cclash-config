export interface TemplateIndexDef {
	uuid: string,
	name: string,
	alias: string[]
}

export type TemplateIndexList = TemplateIndexDef[]

export interface TemplateIndex extends TemplateIndexDef {
	
	getTemplate (): Promise<string>
	getTemplateHash (): Promise<string>
	writeTemplate (write: string): Promise<void>
	
	getComments (): Promise<string>
	writeComments (write: string): Promise<void>
	
	listConfigs (): Promise<string>
	getConfigs (): Promise<TemplateConfig[]>
	getConfig (configName: string): Promise<TemplateConfig|null>
	
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

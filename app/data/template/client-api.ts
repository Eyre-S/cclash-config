import { ClientAPIs } from "~/routes/api"
import { APIs_Authed } from "~/routes/api/require-auth"
import { APIs_Get } from "~/routes/api/require-auth/get"
import { TemplateAboutResponse } from "~/routes/api/require-auth/get/about"

import { TemplateConfig, TemplateIndex } from "./template"

class TemplateIndexByWebAPI implements TemplateIndex {
	
	private readonly authedAPI: APIs_Authed;
	
	public uuid: string;
	public name: string;
	public alias: string[];
	
	private constructor(uuid: string, name: string, alias: string[], authedAPI: APIs_Authed) {
		this.uuid = uuid;
		this.name = name;
		this.alias = alias;
		this.authedAPI = authedAPI;
	}
	
	public static fromAboutAPIResponse (authedAPI: APIs_Authed, resp: TemplateAboutResponse): TemplateIndexByWebAPI {
		return new TemplateIndexByWebAPI(resp.uuid, resp.name, resp.alias, authedAPI);
	}
	
	private thisAPI (): APIs_Get {
		return this.authedAPI.get.byUUID(this.uuid);
	}
	
	getTemplate(): Promise<string> {
		return new Promise((resolve, reject) => {
			this.thisAPI().raw({
				onSuccess: (data) => resolve(data),
				onTemplateNotFound: (data) => reject(new Error(`Template not found: ${data.requesting_template_name}`)),
				onUnknownApiError: (data) => reject(new Error(`Unknown API error: ${data.message}`)),
				onInvalidApiResponse: (data) => reject(new Error(`Invalid API response: ${data.message}`)),
				onUnknownError: (data) => reject(new Error(`Unknown error: ${JSON.stringify(data)}`))
			});
		});
	}
	getTemplateHash(): Promise<string> {
		return new Promise((resolve, reject) => {
			this.thisAPI().about({
				onSuccess: (data) => resolve(data.sha1),
				onTemplateNotFound: (data) => reject(new Error(`Template not found: ${data.requesting_template_name}`)),
				onUnknownApiError: (data) => reject(new Error(`Unknown API error: ${data.message}`)),
				onInvalidApiResponse: (data) => reject(new Error(`Invalid API response: ${data.message}`)),
				onUnknownError: (data) => reject(new Error(`Unknown error: ${JSON.stringify(data)}`))
			});
		});
	}
	writeTemplate(write: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.thisAPI().set(write, {
				onSuccess: () => resolve(),
				onTemplateNotFound: (data) => reject(new Error(`Template not found: ${data.requesting_template_name}`)),
				onUnknownApiError: (data) => reject(new Error(`Unknown API error: ${data.message}`)),
				onInvalidApiResponse: (data) => reject(new Error(`Invalid API response: ${data.message}`)),
				onUnknownError: (data) => reject(new Error(`Unknown error: ${JSON.stringify(data)}`))
			});
		});
	}
	getComments(): Promise<string> {
		return new Promise((resolve, reject) => {
			this.thisAPI().comment({
				onSuccess: (data) => resolve(data),
				onTemplateNotFound: (data) => reject(new Error(`Template not found: ${data.requesting_template_name}`)),
				onUnknownApiError: (data) => reject(new Error(`Unknown API error: ${data.message}`)),
				onInvalidApiResponse: (data) => reject(new Error(`Invalid API response: ${data.message}`)),
				onUnknownError: (data) => reject(new Error(`Unknown error: ${JSON.stringify(data)}`))
			});
		});
	}
	async writeComments(write: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	async listConfigs(): Promise<string> {
		throw new Error("Method not implemented.");
	}
	async getConfigs(): Promise<TemplateConfig[]> {
		throw new Error("Method not implemented.");
	}
	async getConfig(configName: string): Promise<TemplateConfig | null> {
		throw new Error("Method not implemented.");
	}
	deleteThis(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.thisAPI().delete({
				onSuccess: () => resolve(),
				onTemplateNotFound: (data) => reject(new Error(`Template not found: ${data.requesting_template_name}`)),
				onUnknownApiError: (data) => reject(new Error(`Unknown API error: ${data.message}`)),
				onInvalidApiResponse: (data) => reject(new Error(`Invalid API response: ${data.message}`)),
				onUnknownError: (data) => reject(new Error(`Unknown error: ${JSON.stringify(data)}`))
			})
		})
	}
	
}

export class TemplateIndexesWeb {
	
	private readonly authedAPI: APIs_Authed
	
	private constructor (authedAPI: APIs_Authed) {
		this.authedAPI = authedAPI;
	}
	
	public static fromCookieAuth (): TemplateIndexesWeb {
		return new TemplateIndexesWeb(ClientAPIs.auths.byCookies);
	}
	
	public static fromTokenAuth (token: string): TemplateIndexesWeb {
		return new TemplateIndexesWeb(ClientAPIs.auths.byToken(token));
	}
	
	public async listTemplates(): Promise<TemplateIndexByWebAPI[]> {
		throw new Error("Method not implemented.");
	}
	
	public async find (name: string): Promise<TemplateIndexByWebAPI|null> {
		throw new Error("Method not implemented.");
	}
	
	public async findByUUID (uuid: string): Promise<TemplateIndexByWebAPI|null> {
		throw new Error("Method not implemented.");
	}
	
	public async findByNameOrAlias (name: string): Promise<TemplateIndexByWebAPI|null> {
		throw new Error("Method not implemented.");
	}
	
	public async create (name: string, alias: string[]): Promise<TemplateIndexByWebAPI> {
		throw new Error("Method not implemented.");
	}
	
}

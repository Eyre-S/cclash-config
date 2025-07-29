import { TemplateAboutResponse } from "~/routes/api/require-auth/get/about";
import { TemplateConfig, TemplateIndex } from "./template";

class TemplateIndexByWebAPI implements TemplateIndex {
	
	public uuid: string;
	public name: string;
	public alias: string[];
	
	private constructor(uuid: string, name: string, alias: string[]) {
		this.uuid = uuid;
		this.name = name;
		this.alias = alias;
	}
	
	public static fromAboutAPIResponse (resp: any): TemplateAboutResponse {
		throw new Error("Method not implemented.")
	}
	
	async getTemplate(): Promise<string> {
		throw new Error("Method not implemented.");
	}
	async getTemplateHash(): Promise<string> {
		throw new Error("Method not implemented.");
	}
	async writeTemplate(write: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
	async getComments(): Promise<string> {
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
	}
	
}

export class TemplateIndexesWeb {
	
	public static async listTemplates(): Promise<TemplateIndexByWebAPI[]> {
		throw new Error("Method not implemented.");
	}
	
	public static async find (name: string): Promise<TemplateIndexByWebAPI|null> {
		throw new Error("Method not implemented.");
	}
	
	public static async findByUUID (uuid: string): Promise<TemplateIndexByWebAPI|null> {
		throw new Error("Method not implemented.");
	}
	
	public static async findByNameOrAlias (name: string): Promise<TemplateIndexByWebAPI|null> {
		throw new Error("Method not implemented.");
	}
	
	public static async create (name: string, alias: string[]): Promise<TemplateIndexByWebAPI> {
		throw new Error("Method not implemented.");
	}
	
}

import fs from "fs";
import { server_root } from "../config";
import { z } from "zod";
import { randomUUID } from "crypto";
import { iss } from "~/utils/fp";
import CryptoJS from "crypto-js";

const templates_root = server_root + "/templates"

fs.mkdirSync(templates_root, { recursive: true })

const TemplateIndexDef = z.object({
	uuid: z.string().uuid(),
	name: z.string(),
	alias: z.string().array().default([]),
})
export type TemplateIndexDef = z.infer<typeof TemplateIndexDef>
const IndexDef = TemplateIndexDef.array()
export type IndexDef = z.infer<typeof IndexDef>

export class TemplateIndex {
	
	public readonly uuid: string
	public readonly name: string
	public readonly alias: string[]
	
	constructor (def: TemplateIndexDef) {
		this.uuid = def.uuid
		this.name = def.name
		this.alias = def.alias
	}
	
	public getPath (file?: string): string {
		const path = templates_root + "/" + this.uuid
		if (!fs.existsSync(path))
			fs.mkdirSync(path, { recursive: true })
		return iss(file, path + "/" + file, path)
	}
	
	public getTemplate (): string {
		const path = this.getPath('template')
		if (!fs.existsSync(path))
			fs.writeFileSync(path, "")
		return fs.readFileSync(path, "utf-8")
	}
	
	public getTemplateHash (): string {
		return CryptoJS.SHA1(this.getTemplate()).toString()
	}
	
	public writeTemplate (write: string) {
		const path = this.getPath() + "/template"
		fs.writeFileSync(path, write, { encoding: "utf-8" })
	}
	
	public getComments (): string {
		const path = this.getPath() + "/comments"
		if (!fs.existsSync)
			fs.writeFileSync(path, "")
		return fs.readFileSync(path, "utf-8")
	}
	
	public getConfigs (): string {
		const path = this.getPath() + "/config.json"
		if (!fs.existsSync)
			fs.writeFileSync(path, JSON.stringify({}))
		return fs.readFileSync(path, "utf-8")
	}
	
	public static readIndex (): IndexDef {
		const index_file = fs.readFileSync(templates_root + "/index.json", "utf-8")
		const index = IndexDef.parse(JSON.parse(index_file))
		return index
	}
	public static writeIndex (write: IndexDef) {
		const index = JSON.stringify(write, null, '\t')
		fs.writeFileSync(templates_root + "/index.json", index, { encoding: "utf-8" })
	}
	
	public static findByUUID (uuid: string): TemplateIndex|null {
		const index = TemplateIndex.readIndex()
		const found = index.find((item) => item.uuid === uuid)
		if (!found) {
			return null
		}
		return new TemplateIndex(found)
	}
	
	public static findByName (name: string): TemplateIndex|null {
		const index = TemplateIndex.readIndex()
		const found = index.find((item) => {
			if (item.name === name) {
				return true
			}
			return item.alias.includes(name)
		})
		if (!found) {
			return null
		}
		return new TemplateIndex(found)
	}
	
	public static find (nameOrUUID: string): TemplateIndex|null {
		const index = TemplateIndex.readIndex()
		const found = index.find((item) => {
			if (item.name === nameOrUUID || item.uuid === nameOrUUID) {
				return true
			}
			return item.alias.includes(nameOrUUID)
		})
		if (!found) {
			return null
		}
		return new TemplateIndex(found)
	}
	
	public static create (name: string): TemplateIndex {
		const indexDef: TemplateIndexDef = {
			uuid: randomUUID(),
			name: name,
			alias: []
		}
		TemplateIndex.writeIndex([...TemplateIndex.readIndex(), indexDef])
		return new TemplateIndex(indexDef)
	}
	
}

export function readTemplate (name: string): string|null {
	
	try {
		const template = TemplateIndex.find(name)
		if (template === null) {
			return null
		}
		return template.getTemplate()
	} catch (e) {
		return null
	}
	
}

export function readTemplateComment (name: string): string|null {
	
	try {
		const template = TemplateIndex.find(name)
		if (template === null) {
			return null
		}
		return template.getComments()
	} catch (e) {
		return null
	}
	
}

export function readTemplateConfigs (name: string): string|null {
	
	try {
		const template = TemplateIndex.find(name)
		if (template === null) {
			return null
		}
		return template.getConfigs()
	} catch (e) {
		return null
	}
	
}

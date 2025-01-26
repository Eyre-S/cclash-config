import fs from "fs";
import { server_root } from "../config";
import { z } from "zod";
import { randomUUID } from "crypto";
import { iss } from "~/utils/fp";
import CryptoJS from "crypto-js";
import files from "~/utils/files";

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
		if (!fs.existsSync(path))
			fs.writeFileSync(path, "")
		return fs.readFileSync(path, "utf-8")
	}
	
	public getConfigs (): string {
		const path = this.getPath() + "/config.json"
		if (!fs.existsSync(path))
			fs.writeFileSync(path, JSON.stringify({}))
		return fs.readFileSync(path, "utf-8")
	}
	
	/**
	 * Delete template.
	 * 
	 * This will do the following things:
	 * - Delete the template files that stored in {@link getPath()} recursively.
	 * - Delete the template metadata from the template index using {@link deleteFromIndex()}.
	 * 
	 * This method does not process the errors, so you should handle the errors by yourself.
	 */
	public async deleteThis (): Promise<void> {
		const path = fs.realpathSync(this.getPath() + "/")
		console.log("deleting template at", path)
		await files.removeRecursively(path)
		TemplateIndex.deleteFromIndex(this.uuid)
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
		if (nameOrUUID.startsWith('uuid:')) {
			return TemplateIndex.findByUUID(nameOrUUID.substring('uuid:'.length))
		} else {
			return TemplateIndex.findByName(nameOrUUID)
		}
	}
	
	/**
	 * @throws TemplateCreateError
	 */
	public static create (name: string, alias: string[] = []): TemplateIndex {
		
		// create new template index object
		const indexDef: TemplateIndexDef = {
			uuid: randomUUID(),
			name: name,
			alias: alias
		}
		
		const currentIndexes = TemplateIndex.readIndex()
		
		// check duplicate or illegal name
		if (indexDef.name.startsWith('uuid:')) {
			throw new TemplateCreateError("Template name cannot start with 'uuid:'.")
		}
		for (const alias of indexDef.alias) {
			if (alias.startsWith('uuid:')) {
				throw new TemplateCreateError("Template alias name cannot start with 'uuid:'.")
			}
		}
		for (const item of currentIndexes) {
			if (item.name === indexDef.name) {
				throw new TemplateCreateError("Template with this name already exists.")
			}
		}
		
		// execute writes
		TemplateIndex.writeIndex([...currentIndexes, indexDef])
		return new TemplateIndex(indexDef)
		
	}
	
	/**
	 * Delete a template metadata from the template index.
	 * 
	 * This only delete the metadata, not the actual template files.
	 * 
	 * @param uuid The template UUID to delete.
	 * @returns How much templates are deleted.
	 */
	public static deleteFromIndex (uuid: string): number {
		const currentIndexes = TemplateIndex.readIndex()
		const newIndexes = currentIndexes.filter((item) => item.uuid !== uuid)
		TemplateIndex.writeIndex(newIndexes)
		return currentIndexes.length - newIndexes.length;
	}
	
}

export class TemplateCreateError extends Error {
	public constructor (message: string) {
		super(message)
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

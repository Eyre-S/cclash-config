import { randomUUID } from "crypto"
import { database } from "../.server/database"
import { TemplateConfig, TemplateIndexDef, TemplateIndexList } from "./template"
import { type TemplateIndex } from "./template"

class TemplateIndexFromDatabaseV1 implements TemplateIndex {
	
	readonly uuid: string
	readonly name: string
	readonly alias: string[]
	
	private constructor (uuid: string, name: string, alias: string[]) {
		this.uuid = uuid
		this.name = name
		this.alias = alias
	}
	
	public static allUUIDs (): string[] {
		const sql = database.prepare("select distinct uuid from templates_identifiers;")
		const data = sql.all() as { uuid: string }[]
		return data.map((i) => i.uuid as string)
	}
	
	public static fromUUID (uuid: string): TemplateIndexFromDatabaseV1|null {
		const sql = database.prepare("select name, is_primary from templates_identifiers where uuid = ?")
		const data = sql.all(uuid) as { name: string, is_primary: number }[]
		if (data.length === 0) return null
		const alias = []
		let name: string | undefined = undefined
		for (const i of data) {
			if (i.is_primary) {
				name = i.name as string
			} else {
				alias.push(i.name as string)
			}
		}
		if (name === undefined) {
			throw new Error(`Template ${uuid}'s primary name not found in database.`)
		}
		return new TemplateIndexFromDatabaseV1(uuid, name, alias)
	}
	
	public static fromName (name: string): TemplateIndexFromDatabaseV1|null {
		const sql = database.prepare("select uuid from templates_identifiers where name = ?")
		const data = sql.get(name) as { uuid: string } | undefined
		if (!data) return null
		return TemplateIndexFromDatabaseV1.fromUUID(data.uuid as string)
	}
	
	public static create (def: TemplateIndexDef): TemplateIndexFromDatabaseV1 {
		
		const CREATE_PRIMARY = database.prepare("insert into templates_identifiers (uuid, name, is_primary) values (:uuid, :name, 1);")
		const CREATE_ALIAS = database.prepare("insert into templates_identifiers (uuid, name, is_primary) values (:uuid, :alias, 0);")
		const INIT_DATA = database.prepare("insert into templates_data (uuid, content, comment) values (:uuid, '', '');")
		const createItem = database.transaction((def: TemplateIndexDef) => {
			CREATE_PRIMARY.run({ uuid: def.uuid, name: def.name })
			for (const alias of def.alias) {
				CREATE_ALIAS.run({ uuid: def.uuid, alias })
			}
			INIT_DATA.run({ uuid: def.uuid })
		})
		
		createItem(def)
		
		return new TemplateIndexFromDatabaseV1(def.uuid, def.name, def.alias)
		
	}
	
	public getTemplate (): string {
		const sql = database.prepare("select content from templates_data where uuid = ?")
		const data = sql.get(this.uuid) as { content: string|null } | undefined
		if (!data) {
			throw new Error(`Template with UUID ${this.uuid} not found in database.`)
		} else if (!data.content) {
			return ""
		}
		return data.content
	}
	
	public getTemplateHash (): string {
		return CryptoJS.SHA1(this.getTemplate()).toString()
	}
	
	public writeTemplate (write: string) {
		const sql = database.prepare("update templates_data set content = ? where uuid = ?")
		sql.run(write, this.uuid)
	}
	
	public getComments (): string {
		const sql = database.prepare("select comment from templates_data where uuid = ?")
		const data = sql.get(this.uuid) as { comment: string|null } | undefined
		if (!data) {
			throw new Error(`Template with UUID ${this.uuid} not found in database.`)
		} else if (!data.comment) {
			return ""
		}
		return data.comment
	}
	
	public writeComments (write: string): void {
		const sql = database.prepare("update templates_data set comment = ? where uuid = ?")
		sql.run(write, this.uuid)
	}
	
	public listConfigs (): string {
		const sql = database.prepare("select config_name from templates_configs where uuid = ?")
		const data = sql.get(this.uuid) as { config_name: string } | undefined
		if (!data) {
			throw new Error(`Template with UUID ${this.uuid} not found in database.`)
		}
		return data.config_name
	}
	
	public getConfigs(): TemplateConfig[] {
		const sql = database.prepare("select config_name, is_raw, targets from templates_configs where uuid = ?")
		const data = sql.all(this.uuid) as { config_name: string, is_raw: number, targets: string|null }[]
		const configs: TemplateConfig[] = []
		for (const item of data) {
			configs.push({
				name: item.config_name,
				is_raw: item.is_raw ? true : false,
				targets: item.targets?.split(',') || []
			})
		}
		return configs
	}
	
	public getConfig (configName: string): TemplateConfig|null {
		const sql = database.prepare("select config_name, is_raw, targets from templates_configs where uuid = ? and config_name = ?")
		const data = sql.get(this.uuid, configName) as { config_name: string, is_raw: number, targets: string|null } | undefined
		if (!data) return null;
		return {
			name: data.config_name,
			is_raw: data.is_raw ? true : false,
			targets: data.targets?.split(',') || []
		}
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
		console.log(`Deleting template ${this.uuid} (${this.name})...`)
		const DELETE_CONFIGS = database.prepare("delete from templates_configs where uuid = ?;")
		const DELETE_DATA = database.prepare("delete from templates_data where uuid = ?;")
		const DELETE_IDENTIFIERS = database.prepare("delete from templates_identifiers where uuid = ?;")
		const DELETE_ALL = database.transaction((uuid: string) => {
			const config_changes = DELETE_CONFIGS.run(uuid).changes
			const data_changes = DELETE_DATA.run(uuid).changes
			const name_changes = DELETE_IDENTIFIERS.run(uuid).changes
			return {
				config_changes,
				data_changes,
				name_changes
			}
		})
		const result = DELETE_ALL(this.uuid)
		console.log(`Deleted ${this.uuid}! ${result.config_changes} config, ${result.data_changes} data, ${result.name_changes} name record deleted.`)
		return;
	}
	
}

export class TemplateIndexes {
	
	public static readIndex (): TemplateIndexList {
		return TemplateIndexFromDatabaseV1.allUUIDs()
			.map((uuid) => TemplateIndexFromDatabaseV1.fromUUID(uuid))
			.filter((i): i is TemplateIndexFromDatabaseV1 => i !== null)
	}
	
	public static findByUUID (uuid: string): TemplateIndex|null {
		return TemplateIndexFromDatabaseV1.fromUUID(uuid)
	}
	
	public static findByName (name: string): TemplateIndex|null {
		return TemplateIndexFromDatabaseV1.fromName(name)
	}
	
	public static find (nameOrUUID: string): TemplateIndex|null {
		if (nameOrUUID.startsWith('uuid:')) {
			return TemplateIndexes.findByUUID(nameOrUUID.substring('uuid:'.length))
		} else {
			return TemplateIndexes.findByName(nameOrUUID)
		}
	}
	
	/**
	 * Create a new template metadata and store it in the template index.
	 * 
	 * This does not create the template files etc. The files will be auto-created when you
	 * trying to read or write them.
	 * 
	 * The name and aliases have the following rules:
	 * 
	 * - Cannot starts with `uuid:`.
	 * - Cannot be a empty string.
	 * - Template names cannot be duplicated. (for now, the aliases can be duplicated with names, or other aliases)
	 * 
	 * @throws TemplateCreateError
	 */
	public static create (name: string, alias: string[] = []): TemplateIndex {
		
		// create new template index object
		const indexDef: TemplateIndexDef = {
			uuid: randomUUID(),
			name: name,
			alias: alias
		}
		
		const currentIndexes = TemplateIndexes.readIndex()
		
		// check duplicate or illegal name
		if (indexDef.name.startsWith('uuid:')) {
			throw new TemplateCreateError("Template name cannot start with 'uuid:'.")
		}
		if (indexDef.name === '') {
			throw new TemplateCreateError("Template name cannot be empty.")
		}
		for (const alias of indexDef.alias) {
			if (alias.startsWith('uuid:')) {
				throw new TemplateCreateError("Template alias name cannot start with 'uuid:'.")
			}
			if (alias === '') {
				throw new TemplateCreateError("Template alias name cannot be empty.")
			}
		}
		for (const item of currentIndexes) {
			if (item.name === indexDef.name) {
				throw new TemplateCreateError("Template with this name already exists.")
			}
		}
		
		// execute writes
		return TemplateIndexFromDatabaseV1.create(indexDef);
		
	}
	
	/**
	 * Delete a template metadata from the template index.
	 * 
	 * Under file-based implementation, This only delete the metadata, not the actual template files.
	 * Under database-based implementation, this will delete the metadata and all the linked template data.
	 * 
	 * @param uuid The template UUID to delete.
	 * @returns How much templates are deleted.
	 */
	public static deleteFromIndex (uuid: string): number {
		const item = TemplateIndexFromDatabaseV1.fromUUID(uuid)
		if (!item) return 0;
		item.deleteThis();
		return 1;
	}
	
}

export class TemplateCreateError extends Error {
	public constructor (message: string) {
		super(message)
	}
}

export function readTemplate (name: string): string|null {
	
	try {
		const template = TemplateIndexes.find(name)
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
		const template = TemplateIndexes.find(name)
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
		const template = TemplateIndexes.find(name)
		if (template === null) {
			return null
		}
		return template.listConfigs()
	} catch (e) {
		return null
	}
	
}

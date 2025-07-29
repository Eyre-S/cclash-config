import { sha1 } from "sha.js"
import { v4 as uuidV4 } from "uuid"

import { database } from "../.server/database"
import {
	TemplateConfig, TemplateIndex, TemplateIndexDef, TemplateIndexList
} from "./template"

class DatabaseSQLs {
	
	public static readonly ALL_UUIDS = database.prepare("select distinct uuid from templates_identifiers")
	
	public static readonly GET_UUID_BY_NAME = database.prepare("select uuid from templates_identifiers where name = ?")
	
	private static readonly CREATE_NAME = database.prepare("insert into templates_identifiers (uuid, name, is_primary) values (:uuid, :name, 1);")
	public static readonly CREATE_ALIAS = database.prepare("insert into templates_identifiers (uuid, name, is_primary) values (:uuid, :alias, 0);")
	public static readonly GET_ALL_NAME_ALIAS = database.prepare("select name, is_primary from templates_identifiers where uuid = ?")
	public static readonly UPDATE_NAME_ALIAS = database.prepare("update templates_identifiers set name = :new_name where name = :old_name")
	public static readonly REMOVE_ALIAS = database.prepare("delete from templates_identifiers where name = :name and uuid = :uuid")
	private static readonly REMOVE_ALL_NAME = database.prepare("delete from templates_identifiers where uuid = ?")
	
	private static readonly CREATE_DATA = database.prepare("insert into templates_data (uuid, content, comment) values (:uuid, '', '');")
	public static readonly GET_CONTENT = database.prepare("select content from templates_data where uuid = ?")
	public static readonly WRITE_CONTENT = database.prepare("update templates_data set content = ? where uuid = ?")
	public static readonly GET_COMMENT = database.prepare("select comment from templates_data where uuid = ?")
	public static readonly WRITE_COMMENT = database.prepare("update templates_data set comment = ? where uuid = ?")
	private static readonly REMOVE_DATA = database.prepare("delete from templates_data where uuid = ?")
	
	public static readonly LIST_CONFIG_NAME = database.prepare("select config_name from templates_configs where uuid = ?")
	public static readonly LIST_CONFIG = database.prepare("select config_name, is_raw, targets from templates_configs where uuid = ?")
	public static readonly GET_CONFIG = database.prepare("select config_name, is_raw, targets from templates_configs where uuid = ? and config_name = ?")
	public static readonly REMOVE_CONFIG = database.prepare("delete from templates_configs where uuid = ? and config_name = ?")
	public static readonly REMOVE_ALL_CONFIG = database.prepare("delete from templates_configs where uuid = ?")
	public static readonly WRITE_CONFIG_CONFIG = database.prepare("update templates_configs set is_raw = :is_raw, targets = :targets where uuid = :uuid and config_name = :config_name")
	public static readonly CREATE_CONFIG = database.prepare("insert into templates_configs (uuid, config_name, is_raw, targets) values (:uuid, :config_name, :is_raw, :targets);")

	public static readonly CREATE_IT = database.transaction((def: TemplateIndexDef) => {
			DatabaseSQLs.CREATE_NAME.run({ uuid: def.uuid, name: def.name })
			for (const alias of def.alias) {
				DatabaseSQLs.CREATE_ALIAS.run({ uuid: def.uuid, alias })
			}
			DatabaseSQLs.CREATE_DATA.run({ uuid: def.uuid })
	})
	
	public static readonly REMOVE_IT = database.transaction((uuid: string) => {
		const config_changes = DatabaseSQLs.REMOVE_ALL_CONFIG.run(uuid).changes
		const data_changes = DatabaseSQLs.REMOVE_DATA.run(uuid).changes
		const name_changes = DatabaseSQLs.REMOVE_ALL_NAME.run(uuid).changes
		return {
			config_changes,
			data_changes,
			name_changes
		}
	})
	
}

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
		const data = DatabaseSQLs.ALL_UUIDS.all() as { uuid: string }[]
		return data.map((i) => i.uuid as string)
	}
	
	public static fromUUID (uuid: string): TemplateIndexFromDatabaseV1|null {
		const data = DatabaseSQLs.GET_ALL_NAME_ALIAS.all(uuid) as { name: string, is_primary: number }[]
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
		const data = DatabaseSQLs.GET_UUID_BY_NAME.get(name) as { uuid: string } | undefined
		if (!data) return null
		return TemplateIndexFromDatabaseV1.fromUUID(data.uuid as string)
	}
	
	public static create (def: TemplateIndexDef): TemplateIndexFromDatabaseV1 {
		DatabaseSQLs.CREATE_IT(def)
		return new TemplateIndexFromDatabaseV1(def.uuid, def.name, def.alias)
	}
	
	public async getTemplate (): Promise<string> {
		const data = DatabaseSQLs.GET_CONTENT.get(this.uuid) as { content: string|null } | undefined
		if (!data) {
			throw new Error(`Template with UUID ${this.uuid} not found in database.`)
		} else if (!data.content) {
			return ""
		}
		return data.content
	}
	
	public async getTemplateHash (): Promise<string> {
		return new sha1().update(await this.getTemplate()).digest('hex')
	}
	
	public async writeTemplate (write: string) {
		DatabaseSQLs.WRITE_CONTENT.run({ content: write, uuid: this.uuid })
	}
	
	public async getComments (): Promise<string> {
		const data = DatabaseSQLs.GET_COMMENT.get(this.uuid) as { comment: string|null } | undefined
		if (!data) {
			throw new Error(`Template with UUID ${this.uuid} not found in database.`)
		} else if (!data.comment) {
			return ""
		}
		return data.comment
	}
	
	public async writeComments (write: string): Promise<void> {
		DatabaseSQLs.WRITE_COMMENT.run(write, this.uuid)
	}
	
	public async listConfigs (): Promise<string> {
		const data = DatabaseSQLs.LIST_CONFIG_NAME.get(this.uuid) as { config_name: string } | undefined
		if (!data) {
			throw new Error(`Template with UUID ${this.uuid} not found in database.`)
		}
		return data.config_name
	}
	
	public async getConfigs(): Promise<TemplateConfig[]> {
		const data = DatabaseSQLs.LIST_CONFIG.all(this.uuid) as { config_name: string, is_raw: number, targets: string|null }[]
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
	
	public async getConfig (configName: string): Promise<TemplateConfig | null> {
		const data = DatabaseSQLs.GET_CONFIG.get(this.uuid, configName) as { config_name: string, is_raw: number, targets: string|null } | undefined
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
		const result = DatabaseSQLs.REMOVE_IT(this.uuid)
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
			uuid: uuidV4(),
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

export async function readTemplate (name: string): Promise<string | null> {
	
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

export async function readTemplateComment (name: string): Promise<string | null> {
	
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

export async function readTemplateConfigs (name: string): Promise<string | null> {
	
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

import fs from "fs"
import { z } from "zod"

export const server_root = "server"

export const ServerConfigDef = z.object({
	
	token: z.string().default("fill-this"),
	
	site_name: z.string().default("CClash Config Deliver"),
	
})
export type ServerConfig = z.infer<typeof ServerConfigDef>
export const ServerConfigDefault: ServerConfig = ServerConfigDef.parse({})

const config_path = server_root + "/config.json"
function readConfig (init: boolean = false): ServerConfig {
	
	if (init) console.log("initializing server config")
	if (init && fs.existsSync(config_path) === false) {
		fs.mkdirSync("server", { recursive: true })
		fs.writeFileSync(config_path, JSON.stringify(ServerConfigDefault, null, 4))
		console.log("executing server config first time setup")
	}
	const file_data = fs.readFileSync("server/config.json", "utf-8")
	console.log("read server config")
	
	return ServerConfigDef.parse(JSON.parse(file_data))
	
}

export function refreshConfig () {
	server_config = readConfig()
}

export let server_config = readConfig(true)

export default {
	server_root,
	server_config,
	refreshConfig,
}

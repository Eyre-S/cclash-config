import fs from "fs";
import { server_root } from "../config";
import { FSWatcher } from "vite";

fs.mkdirSync(server_root + "/templates", { recursive: true })
fs.mkdirSync(server_root + "/comments", { recursive: true })

export function readTemplate (name: string): string|null {
	
	try {
		const template_path = server_root + `/templates/${name}`
		const file_data = fs.readFileSync(template_path, "utf-8")
		return file_data
	} catch (e) {
		return null
	}
	
}

export function readTemplateComment (name: string): string|null {
	
	try {
		const template_path = server_root + `/templates/${name}`
		const comment_path = server_root + `/comments/${name}`
		if (!fs.existsSync(template_path)) {
			return null
		} else if (!fs.existsSync(comment_path)) {
			fs.writeFileSync(comment_path, "")
		}
		const file_data = fs.readFileSync(comment_path, "utf-8")
		return file_data
	} catch (e) {
		return null
	}
	
}

import fs from "fs"
import { DatabaseSync } from "node:sqlite"

async function initDatabase (path: string) {
	
	const database = new DatabaseSync(path)
	if (!fs.existsSync(path)) {
		console.log("Seems that the database is not initialized yet, initializing...")
		// database.exec(sql_init)
	}
	return database
	
}

console.log("Connecting to database (server/database-v1.sqlite)...")
export const database = await initDatabase("server/database-v1.sqlite")
console.log("Database connected!")

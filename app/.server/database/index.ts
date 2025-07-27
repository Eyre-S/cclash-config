import fs from "fs"
import Database from "better-sqlite3"

async function initDatabase (path: string) {
	
	const isDatabaseExists = fs.existsSync(path)
	
	const database = new Database(path)
	if (!isDatabaseExists) {
		console.log("Seems that the database is not initialized yet, initializing...")
		// database.exec(sql_init)
	}
	return database
	
}

console.log("Connecting to database (server/database-v1.sqlite)...")
export const database = await initDatabase("server/database-v1.sqlite")
console.log("Database connected!")

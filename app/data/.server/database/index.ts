import fs from "fs"
import Database from "better-sqlite3"

// import init_v1_SQL from "./init_v1.sql?raw"

async function initDatabase (path: string) {
	
	console.log("Connecting to database (server/database-v1.sqlite)...")
	
	const isDatabaseExists = fs.existsSync(path)
	
	const database = new Database(path)
	if (!isDatabaseExists) {
		console.log("Seems that the database is not initialized yet, initializing...")
		// TODO: implement database init sql file read
		// database.exec(init_v1_sql)
	}
	
	console.log("Database connected!")
	return database
	
}

export const database = await initDatabase("server/database-v1.sqlite")

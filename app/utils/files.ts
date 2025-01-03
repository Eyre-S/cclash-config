import fs from "fs"

export class FilesError extends Error {}

export class DeletionNotWorkingError extends FilesError {
	public constructor (path: string) {
		super(`Failed to delete the path: ${path}: it still exists`)
	}
}

export function removeRecursively (path: string): Promise<void> {
	return new Promise<void>((ok, err) => {
		fs.rm(path, { recursive: true }, (e) => {
			if (e === null) {
				if (fs.existsSync(path)) {
					err(new DeletionNotWorkingError(path))
				} else { ok() }
			} else {
				err(e)
			}
		})
	})
}

export default {
	FilesError,
	DeletionNotWorkingError,
	removeRecursively,
}

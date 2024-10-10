import { server_config } from "./config";

export function checkToken (token: string): boolean {
	return token === server_config.token
}

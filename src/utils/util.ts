import fs from 'fs';
import path from 'path';
import util from 'util';

export function isDevelopment() {
	return process.env.NODE_ENV === 'development';
}

export function isProduction() {
	return process.env.NODE_ENV === 'production';
}

export async function mkdir(dirname: string) {
	const existsSync = util.promisify(fs.existsSync);
	if (await existsSync(dirname)) {
		return true;
	}
	if (await mkdir(path.dirname(dirname))) {
		const mkdirSync = util.promisify(fs.mkdirSync);
		await mkdirSync(dirname, {});
		return true;
	}

}

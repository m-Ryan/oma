import fs from 'fs';
import path from 'path';
import util from 'util';
import dayjs from 'dayjs';
import { ProjectTaskEntity } from '../modules/project/entities/project_task.entity';

export const cwd = process.cwd();

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

export function getNowTimeStamp() {
	return dayjs().unix();
}

export function getTaskDir(task: ProjectTaskEntity) {
	return dayjs(task.created_at * 1000).format('YYYY-MM-DD-') + task.task_id;
}

export function existsDir(pathUrl: string) {
	return util.promisify(fs.exists)(pathUrl);
}
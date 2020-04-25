import fs from 'fs';
import path from 'path';
import util from 'util';
import dayjs from 'dayjs';
import { ProjectTaskEntity } from '../modules/project_task/entities/project_task.entity';

export const cwd = process.cwd();

export function isDevelopment() {
	return process.env.NODE_ENV === 'development';
}

export function isProduction() {
	return process.env.NODE_ENV === 'production';
}

export function delay(time = 1000) {
	return new Promise(resolve => setTimeout(resolve, time));
}

export async function mkdir(dirname: string) {
	const existsSync = util.promisify(fs.exists);
	if (await existsSync(dirname)) {
		return true;
	}
	if (await mkdir(path.dirname(dirname))) {
		const mkdirSync = util.promisify(fs.mkdir);
		await mkdirSync(dirname, {});
		return true;
	}

}

export function getNowTimeStamp() {
	return dayjs().unix();
}

export function getTaskTarName(task: ProjectTaskEntity) {
	return dayjs(task.created_at * 1000).format('YYYY-MM-DD-t') + task.task_id + '.tar.gz';
}

export function getTaskId(dirname: string) {
	return parseInt(dirname.replace(/.*\-t(\d+)/, '$1'));
}

export function existsDir(pathUrl: string) {
	return util.promisify(fs.exists)(pathUrl);
}

export function readdir(pathUrl: string) {
	return util.promisify(fs.readdir)(pathUrl);
}

export function getRepositoryName(gitPath: string) {
	return gitPath.replace(/(.*)\/(.*)\.git$/, '$2');
}

export function getSkip(page: number, size: number) {
	return (page - 1) * size;
}

export function formatListResponse<T extends any = any>(data: [T[], number]) {
	return {
		list: data[0],
		count: data[1]
	};
}
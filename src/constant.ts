import path from 'path';
import { cwd } from './utils/util';

export const REPOSITORY_DIR = path.resolve(cwd, '.repository');

export const DEPLOYMENT_DIR = path.resolve(cwd, '.deployment');

export const MAX_HISTORY_LIMIT = 10;
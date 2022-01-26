import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const IS_DEV = process.env.NODE_ENV !== 'production';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const packageJsonPath = path.join(process.cwd(), 'package.json');
const rawPackageJson = fs.readFileSync(packageJsonPath).toString();
const PackageJson = JSON.parse(rawPackageJson);
const { version: VERSION } = PackageJson;

const SERVER_PORT = process.env.PORT || 3000;
const WEBPACK_PORT = 8085;

const JWT_SECRET = process.env['JWT_SECRET'];
const DB_PATH = path.join(process.cwd(), process.env['DB_PATH']);

export { IS_DEV, VERSION, SERVER_PORT, WEBPACK_PORT, JWT_SECRET, DB_PATH };

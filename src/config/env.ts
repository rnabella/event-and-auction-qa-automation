import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.ENV_FILE || '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const env = {
  envName: process.env.ENV_NAME || 'local',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
};

import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.ENV_FILE || '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export const env = {
  envName: process.env.ENV_NAME || 'local',
  baseUrl,
  apiBaseUrl: process.env.API_BASE_URL || `${baseUrl}/api`,
};

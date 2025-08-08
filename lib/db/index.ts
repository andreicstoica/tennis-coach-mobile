import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
const env = { DATABASE_URL: process.env.DATABASE_URL! };

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql as any, { schema });


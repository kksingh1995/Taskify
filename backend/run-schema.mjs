import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const file = process.argv[2] || 'sql/schema.sql';
const sqlText = fs.readFileSync(file, 'utf8');
await pool.query(sqlText);
console.log(`applied: ${file}`);
await pool.end();

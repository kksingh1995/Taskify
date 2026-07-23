import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const sqlText = fs.readFileSync('sql/schema.sql', 'utf8');
await pool.query(sqlText);
console.log('schema applied');
await pool.end();

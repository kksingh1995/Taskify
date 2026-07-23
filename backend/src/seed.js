import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getPool, sql } from './config/db.js';

dotenv.config();

async function seed() {
  const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;
  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
  }

  const pool = await getPool();
  const existing = await pool
    .request()
    .input('email', sql.NVarChar, SUPER_ADMIN_EMAIL)
    .query('SELECT id FROM Users WHERE email = @email');

  if (existing.recordset.length) {
    console.log('Super Admin already exists, skipping.');
    return process.exit(0);
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  await pool
    .request()
    .input('name', sql.NVarChar, SUPER_ADMIN_NAME || 'Super Admin')
    .input('email', sql.NVarChar, SUPER_ADMIN_EMAIL)
    .input('passwordHash', sql.NVarChar, passwordHash)
    .query(
      `INSERT INTO Users (name, email, password_hash, role, organization_id)
       VALUES (@name, @email, @passwordHash, 'super_admin', NULL)`
    );

  console.log(`Super Admin created: ${SUPER_ADMIN_EMAIL}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

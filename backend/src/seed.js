import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { query, pool } from './config/db.js';

dotenv.config();

async function seed() {
  const { SUPER_ADMIN_NAME, SUPER_ADMIN_PHONE, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;
  if (!SUPER_ADMIN_PHONE || !SUPER_ADMIN_PASSWORD) {
    throw new Error('SUPER_ADMIN_PHONE and SUPER_ADMIN_PASSWORD must be set in .env');
  }

  const existing = await query('SELECT id FROM users WHERE phone_number = $1', [SUPER_ADMIN_PHONE]);
  if (existing.length) {
    console.log('Super Admin already exists, skipping.');
    return process.exit(0);
  }

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  await query(
    `INSERT INTO users (name, email, password_hash, role, phone_number, organization_id)
     VALUES ($1, $2, $3, 'super_admin', $4, NULL)`,
    [SUPER_ADMIN_NAME || 'Super Admin', SUPER_ADMIN_EMAIL || null, passwordHash, SUPER_ADMIN_PHONE]
  );

  console.log(`Super Admin created: ${SUPER_ADMIN_PHONE}`);
  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

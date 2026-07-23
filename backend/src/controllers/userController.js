import bcrypt from 'bcryptjs';
import { getPool, sql } from '../config/db.js';

// Org Admin only: create an employee inside their own organization
export async function createEmployee(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const pool = await getPool();

  const existing = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .query('SELECT id FROM Users WHERE email = @email');
  if (existing.recordset.length) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool
    .request()
    .input('name', sql.NVarChar, name)
    .input('email', sql.NVarChar, email)
    .input('passwordHash', sql.NVarChar, passwordHash)
    .input('phone', sql.NVarChar, phone || null)
    .input('orgId', sql.Int, req.user.organizationId)
    .query(
      `INSERT INTO Users (name, email, password_hash, role, phone_number, organization_id)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.phone_number, INSERTED.created_at
       VALUES (@name, @email, @passwordHash, 'employee', @phone, @orgId)`
    );

  res.status(201).json({ employee: result.recordset[0] });
}

// Org Admin only: list employees in their own organization
export async function listEmployees(req, res) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('orgId', sql.Int, req.user.organizationId)
    .query(
      `SELECT id, name, email, phone_number, created_at
       FROM Users
       WHERE organization_id = @orgId AND role = 'employee'
       ORDER BY created_at DESC`
    );
  res.json(result.recordset);
}

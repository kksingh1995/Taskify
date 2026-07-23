import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

// Org Admin only: create an employee inside their own organization
export async function createEmployee(req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.length) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const employees = await query(
    `INSERT INTO users (name, email, password_hash, role, phone_number, organization_id)
     VALUES ($1, $2, $3, 'employee', $4, $5)
     RETURNING id, name, email, phone_number, created_at`,
    [name, email, passwordHash, phone || null, req.user.organizationId]
  );

  res.status(201).json({ employee: employees[0] });
}

// Org Admin only: list employees in their own organization
export async function listEmployees(req, res) {
  const employees = await query(
    `SELECT id, name, email, phone_number, created_at
     FROM users
     WHERE organization_id = $1 AND role = 'employee'
     ORDER BY created_at DESC`,
    [req.user.organizationId]
  );
  res.json(employees);
}

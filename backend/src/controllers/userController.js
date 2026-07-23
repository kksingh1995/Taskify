import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

// Org Admin only: create an employee inside their own organization
export async function createEmployee(req, res) {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ message: 'name, phone and password are required' });
  }

  const existing = await query('SELECT id FROM users WHERE phone_number = $1', [phone]);
  if (existing.length) {
    return res.status(409).json({ message: 'A user with this phone number already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const employees = await query(
    `INSERT INTO users (name, email, password_hash, role, phone_number, organization_id)
     VALUES ($1, $2, $3, 'employee', $4, $5)
     RETURNING id, name, email, phone_number, created_at`,
    [name, email || null, passwordHash, phone, req.user.organizationId]
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

// Org Admin only: reset a password for an employee in their own organization
export async function resetEmployeePassword(req, res) {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
  }

  const employees = await query(
    "SELECT id FROM users WHERE id = $1 AND organization_id = $2 AND role = 'employee'",
    [req.params.id, req.user.organizationId]
  );
  if (!employees.length) return res.status(404).json({ message: 'Employee not found' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, req.params.id]);
  res.json({ message: 'Employee password reset' });
}

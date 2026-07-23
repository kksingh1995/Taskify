import bcrypt from 'bcryptjs';
import { getPool, sql } from '../config/db.js';

// Super Admin only: create a new organization + its first Org Admin
export async function createOrganization(req, res) {
  const { name, type, adminName, adminEmail, adminPassword, adminPhone } = req.body;
  if (!name || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({ message: 'name, adminName, adminEmail and adminPassword are required' });
  }

  const pool = await getPool();

  const existing = await pool
    .request()
    .input('email', sql.NVarChar, adminEmail)
    .query('SELECT id FROM Users WHERE email = @email');
  if (existing.recordset.length) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const orgResult = await pool
    .request()
    .input('name', sql.NVarChar, name)
    .input('type', sql.NVarChar, type || null)
    .input('createdBy', sql.Int, req.user.id)
    .query(
      `INSERT INTO Organizations (name, type, created_by)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.type, INSERTED.status, INSERTED.created_at
       VALUES (@name, @type, @createdBy)`
    );
  const org = orgResult.recordset[0];

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await pool
    .request()
    .input('name', sql.NVarChar, adminName)
    .input('email', sql.NVarChar, adminEmail)
    .input('passwordHash', sql.NVarChar, passwordHash)
    .input('phone', sql.NVarChar, adminPhone || null)
    .input('orgId', sql.Int, org.id)
    .query(
      `INSERT INTO Users (name, email, password_hash, role, phone_number, organization_id)
       VALUES (@name, @email, @passwordHash, 'org_admin', @phone, @orgId)`
    );

  res.status(201).json({ organization: org });
}

// Super Admin only: list all organizations with employee/task counts
export async function listOrganizations(req, res) {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      o.id, o.name, o.type, o.status, o.created_at,
      (SELECT COUNT(*) FROM Users u WHERE u.organization_id = o.id AND u.role = 'employee') AS employeeCount,
      (SELECT COUNT(*) FROM Tasks t WHERE t.organization_id = o.id) AS taskCount,
      admin.name AS adminName, admin.email AS adminEmail
    FROM Organizations o
    OUTER APPLY (
      SELECT TOP 1 name, email FROM Users WHERE organization_id = o.id AND role = 'org_admin'
    ) admin
    ORDER BY o.created_at DESC
  `);
  res.json(result.recordset);
}

// Super Admin only: activate / suspend an organization
export async function updateOrganizationStatus(req, res) {
  const { status } = req.body;
  if (!['Active', 'Suspended'].includes(status)) {
    return res.status(400).json({ message: 'status must be Active or Suspended' });
  }

  const pool = await getPool();
  await pool
    .request()
    .input('id', sql.Int, req.params.id)
    .input('status', sql.NVarChar, status)
    .query('UPDATE Organizations SET status = @status WHERE id = @id');

  res.json({ message: 'Organization status updated' });
}

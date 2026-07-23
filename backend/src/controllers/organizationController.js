import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

// Super Admin only: create a new organization + its first Org Admin
export async function createOrganization(req, res) {
  const { name, type, adminName, adminEmail, adminPassword, adminPhone } = req.body;
  if (!name || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({ message: 'name, adminName, adminEmail and adminPassword are required' });
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (existing.length) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const orgs = await query(
    `INSERT INTO organizations (name, type, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, name, type, status, created_at`,
    [name, type || null, req.user.id]
  );
  const org = orgs[0];

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await query(
    `INSERT INTO users (name, email, password_hash, role, phone_number, organization_id)
     VALUES ($1, $2, $3, 'org_admin', $4, $5)`,
    [adminName, adminEmail, passwordHash, adminPhone || null, org.id]
  );

  res.status(201).json({ organization: org });
}

// Super Admin only: list all organizations with employee/task counts
export async function listOrganizations(req, res) {
  const orgs = await query(`
    SELECT
      o.id, o.name, o.type, o.status, o.created_at,
      (SELECT COUNT(*)::int FROM users u WHERE u.organization_id = o.id AND u.role = 'employee') AS "employeeCount",
      (SELECT COUNT(*)::int FROM tasks t WHERE t.organization_id = o.id) AS "taskCount",
      admin.name AS "adminName", admin.email AS "adminEmail"
    FROM organizations o
    LEFT JOIN LATERAL (
      SELECT name, email FROM users WHERE organization_id = o.id AND role = 'org_admin' LIMIT 1
    ) admin ON true
    ORDER BY o.created_at DESC
  `);
  res.json(orgs);
}

// Super Admin only: activate / suspend an organization
export async function updateOrganizationStatus(req, res) {
  const { status } = req.body;
  if (!['Active', 'Suspended'].includes(status)) {
    return res.status(400).json({ message: 'status must be Active or Suspended' });
  }

  await query('UPDATE organizations SET status = $1 WHERE id = $2', [status, req.params.id]);
  res.json({ message: 'Organization status updated' });
}

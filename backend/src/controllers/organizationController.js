import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { buildAuthResponse } from './authController.js';

// Super Admin only: create a new organization + its first Org Admin
export async function createOrganization(req, res) {
  const { name, type, logoUrl, adminName, adminPhone, adminEmail, adminPassword } = req.body;
  if (!name || !adminName || !adminPhone || !adminPassword) {
    return res.status(400).json({ message: 'name, adminName, adminPhone and adminPassword are required' });
  }

  const existing = await query('SELECT id FROM users WHERE phone_number = $1', [adminPhone]);
  if (existing.length) {
    return res.status(409).json({ message: 'A user with this phone number already exists' });
  }

  const orgs = await query(
    `INSERT INTO organizations (name, type, logo_url, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, type, logo_url, status, created_at`,
    [name, type || null, logoUrl || null, req.user.id]
  );
  const org = orgs[0];

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await query(
    `INSERT INTO users (name, email, password_hash, role, phone_number, organization_id)
     VALUES ($1, $2, $3, 'org_admin', $4, $5)`,
    [adminName, adminEmail || null, passwordHash, adminPhone, org.id]
  );

  res.status(201).json({ organization: org });
}

// Super Admin only: edit organization name/type/logo
export async function updateOrganization(req, res) {
  const { name, type, logoUrl } = req.body;
  const existing = await query('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
  const org = existing[0];
  if (!org) return res.status(404).json({ message: 'Organization not found' });

  const updated = await query(
    `UPDATE organizations SET name = $1, type = $2, logo_url = $3 WHERE id = $4
     RETURNING id, name, type, logo_url, status, created_at`,
    [name ?? org.name, type ?? org.type, logoUrl ?? org.logo_url, req.params.id]
  );
  res.json({ organization: updated[0] });
}

// Super Admin only: list all organizations with employee/task counts
export async function listOrganizations(req, res) {
  const orgs = await query(`
    SELECT
      o.id, o.name, o.type, o.logo_url, o.status, o.created_at,
      (SELECT COUNT(*)::int FROM users u WHERE u.organization_id = o.id AND u.role = 'employee') AS "employeeCount",
      (SELECT COUNT(*)::int FROM tasks t WHERE t.organization_id = o.id) AS "taskCount",
      admin.id AS "adminId", admin.name AS "adminName", admin.phone_number AS "adminPhone", admin.email AS "adminEmail"
    FROM organizations o
    LEFT JOIN LATERAL (
      SELECT id, name, phone_number, email FROM users WHERE organization_id = o.id AND role = 'org_admin' LIMIT 1
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

// Super Admin only: reset an organization's admin password
export async function resetOrgAdminPassword(req, res) {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'newPassword must be at least 6 characters' });
  }

  const admins = await query("SELECT id FROM users WHERE organization_id = $1 AND role = 'org_admin'", [req.params.id]);
  if (!admins.length) return res.status(404).json({ message: 'Organization admin not found' });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, admins[0].id]);
  res.json({ message: 'Organization admin password reset' });
}

// Super Admin only: log in as this organization's admin, without needing their password
export async function loginAsOrgAdmin(req, res) {
  const admins = await query("SELECT * FROM users WHERE organization_id = $1 AND role = 'org_admin'", [req.params.id]);
  if (!admins.length) return res.status(404).json({ message: 'Organization admin not found' });

  res.json(await buildAuthResponse(admins[0]));
}

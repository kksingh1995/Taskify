import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

// Shared by login and Super Admin "login as org" impersonation
export async function buildAuthResponse(user) {
  let organizationName = null;
  let organizationLogo = null;
  if (user.organization_id) {
    const orgs = await query('SELECT name, logo_url FROM organizations WHERE id = $1', [user.organization_id]);
    if (orgs[0]) {
      organizationName = orgs[0].name;
      organizationLogo = orgs[0].logo_url;
    }
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      organizationId: user.organization_id,
      name: user.name,
      phoneNumber: user.phone_number,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phone_number,
      role: user.role,
      organizationId: user.organization_id,
      organizationName,
      organizationLogo,
    },
  };
}

export async function login(req, res) {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    return res.status(400).json({ message: 'Phone number and password are required' });
  }

  const users = await query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
  const user = users[0];
  if (!user) {
    return res.status(401).json({ message: 'Invalid phone number or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid phone number or password' });
  }

  if (user.role !== 'super_admin') {
    const orgs = await query('SELECT status FROM organizations WHERE id = $1', [user.organization_id]);
    if (orgs[0]?.status === 'Suspended') {
      return res.status(403).json({ message: 'Your organization has been suspended' });
    }
  }

  res.json(await buildAuthResponse(user));
}

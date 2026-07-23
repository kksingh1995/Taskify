import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = users[0];
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.role !== 'super_admin') {
    const orgs = await query('SELECT status FROM organizations WHERE id = $1', [user.organization_id]);
    if (orgs[0]?.status === 'Suspended') {
      return res.status(403).json({ message: 'Your organization has been suspended' });
    }
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      organizationId: user.organization_id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      phoneNumber: user.phone_number,
    },
  });
}

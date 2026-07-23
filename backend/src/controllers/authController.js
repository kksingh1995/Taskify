import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/db.js';

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const pool = await getPool();
  const result = await pool
    .request()
    .input('email', sql.NVarChar, email)
    .query('SELECT * FROM Users WHERE email = @email');

  const user = result.recordset[0];
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (user.role !== 'super_admin') {
    const org = await pool
      .request()
      .input('id', sql.Int, user.organization_id)
      .query('SELECT status FROM Organizations WHERE id = @id');
    if (org.recordset[0]?.status === 'Suspended') {
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

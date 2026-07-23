import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlLength: (process.env.DATABASE_URL || '').length,
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    corsOrigin: process.env.CORS_ORIGIN || null,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Taskify API running on port ${PORT}`));

import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { createEmployee, listEmployees } from '../controllers/userController.js';

const router = Router();

router.use(verifyToken, requireRole('org_admin'));
router.post('/employees', createEmployee);
router.get('/employees', listEmployees);

export default router;

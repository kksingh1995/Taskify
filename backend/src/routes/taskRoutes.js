import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { createTask, listTasks, updateTask } from '../controllers/taskController.js';

const router = Router();

router.use(verifyToken);
router.get('/', listTasks);
router.put('/:id', requireRole('org_admin', 'employee'), updateTask);
router.post('/', requireRole('org_admin'), createTask);

export default router;

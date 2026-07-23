import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { createOrganization, listOrganizations, updateOrganizationStatus } from '../controllers/organizationController.js';

const router = Router();

router.use(verifyToken, requireRole('super_admin'));
router.post('/', createOrganization);
router.get('/', listOrganizations);
router.put('/:id/status', updateOrganizationStatus);

export default router;

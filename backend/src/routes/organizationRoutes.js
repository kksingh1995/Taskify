import { Router } from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import {
  createOrganization,
  updateOrganization,
  listOrganizations,
  updateOrganizationStatus,
  resetOrgAdminPassword,
  loginAsOrgAdmin,
} from '../controllers/organizationController.js';

const router = Router();

router.use(verifyToken, requireRole('super_admin'));
router.post('/', createOrganization);
router.get('/', listOrganizations);
router.put('/:id', updateOrganization);
router.put('/:id/status', updateOrganizationStatus);
router.put('/:id/admin/password', resetOrgAdminPassword);
router.post('/:id/login-as', loginAsOrgAdmin);

export default router;

import { Router } from 'express';
import { listPaises } from '../controllers/paisController.js';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  listPaises
);

export default router;
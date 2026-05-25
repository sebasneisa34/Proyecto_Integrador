import { Router } from 'express';

import {
  listAuditLogs,
  getAuditLogDetail
} from '../controllers/auditController.js';

import {
  verifyToken,
  authorizeRoles
} from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  listAuditLogs
);

router.get(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  getAuditLogDetail
);

export default router;
import { Router } from 'express';

import {
  listArchivos,
  getArchivoDetail,
  addArchivo,
  uploadArchivo,
  editArchivo,
  editArchivoPartial,
  removeArchivo
} from '../controllers/archivoController.js';

import {
  verifyToken,
  authorizeRoles
} from '../middlewares/authMiddleware.js';

import { uploadSingleFile } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.get(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  listArchivos
);

router.get(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  getArchivoDetail
);

router.post(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  addArchivo
);

router.post(
  '/upload',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  uploadSingleFile,
  uploadArchivo
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  editArchivo
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  editArchivoPartial
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  removeArchivo
);

export default router;
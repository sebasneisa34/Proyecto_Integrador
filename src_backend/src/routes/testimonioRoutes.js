import { Router } from 'express';

import {
  listTestimonios,
  getTestimonioDetail,
  addTestimonio,
  editTestimonio,
  editTestimonioPartial,
  updateEstadoTestimonio,
  removeTestimonio,
  uploadTestimonioFoto
} from '../controllers/testimonioController.js';

import { uploadSingleFile } from '../middlewares/uploadMiddleware.js';

import {
  verifyToken,
  authorizeRoles
} from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  listTestimonios
);

router.get(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  getTestimonioDetail
);

router.post(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  addTestimonio
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  editTestimonio
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  editTestimonioPartial
);

router.patch(
  '/:id/estado',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  updateEstadoTestimonio
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  removeTestimonio
);

router.patch(
  '/:id/foto',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  uploadSingleFile,
  uploadTestimonioFoto
);


export default router;
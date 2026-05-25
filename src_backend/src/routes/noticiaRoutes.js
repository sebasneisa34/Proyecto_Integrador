import { Router } from 'express';

import {
  listNoticias,
  getNoticiaDetail,
  addNoticia,
  editNoticia,
  editNoticiaPartial,
  updateEstadoNoticia,
  removeNoticia,
  uploadNoticiaImagen
} from '../controllers/noticiaController.js';

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
  listNoticias
);

router.get(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  getNoticiaDetail
);

router.post(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  addNoticia
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  editNoticia
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  editNoticiaPartial
);

router.patch(
  '/:id/estado',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  updateEstadoNoticia
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  removeNoticia
);

router.patch(
  '/:id/imagen',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais', 'editor'),
  uploadSingleFile,
  uploadNoticiaImagen
);


export default router;
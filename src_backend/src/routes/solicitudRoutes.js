import { Router } from 'express';

import {
  createPublicSolicitud,
  listSolicitudes,
  getSolicitudDetail,
  editSolicitud,
  editSolicitudPartial,
  updateEstadoSolicitud,
  removeSolicitud
} from '../controllers/solicitudController.js';

import {
  verifyToken,
  authorizeRoles
} from '../middlewares/authMiddleware.js';

const router = Router();

/*
  Ruta pública:
  visitante del portal envía una solicitud.
*/
router.post('/public', createPublicSolicitud);

/*
  Rutas administrativas:
  solo superadmin y admin_pais gestionan solicitudes.
*/
router.get(
  '/',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  listSolicitudes
);

router.get(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  getSolicitudDetail
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  editSolicitud
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  editSolicitudPartial
);

router.patch(
  '/:id/estado',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  updateEstadoSolicitud
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin', 'admin_pais'),
  removeSolicitud
);

export default router;
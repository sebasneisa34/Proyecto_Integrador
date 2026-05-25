import { Router } from 'express';

import {
  listUsers,
  addUser,
  editUser,
  editUserPartial,
  removeUser,
  permanentRemoveUser,
  changeUserPassword
} from '../controllers/userController.js';

import {
  verifyToken,
  authorizeRoles
} from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
  '/',
  verifyToken,
  authorizeRoles('superadmin'),
  listUsers
);

router.post(
  '/',
  verifyToken,
  authorizeRoles('superadmin'),
  addUser
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin'),
  editUser
);

router.patch(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin'),
  editUserPartial
);

router.patch(
  '/:id/password',
  verifyToken,
  authorizeRoles('superadmin'),
  changeUserPassword
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('superadmin'),
  removeUser
);

router.delete(
  '/:id/permanent',
  verifyToken,
  authorizeRoles('superadmin'),
  permanentRemoveUser
);

export default router;
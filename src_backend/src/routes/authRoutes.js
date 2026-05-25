import { Router } from 'express';

import {
  login,
  updateMyProfile,
  changeMyPassword,
  setSecurityQuestion,
  getSecurityQuestion,
  forgotPassword,
  getMySecurityQuestionController
} from '../controllers/authController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

router.post('/login', login);

/*
|--------------------------------------------------------------------------
| PERFIL
|--------------------------------------------------------------------------
*/

router.patch('/me', verifyToken, updateMyProfile);

router.patch(
  '/change-my-password',
  verifyToken,
  changeMyPassword
);

/*
|--------------------------------------------------------------------------
| PREGUNTA DE SEGURIDAD
|--------------------------------------------------------------------------
*/

/*
  Obtener mi pregunta actual
*/
router.get(
  '/security-question/me',
  verifyToken,
  getMySecurityQuestionController
);

/*
  Crear o actualizar mi pregunta
*/
router.patch(
  '/security-question',
  verifyToken,
  setSecurityQuestion
);

/*
  Consultar pregunta por username
  (flujo recuperación)
*/
router.post(
  '/security-question',
  getSecurityQuestion
);

/*
|--------------------------------------------------------------------------
| RECUPERAR CONTRASEÑA
|--------------------------------------------------------------------------
*/

router.post(
  '/forgot-password',
  forgotPassword
);

export default router;
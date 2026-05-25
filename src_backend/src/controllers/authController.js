import {
  loginUser,
  updateOwnProfile,
  changeOwnPassword,
  recoverPasswordBySecurityQuestion,
  setOwnSecurityQuestion,
  getSecurityQuestionByUsername,
  getMySecurityQuestion
} from '../services/authService.js';

import { createAuditLog } from '../services/auditService.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Usuario y contraseña son obligatorios'
      });
    }

    const result = await loginUser(username, password);

    await createAuditLog({
      usuario_id: result.user.id,
      accion: 'iniciar_sesion',
      modulo: 'autenticacion',
      registro_id: result.user.id,
      descripcion: `El usuario ${result.user.username} inició sesión`,
      ip: req.ip
    });

    res.json({
      message: 'Inicio de sesión exitoso',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    res.status(401).json({
      error: error.message
    });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const forbiddenFields = [
      'rol_id',
      'pais_id',
      'estado',
      'password',
      'password_hash'
    ];

    const hasForbiddenField = forbiddenFields.some((field) =>
      Object.prototype.hasOwnProperty.call(req.body, field)
    );

    if (hasForbiddenField) {
      return res.status(403).json({
        error:
          'No puedes modificar rol, país, estado o contraseña desde esta ruta'
      });
    }

    const { nombre, apellido, email, username } = req.body;

    if (
      nombre === undefined &&
      apellido === undefined &&
      email === undefined &&
      username === undefined
    ) {
      return res.status(400).json({
        error: 'Debes enviar al menos un campo para actualizar'
      });
    }

    const user = await updateOwnProfile(req.user.id, {
      nombre,
      apellido,
      email,
      username
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_perfil',
      modulo: 'autenticacion',
      registro_id: user.id,
      descripcion: `El usuario ${user.username} actualizó su perfil`,
      ip: req.ip
    });

    res.json({
      message: 'Perfil actualizado correctamente',
      user
    });
    } catch (error) {
    if (error.message.includes('usuarios_email_key')) {
      return res.status(409).json({
        error: 'El correo ya está registrado por otro usuario'
      });
    }

    if (error.message.includes('usuarios_username_key')) {
      return res.status(409).json({
        error: 'El nombre de usuario ya está registrado'
      });
    }

    res.status(400).json({
      error: error.message
    });
  }
}

export async function changeMyPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Contraseña actual y nueva contraseña son obligatorias'
      });
    }

    const user = await changeOwnPassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'cambiar_password_propia',
      modulo: 'autenticacion',
      registro_id: user.id,
      descripcion: `El usuario ${user.username} cambió su contraseña`,
      ip: req.ip
    });

    res.json({
      message: 'Contraseña actualizada correctamente',
      user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}

export async function setSecurityQuestion(req, res) {
  try {
    const { pregunta, respuesta } = req.body;

    if (!pregunta || !respuesta) {
      return res.status(400).json({
        error: 'Pregunta y respuesta de seguridad son obligatorias'
      });
    }

    const user = await setOwnSecurityQuestion(
      req.user.id,
      pregunta,
      respuesta
    );

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'configurar_pregunta_seguridad',
      modulo: 'autenticacion',
      registro_id: user.id,
      descripcion: `El usuario ${user.username} configuró su pregunta de seguridad`,
      ip: req.ip
    });

    res.json({
      message: 'Pregunta de seguridad configurada correctamente',
      user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}

export async function getSecurityQuestion(req, res) {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: 'El usuario es obligatorio'
      });
    }

    const result = await getSecurityQuestionByUsername(username);

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { username, respuesta, newPassword } = req.body;

    if (!username || !respuesta || !newPassword) {
      return res.status(400).json({
        error:
          'Usuario, respuesta de seguridad y nueva contraseña son obligatorios'
      });
    }

    const user = await recoverPasswordBySecurityQuestion(
      username,
      respuesta,
      newPassword
    );

    await createAuditLog({
      usuario_id: user.id,
      accion: 'recuperar_password',
      modulo: 'autenticacion',
      registro_id: user.id,
      descripcion: `El usuario ${user.username} recuperó su contraseña`,
      ip: req.ip
    });

    res.json({
      message: 'Contraseña restaurada correctamente'
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}


export async function getMySecurityQuestionController(req, res) {
  try {
    const user = await getMySecurityQuestion(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      username: user.username,
      pregunta_seguridad: user.pregunta_seguridad || null
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}
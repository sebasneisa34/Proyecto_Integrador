import {
  getUsers,
  getUserById,
  getRoleById,
  getPaisById,
  createUser,
  updateUser,
  updateUserPassword,
  deactivateUser,
  deleteUserPermanently
} from '../services/userService.js';

import { createAuditLog } from '../services/auditService.js';

async function validateRoleAndCountry(rol_id, pais_id) {
  const role = await getRoleById(rol_id);

  if (!role) {
    return {
      valid: false,
      status: 400,
      error: 'El rol seleccionado no existe'
    };
  }

  if (role.nombre === 'superadmin') {
    return {
      valid: true,
      role,
      pais_id: null
    };
  }

  if (role.nombre === 'admin_pais' || role.nombre === 'editor') {
    if (!pais_id) {
      return {
        valid: false,
        status: 400,
        error: `El rol ${role.nombre} requiere un país asignado`
      };
    }

    const pais = await getPaisById(pais_id);

    if (!pais) {
      return {
        valid: false,
        status: 400,
        error: 'El país seleccionado no existe'
      };
    }

    return {
      valid: true,
      role,
      pais_id
    };
  }

  return {
    valid: false,
    status: 400,
    error: 'Rol no permitido'
  };
}

export async function listUsers(req, res) {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function addUser(req, res) {
  try {
    const {
      nombre,
      apellido,
      email,
      username,
      password,
      rol_id,
      pais_id,
      estado
    } = req.body;

    if (!nombre || !apellido || !email || !username || !password || !rol_id) {
      return res.status(400).json({
        error:
          'Nombre, apellido, email, username, password y rol son obligatorios'
      });
    }

    const validation = await validateRoleAndCountry(rol_id, pais_id);

    if (!validation.valid) {
      return res.status(validation.status).json({
        error: validation.error
      });
    }

    const newUser = await createUser({
      nombre,
      apellido,
      email,
      username,
      password,
      rol_id,
      pais_id: validation.pais_id,
      estado
    });

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'crear_usuario',
      modulo: 'usuarios',
      registro_id: newUser.id,
      descripcion: `Creó el usuario ${newUser.username}`,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Usuario creado correctamente',
      user: newUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editUser(req, res) {
  try {
    const { id } = req.params;
    const loggedUserId = Number(req.user.id);
    const targetUserId = Number(id);

    const {
      nombre,
      apellido,
      email,
      username,
      password,
      rol_id,
      pais_id,
      estado
    } = req.body;

    if (!nombre || !apellido || !email || !username || !rol_id || !estado) {
      return res.status(400).json({
        error:
          'Nombre, apellido, email, username, rol y estado son obligatorios'
      });
    }

    const existingUser = await getUserById(targetUserId);

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const validation = await validateRoleAndCountry(rol_id, pais_id);

    if (!validation.valid) {
      return res.status(validation.status).json({
        error: validation.error
      });
    }

    if (loggedUserId === targetUserId) {
      if (validation.role.nombre !== 'superadmin') {
        return res.status(403).json({
          error: 'No puedes cambiar tu propio rol de superadmin'
        });
      }

      if (estado !== 'activo') {
        return res.status(403).json({
          error: 'No puedes cambiar tu propio estado a inactivo'
        });
      }
    }

    const updatedUser = await updateUser(targetUserId, {
      nombre,
      apellido,
      email,
      username,
      password,
      rol_id,
      pais_id: validation.pais_id,
      estado
    });

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_usuario',
      modulo: 'usuarios',
      registro_id: updatedUser.id,
      descripcion: `Actualizó el usuario ${updatedUser.username}`,
      ip: req.ip
    });

    res.json({
      message: 'Usuario actualizado correctamente',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editUserPartial(req, res) {
  try {
    const { id } = req.params;
    const loggedUserId = Number(req.user.id);
    const targetUserId = Number(id);

    const existingUser = await getUserById(targetUserId);

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const updateData = { ...req.body };

    const finalRolId =
      updateData.rol_id !== undefined
        ? updateData.rol_id
        : existingUser.rol?.id;

    const finalPaisId =
      updateData.pais_id !== undefined
        ? updateData.pais_id
        : existingUser.pais?.id ?? null;

    const finalEstado =
      updateData.estado !== undefined
        ? updateData.estado
        : existingUser.estado;

    const validation = await validateRoleAndCountry(finalRolId, finalPaisId);

    if (!validation.valid) {
      return res.status(validation.status).json({
        error: validation.error
      });
    }

    if (loggedUserId === targetUserId) {
      if (validation.role.nombre !== 'superadmin') {
        return res.status(403).json({
          error: 'No puedes cambiar tu propio rol de superadmin'
        });
      }

      if (finalEstado !== 'activo') {
        return res.status(403).json({
          error: 'No puedes cambiar tu propio estado a inactivo'
        });
      }
    }

    const updatedUser = await updateUser(targetUserId, {
      ...updateData,
      rol_id: finalRolId,
      pais_id: validation.pais_id,
      estado: finalEstado
    });

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_usuario_parcial',
      modulo: 'usuarios',
      registro_id: updatedUser.id,
      descripcion: `Actualizó parcialmente el usuario ${updatedUser.username}`,
      ip: req.ip
    });

    res.json({
      message: 'Usuario actualizado parcialmente',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    const loggedUserId = Number(req.user.id);
    const targetUserId = Number(id);

    if (loggedUserId === targetUserId) {
      return res.status(403).json({
        error: 'No puedes desactivarte a ti mismo'
      });
    }

    const existingUser = await getUserById(targetUserId);

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const user = await deactivateUser(targetUserId);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'desactivar_usuario',
      modulo: 'usuarios',
      registro_id: user.id,
      descripcion: `Desactivó el usuario ${user.username}`,
      ip: req.ip
    });

    res.json({
      message: 'Usuario desactivado correctamente',
      user
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function permanentRemoveUser(req, res) {
  try {
    const { id } = req.params;
    const loggedUserId = Number(req.user.id);
    const targetUserId = Number(id);

    if (loggedUserId === targetUserId) {
      return res.status(403).json({
        error: 'No puedes eliminar tu propio usuario'
      });
    }

    const existingUser = await getUserById(targetUserId);

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    if (existingUser.rol?.nombre === 'superadmin') {
      return res.status(403).json({
        error:
          'No se permite eliminar físicamente usuarios superadmin. Puedes desactivarlos desde la opción correspondiente.'
      });
    }

    const deletedUser = await deleteUserPermanently(targetUserId);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'eliminar_usuario',
      modulo: 'usuarios',
      registro_id: deletedUser.id,
      descripcion: `Eliminó definitivamente el usuario ${deletedUser.username}`,
      ip: req.ip
    });

    res.json({
      message: 'Usuario eliminado definitivamente',
      user: deletedUser
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function changeUserPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        error: 'La nueva contraseña es obligatoria'
      });
    }

    const existingUser = await getUserById(id);

    if (!existingUser) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const user = await updateUserPassword(id, newPassword);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'cambiar_password_usuario',
      modulo: 'usuarios',
      registro_id: user.id,
      descripcion: `Cambió la contraseña del usuario ${user.username}`,
      ip: req.ip
    });

    res.json({
      message: 'Contraseña del usuario actualizada correctamente',
      user
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

import {
  getUserWithPasswordById,
  getUserSecurityDataByUsername,
  updateUserPassword,
  updateSecurityQuestion
} from './userService.js';

export async function loginUser(username, password) {
  const { data: users, error } = await supabaseAdmin
    .from('usuarios')
    .select(`
      id,
      nombre,
      apellido,
      email,
      username,
      password_hash,
      estado,
      login_intentos,
      login_bloqueado_hasta,
      rol:roles (
        id,
        nombre
      ),
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      )
    `)
    .eq('username', username)
    .limit(1);

  if (error) throw new Error(error.message);

  if (!users || users.length === 0) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  const user = users[0];

  if (user.estado !== 'activo') {
    throw new Error('El usuario se encuentra inactivo');
  }

  // Validar bloqueo
  if (user.login_bloqueado_hasta) {
    const ahora = new Date();
    const bloqueo = new Date(user.login_bloqueado_hasta);

    if (bloqueo > ahora) {
      const segundos = Math.ceil((bloqueo - ahora) / 1000);

      throw new Error(
        `Cuenta bloqueada temporalmente. Intenta en ${segundos} segundos`
      );
    }
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    const nuevosIntentos = (user.login_intentos || 0) + 1;

    let updateData = {
      login_intentos: nuevosIntentos
    };

    //  Si llega a 3 → bloquear 10 segundos
    if (nuevosIntentos >= 3) {
      const bloqueoHasta = new Date(Date.now() + 10000); // 10 segundos

      updateData.login_bloqueado_hasta = bloqueoHasta.toISOString();
      updateData.login_intentos = 0; // reset después de bloquear
    }

    await supabaseAdmin
      .from('usuarios')
      .update(updateData)
      .eq('id', user.id);

    throw new Error('Usuario o contraseña incorrectos');
  }

  //  Login correcto → reset intentos
  await supabaseAdmin
    .from('usuarios')
    .update({
      login_intentos: 0,
      login_bloqueado_hasta: null,
      ultimo_acceso: new Date().toISOString()
    })
    .eq('id', user.id);

  const payload = {
    id: user.id,
    username: user.username,
    rol: user.rol?.nombre,
    pais_id: user.pais?.id || null
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h'
  });

  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      username: user.username,
      rol: user.rol?.nombre,
      pais: user.pais
    }
  };
}

export async function updateOwnProfile(userId, profileData) {
  const updateData = {};

  if (profileData.nombre !== undefined) {
    updateData.nombre = profileData.nombre;
  }

  if (profileData.apellido !== undefined) {
    updateData.apellido = profileData.apellido;
  }

  /*
    VALIDAR EMAIL DUPLICADO
  */
  if (profileData.email !== undefined) {
    const { data: existingEmail, error: emailError } = await supabaseAdmin
      .from('usuarios')
      .select('id, email')
      .eq('email', profileData.email)
      .neq('id', userId)
      .limit(1);

    if (emailError) {
      throw new Error(emailError.message);
    }

    if (existingEmail.length > 0) {
      throw new Error('El correo ya está registrado por otro usuario');
    }

    updateData.email = profileData.email;
  }

  /*
    VALIDAR USERNAME DUPLICADO
  */
  if (profileData.username !== undefined) {
    const { data: existingUsername, error: usernameError } = await supabaseAdmin
      .from('usuarios')
      .select('id, username')
      .eq('username', profileData.username)
      .neq('id', userId)
      .limit(1);

    if (usernameError) {
      throw new Error(usernameError.message);
    }

    if (existingUsername.length > 0) {
      throw new Error('El nombre de usuario ya está registrado');
    }

    updateData.username = profileData.username;
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .update(updateData)
    .eq('id', userId)
    .select(`
      id,
      nombre,
      apellido,
      email,
      username,
      estado,
      rol:roles (
        id,
        nombre
      ),
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  return data[0] || null;
}

export async function changeOwnPassword(userId, currentPassword, newPassword) {
  const user = await getUserWithPasswordById(userId);

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.estado !== 'activo') {
    throw new Error('El usuario se encuentra inactivo');
  }

  const validPassword = await bcrypt.compare(
    currentPassword,
    user.password_hash
  );

  if (!validPassword) {
    throw new Error('La contraseña actual no es correcta');
  }

  return await updateUserPassword(userId, newPassword);
}

export async function recoverPasswordBySecurityQuestion(
  username,
  respuesta,
  newPassword
) {
  const user = await getUserSecurityDataByUsername(username);

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.estado !== 'activo') {
    throw new Error('El usuario se encuentra inactivo');
  }

  if (!user.pregunta_seguridad || !user.respuesta_seguridad_hash) {
    throw new Error('El usuario no tiene pregunta de seguridad configurada');
  }

  const validAnswer = await bcrypt.compare(
    respuesta,
    user.respuesta_seguridad_hash
  );

  if (!validAnswer) {
    throw new Error('La respuesta de seguridad no es correcta');
  }

  return await updateUserPassword(user.id, newPassword);
}

export async function setOwnSecurityQuestion(userId, pregunta, respuesta) {
  return await updateSecurityQuestion(userId, pregunta, respuesta);
}

export async function getSecurityQuestionByUsername(username) {
  const user = await getUserSecurityDataByUsername(username);

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (user.estado !== 'activo') {
    throw new Error('El usuario se encuentra inactivo');
  }

  if (!user.pregunta_seguridad) {
    throw new Error('El usuario no tiene pregunta de seguridad configurada');
  }

  return {
    username: user.username,
    pregunta_seguridad: user.pregunta_seguridad
  };
}

export async function getMySecurityQuestion(userId) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, username, pregunta_seguridad')
    .eq('id', userId)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return data[0] || null;
}
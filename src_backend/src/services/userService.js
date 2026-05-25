import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase.js';

export async function getUsers() {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select(`
      id,
      nombre,
      apellido,
      email,
      username,
      estado,
      ultimo_acceso,
      pregunta_seguridad,
      created_at,
      updated_at,
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
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select(`
      id,
      nombre,
      apellido,
      email,
      username,
      estado,
      pregunta_seguridad,
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
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function getUserWithPasswordById(id) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, username, password_hash, estado')
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function getUserSecurityDataByUsername(username) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select(`
      id,
      username,
      estado,
      pregunta_seguridad,
      respuesta_seguridad_hash
    `)
    .eq('username', username)
    .limit(1);

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function getRoleById(id) {
  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('id, nombre')
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function getPaisById(id) {
  const { data, error } = await supabaseAdmin
    .from('paises')
    .select('id, nombre, codigo, slug, estado')
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function createUser(userData) {
  const passwordHash = await bcrypt.hash(userData.password, 10);

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .insert([
      {
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        username: userData.username,
        password_hash: passwordHash,
        rol_id: userData.rol_id,
        pais_id: userData.pais_id,
        estado: userData.estado || 'activo'
      }
    ])
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

  if (error) throw new Error(error.message);
  return data[0];
}

export async function updateUser(id, userData) {
  const updateData = {};

  if (userData.nombre !== undefined) updateData.nombre = userData.nombre;
  if (userData.apellido !== undefined) updateData.apellido = userData.apellido;
  if (userData.email !== undefined) updateData.email = userData.email;
  if (userData.username !== undefined) updateData.username = userData.username;
  if (userData.rol_id !== undefined) updateData.rol_id = userData.rol_id;
  if (userData.pais_id !== undefined) updateData.pais_id = userData.pais_id;
  if (userData.estado !== undefined) updateData.estado = userData.estado;

  if (userData.password) {
    updateData.password_hash = await bcrypt.hash(userData.password, 10);
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .update(updateData)
    .eq('id', id)
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

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function updateUserPassword(id, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, username, email, estado');

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function updateSecurityQuestion(id, pregunta, respuesta) {
  const respuestaHash = await bcrypt.hash(respuesta, 10);

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .update({
      pregunta_seguridad: pregunta,
      respuesta_seguridad_hash: respuestaHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, username, pregunta_seguridad');

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function deactivateUser(id) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .update({
      estado: 'inactivo',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id,
      username,
      estado,
      rol:roles (
        id,
        nombre
      )
    `);

  if (error) throw new Error(error.message);
  return data[0] || null;
}

export async function deleteUserPermanently(id) {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .delete()
    .eq('id', id)
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
      )
    `);

  if (error) throw new Error(error.message);
  return data[0] || null;
}
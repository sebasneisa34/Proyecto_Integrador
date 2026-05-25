import { supabaseAdmin } from '../config/supabase.js';

export async function createAuditLog({
  usuario_id = null,
  accion,
  modulo,
  registro_id = null,
  descripcion = '',
  ip = null
}) {
  const { data, error } = await supabaseAdmin
    .from('bitacora_auditoria')
    .insert([
      {
        usuario_id,
        accion,
        modulo,
        registro_id,
        descripcion,
        ip
      }
    ])
    .select(`
      id,
      usuario_id,
      accion,
      modulo,
      registro_id,
      descripcion,
      ip,
      created_at
    `);

  if (error) {
    console.error('Error registrando auditoría:', error.message);
    return null;
  }

  return data[0];
}

export async function getAuditLogs(user) {
  let query = supabaseAdmin
    .from('bitacora_auditoria')
    .select(`
      id,
      accion,
      modulo,
      registro_id,
      descripcion,
      ip,
      created_at,
      usuario:usuarios (
        id,
        nombre,
        apellido,
        username,
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
      )
    `)
    .order('created_at', { ascending: false });

  /*
    Superadmin ve toda la bitácora.
    admin_pais ve bitácora de usuarios de su país.
    editor no accede a bitácora desde rutas.
  */
  if (user.rol === 'admin_pais') {
    query = query.eq('usuario.pais_id', user.pais_id);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
}

export async function getAuditLogById(id, user) {
  let query = supabaseAdmin
    .from('bitacora_auditoria')
    .select(`
      id,
      accion,
      modulo,
      registro_id,
      descripcion,
      ip,
      created_at,
      usuario:usuarios (
        id,
        nombre,
        apellido,
        username,
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
      )
    `)
    .eq('id', id)
    .limit(1);

  if (user.rol === 'admin_pais') {
    query = query.eq('usuario.pais_id', user.pais_id);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data[0] || null;
}
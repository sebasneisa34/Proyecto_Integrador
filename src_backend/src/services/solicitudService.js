import { supabaseAdmin } from '../config/supabase.js';

export async function getSolicitudes(user) {
  let query = supabaseAdmin
    .from('solicitudes_contacto')
    .select(`
      id,
      nombre,
      correo,
      telefono,
      finalidad,
      mensaje,
      estado,
      observaciones_admin,
      fecha_gestion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      gestionadoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `)
    .order('created_at', { ascending: false });

  if (user.rol !== 'superadmin') {
    query = query.eq('pais_id', user.pais_id);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
}

export async function getSolicitudById(id, user) {
  let query = supabaseAdmin
    .from('solicitudes_contacto')
    .select(`
      id,
      pais_id,
      nombre,
      correo,
      telefono,
      finalidad,
      mensaje,
      estado,
      observaciones_admin,
      fecha_gestion,
      gestionado_por,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      gestionadoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `)
    .eq('id', id)
    .limit(1);

  if (user.rol !== 'superadmin') {
    query = query.eq('pais_id', user.pais_id);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function createSolicitudPublic(solicitudData) {
  const { data, error } = await supabaseAdmin
    .from('solicitudes_contacto')
    .insert([
      {
        pais_id: solicitudData.pais_id,
        nombre: solicitudData.nombre,
        correo: solicitudData.correo,
        telefono: solicitudData.telefono,
        finalidad: solicitudData.finalidad,
        mensaje: solicitudData.mensaje || null,
        estado: 'pendiente'
      }
    ])
    .select(`
      id,
      nombre,
      correo,
      telefono,
      finalidad,
      mensaje,
      estado,
      created_at,
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

export async function updateSolicitud(id, solicitudData, user) {
  const existingSolicitud = await getSolicitudById(id, user);

  if (!existingSolicitud) return null;

  const updateData = {
    pais_id: solicitudData.pais_id,
    nombre: solicitudData.nombre,
    correo: solicitudData.correo,
    telefono: solicitudData.telefono,
    finalidad: solicitudData.finalidad,
    mensaje: solicitudData.mensaje || null,
    estado: solicitudData.estado,
    observaciones_admin: solicitudData.observaciones_admin || null,
    updated_at: new Date().toISOString()
  };

  if (solicitudData.estado !== existingSolicitud.estado) {
    updateData.gestionado_por = user.id;
    updateData.fecha_gestion = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('solicitudes_contacto')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      nombre,
      correo,
      telefono,
      finalidad,
      mensaje,
      estado,
      observaciones_admin,
      fecha_gestion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      gestionadoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function patchSolicitud(id, solicitudData, user) {
  const existingSolicitud = await getSolicitudById(id, user);

  if (!existingSolicitud) return null;

  const updateData = {};

  if (solicitudData.pais_id !== undefined) {
    updateData.pais_id = solicitudData.pais_id;
  }

  if (solicitudData.nombre !== undefined) {
    updateData.nombre = solicitudData.nombre;
  }

  if (solicitudData.correo !== undefined) {
    updateData.correo = solicitudData.correo;
  }

  if (solicitudData.telefono !== undefined) {
    updateData.telefono = solicitudData.telefono;
  }

  if (solicitudData.finalidad !== undefined) {
    updateData.finalidad = solicitudData.finalidad;
  }

  if (solicitudData.mensaje !== undefined) {
    updateData.mensaje = solicitudData.mensaje || null;
  }

  if (solicitudData.observaciones_admin !== undefined) {
    updateData.observaciones_admin = solicitudData.observaciones_admin || null;
  }

  if (solicitudData.estado !== undefined) {
    updateData.estado = solicitudData.estado;

    if (solicitudData.estado !== existingSolicitud.estado) {
      updateData.gestionado_por = user.id;
      updateData.fecha_gestion = new Date().toISOString();
    }
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('solicitudes_contacto')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      nombre,
      correo,
      telefono,
      finalidad,
      mensaje,
      estado,
      observaciones_admin,
      fecha_gestion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      gestionadoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function changeEstadoSolicitud(id, estado, observaciones, user) {
  const existingSolicitud = await getSolicitudById(id, user);

  if (!existingSolicitud) return null;

  const { data, error } = await supabaseAdmin
    .from('solicitudes_contacto')
    .update({
      estado,
      observaciones_admin: observaciones || existingSolicitud.observaciones_admin,
      gestionado_por: user.id,
      fecha_gestion: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id,
      nombre,
      correo,
      telefono,
      finalidad,
      estado,
      observaciones_admin,
      fecha_gestion,
      updated_at,
      gestionadoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function deleteSolicitud(id, user) {
  const existingSolicitud = await getSolicitudById(id, user);

  if (!existingSolicitud) return null;

  const { data, error } = await supabaseAdmin
    .from('solicitudes_contacto')
    .delete()
    .eq('id', id)
    .select('id, nombre, correo, finalidad, estado');

  if (error) throw new Error(error.message);

  return data[0] || null;
}
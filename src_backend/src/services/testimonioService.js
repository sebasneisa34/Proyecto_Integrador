import { supabaseAdmin } from '../config/supabase.js';

export async function getTestimonios(user) {
  let query = supabaseAdmin
    .from('testimonios')
    .select(`
      id,
      nombre,
      cargo,
      empresa,
      contenido,
      foto_url,
      instagram_url,
      facebook_url,
      estado,
      destacado,
      fecha_publicacion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      autor:usuarios (
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

export async function getTestimonioById(id, user) {
  let query = supabaseAdmin
    .from('testimonios')
    .select(`
      id,
      pais_id,
      autor_id,
      nombre,
      cargo,
      empresa,
      contenido,
      foto_url,
      instagram_url,
      facebook_url,
      estado,
      destacado,
      fecha_publicacion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      autor:usuarios (
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

export async function createTestimonio(testimonioData, user) {
  const fechaPublicacion =
    testimonioData.estado === 'publicado'
      ? new Date().toISOString()
      : null;

  const { data, error } = await supabaseAdmin
    .from('testimonios')
    .insert([
      {
        pais_id: testimonioData.pais_id,
        nombre: testimonioData.nombre,
        cargo: testimonioData.cargo || null,
        empresa: testimonioData.empresa || null,
        contenido: testimonioData.contenido,
        foto_url: testimonioData.foto_url,
        instagram_url: testimonioData.instagram_url || null,
        facebook_url: testimonioData.facebook_url || null,
        estado: testimonioData.estado || 'borrador',
        destacado: testimonioData.destacado || false,
        autor_id: user.id,
        fecha_publicacion: fechaPublicacion
      }
    ])
    .select(`
      id,
      nombre,
      cargo,
      empresa,
      contenido,
      foto_url,
      instagram_url,
      facebook_url,
      estado,
      destacado,
      fecha_publicacion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      autor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0];
}

export async function updateTestimonio(id, testimonioData, user) {
  const existingTestimonio = await getTestimonioById(id, user);

  if (!existingTestimonio) return null;

  const newEstado = testimonioData.estado || existingTestimonio.estado;

  let fechaPublicacion = existingTestimonio.fecha_publicacion;

  if (newEstado === 'publicado' && !fechaPublicacion) {
    fechaPublicacion = new Date().toISOString();
  }

  if (newEstado !== 'publicado') {
    fechaPublicacion = null;
  }

  const updateData = {
    pais_id: testimonioData.pais_id,
    nombre: testimonioData.nombre,
    cargo: testimonioData.cargo || null,
    empresa: testimonioData.empresa || null,
    contenido: testimonioData.contenido,
    foto_url: testimonioData.foto_url,
    instagram_url: testimonioData.instagram_url || null,
    facebook_url: testimonioData.facebook_url || null,
    estado: newEstado,
    destacado: testimonioData.destacado || false,
    fecha_publicacion: fechaPublicacion,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from('testimonios')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      nombre,
      cargo,
      empresa,
      contenido,
      foto_url,
      instagram_url,
      facebook_url,
      estado,
      destacado,
      fecha_publicacion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      autor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function patchTestimonio(id, testimonioData, user) {
  const existingTestimonio = await getTestimonioById(id, user);

  if (!existingTestimonio) return null;

  const updateData = {};

  if (testimonioData.pais_id !== undefined) {
    updateData.pais_id = testimonioData.pais_id;
  }

  if (testimonioData.nombre !== undefined) {
    updateData.nombre = testimonioData.nombre;
  }

  if (testimonioData.cargo !== undefined) {
    updateData.cargo = testimonioData.cargo || null;
  }

  if (testimonioData.empresa !== undefined) {
    updateData.empresa = testimonioData.empresa || null;
  }

  if (testimonioData.contenido !== undefined) {
    updateData.contenido = testimonioData.contenido;
  }

  if (testimonioData.foto_url !== undefined) {
    updateData.foto_url = testimonioData.foto_url;
  }

  if (testimonioData.instagram_url !== undefined) {
    updateData.instagram_url = testimonioData.instagram_url || null;
  }

  if (testimonioData.facebook_url !== undefined) {
    updateData.facebook_url = testimonioData.facebook_url || null;
  }

  if (testimonioData.destacado !== undefined) {
    updateData.destacado = testimonioData.destacado;
  }

  if (testimonioData.estado !== undefined) {
    updateData.estado = testimonioData.estado;

    if (testimonioData.estado === 'publicado') {
      updateData.fecha_publicacion =
        existingTestimonio.fecha_publicacion || new Date().toISOString();
    } else {
      updateData.fecha_publicacion = null;
    }
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('testimonios')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      nombre,
      cargo,
      empresa,
      contenido,
      foto_url,
      instagram_url,
      facebook_url,
      estado,
      destacado,
      fecha_publicacion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      autor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function changeEstadoTestimonio(id, estado, user) {
  const existingTestimonio = await getTestimonioById(id, user);

  if (!existingTestimonio) return null;

  const fechaPublicacion =
    estado === 'publicado' ? new Date().toISOString() : null;

  const { data, error } = await supabaseAdmin
    .from('testimonios')
    .update({
      estado,
      fecha_publicacion: fechaPublicacion,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, nombre, estado, fecha_publicacion, updated_at');

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function deleteTestimonio(id, user) {
  const existingTestimonio = await getTestimonioById(id, user);

  if (!existingTestimonio) return null;

  const { data, error } = await supabaseAdmin
    .from('testimonios')
    .delete()
    .eq('id', id)
    .select('id, nombre, estado');

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function updateTestimonioFoto(id, fotoUrl, user) {
  const existingTestimonio = await getTestimonioById(id, user);

  if (!existingTestimonio) return null;

  const { data, error } = await supabaseAdmin
    .from('testimonios')
    .update({
      foto_url: fotoUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id,
      nombre,
      cargo,
      empresa,
      contenido,
      foto_url,
      instagram_url,
      facebook_url,
      estado,
      destacado,
      fecha_publicacion,
      created_at,
      updated_at,
      pais:paises (
        id,
        nombre,
        codigo,
        slug
      ),
      autor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}
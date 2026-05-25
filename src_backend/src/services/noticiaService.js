import { supabaseAdmin } from '../config/supabase.js';

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getNoticias(user) {
  let query = supabaseAdmin
    .from('noticias')
    .select(`
      id,
      titulo,
      slug,
      resumen,
      contenido,
      imagen_principal_url,
      estado,
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

export async function getNoticiaById(id, user) {
  let query = supabaseAdmin
    .from('noticias')
    .select(`
      id,
      pais_id,
      autor_id,
      titulo,
      slug,
      resumen,
      contenido,
      imagen_principal_url,
      estado,
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

export async function createNoticia(noticiaData, user) {
  const slug = generateSlug(noticiaData.titulo);

  const fechaPublicacion =
    noticiaData.estado === 'publicado'
      ? new Date().toISOString()
      : null;

  const { data, error } = await supabaseAdmin
    .from('noticias')
    .insert([
      {
        pais_id: noticiaData.pais_id,
        titulo: noticiaData.titulo,
        slug,
        resumen: noticiaData.resumen,
        contenido: noticiaData.contenido,
        imagen_principal_url: noticiaData.imagen_principal_url || null,
        autor_id: user.id,
        estado: noticiaData.estado || 'borrador',
        fecha_publicacion: fechaPublicacion
      }
    ])
    .select(`
      id,
      titulo,
      slug,
      resumen,
      contenido,
      imagen_principal_url,
      estado,
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

export async function updateNoticia(id, noticiaData, user) {
  const existingNoticia = await getNoticiaById(id, user);

  if (!existingNoticia) return null;

  const newEstado = noticiaData.estado || existingNoticia.estado;

  let fechaPublicacion = existingNoticia.fecha_publicacion;

  if (newEstado === 'publicado' && !fechaPublicacion) {
    fechaPublicacion = new Date().toISOString();
  }

  if (newEstado !== 'publicado') {
    fechaPublicacion = null;
  }

  const updateData = {
    pais_id: noticiaData.pais_id,
    titulo: noticiaData.titulo,
    slug: generateSlug(noticiaData.titulo),
    resumen: noticiaData.resumen,
    contenido: noticiaData.contenido,
    imagen_principal_url: noticiaData.imagen_principal_url || null,
    estado: newEstado,
    fecha_publicacion: fechaPublicacion,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from('noticias')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      titulo,
      slug,
      resumen,
      contenido,
      imagen_principal_url,
      estado,
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

export async function patchNoticia(id, noticiaData, user) {
  const existingNoticia = await getNoticiaById(id, user);

  if (!existingNoticia) return null;

  const updateData = {};

  if (noticiaData.pais_id !== undefined) {
    updateData.pais_id = noticiaData.pais_id;
  }

  if (noticiaData.titulo !== undefined) {
    updateData.titulo = noticiaData.titulo;
    updateData.slug = generateSlug(noticiaData.titulo);
  }

  if (noticiaData.resumen !== undefined) {
    updateData.resumen = noticiaData.resumen;
  }

  if (noticiaData.contenido !== undefined) {
    updateData.contenido = noticiaData.contenido;
  }

  if (noticiaData.imagen_principal_url !== undefined) {
    updateData.imagen_principal_url = noticiaData.imagen_principal_url || null;
  }

  if (noticiaData.estado !== undefined) {
    updateData.estado = noticiaData.estado;

    if (noticiaData.estado === 'publicado') {
      updateData.fecha_publicacion =
        existingNoticia.fecha_publicacion || new Date().toISOString();
    } else {
      updateData.fecha_publicacion = null;
    }
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('noticias')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      titulo,
      slug,
      resumen,
      contenido,
      imagen_principal_url,
      estado,
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

export async function changeEstadoNoticia(id, estado, user) {
  const existingNoticia = await getNoticiaById(id, user);

  if (!existingNoticia) return null;

  const fechaPublicacion =
    estado === 'publicado' ? new Date().toISOString() : null;

  const { data, error } = await supabaseAdmin
    .from('noticias')
    .update({
      estado,
      fecha_publicacion: fechaPublicacion,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, titulo, slug, estado, fecha_publicacion, updated_at');

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function deleteNoticia(id, user) {
  const existingNoticia = await getNoticiaById(id, user);

  if (!existingNoticia) return null;

  const { data, error } = await supabaseAdmin
    .from('noticias')
    .delete()
    .eq('id', id)
    .select('id, titulo, slug, estado');

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function updateNoticiaImage(id, imageUrl, user) {
  const existingNoticia = await getNoticiaById(id, user);

  if (!existingNoticia) return null;

  const { data, error } = await supabaseAdmin
    .from('noticias')
    .update({
      imagen_principal_url: imageUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id,
      titulo,
      slug,
      resumen,
      contenido,
      imagen_principal_url,
      estado,
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
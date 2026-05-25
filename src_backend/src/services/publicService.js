import { supabaseAdmin } from '../config/supabase.js';

export async function getPublicNoticiasByPaisSlug(paisSlug) {
  const { data, error } = await supabaseAdmin
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
      pais:paises!inner (
        id,
        nombre,
        codigo,
        slug
      )
    `)
    .eq('estado', 'publicado')
    .eq('pais.slug', paisSlug)
    .order('fecha_publicacion', { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}

export async function getPublicNoticiaDetail(paisSlug, noticiaSlug) {
  const { data, error } = await supabaseAdmin
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
      pais:paises!inner (
        id,
        nombre,
        codigo,
        slug
      )
    `)
    .eq('estado', 'publicado')
    .eq('pais.slug', paisSlug)
    .eq('slug', noticiaSlug)
    .limit(1);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function getPublicTestimoniosByPaisSlug(paisSlug) {
  const { data, error } = await supabaseAdmin
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
      pais:paises!inner (
        id,
        nombre,
        codigo,
        slug
      )
    `)
    .eq('estado', 'publicado')
    .eq('pais.slug', paisSlug)
    .order('destacado', { ascending: false })
    .order('fecha_publicacion', { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}

export async function getPublicTestimonioDetail(paisSlug, id) {
  const { data, error } = await supabaseAdmin
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
      pais:paises!inner (
        id,
        nombre,
        codigo,
        slug
      )
    `)
    .eq('estado', 'publicado')
    .eq('pais.slug', paisSlug)
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);

  return data[0] || null;
}
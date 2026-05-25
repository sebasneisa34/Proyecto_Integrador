import { supabaseAdmin } from '../config/supabase.js';

export async function getPaises(user) {
  if (user.rol === 'superadmin') {
    const { data, error } = await supabaseAdmin
      .from('paises')
      .select('id, nombre, codigo, slug, estado, created_at, updated_at')
      .order('id', { ascending: true });

    if (error) throw new Error(error.message);

    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('paises')
    .select('id, nombre, codigo, slug, estado, created_at, updated_at')
    .eq('id', user.pais_id)
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);

  return data;
}
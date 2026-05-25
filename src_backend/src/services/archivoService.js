import { supabaseAdmin } from '../config/supabase.js';

const BUCKET_NAME = 'cms-media';

export async function getArchivos() {
  const { data, error } = await supabaseAdmin
    .from('archivos')
    .select(`
      id,
      nombre_archivo,
      url,
      tipo_archivo,
      modulo,
      referencia_id,
      bucket,
      storage_path,
      created_at,
      updated_at,
      subidoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data;
}

export async function getArchivoById(id) {
  const { data, error } = await supabaseAdmin
    .from('archivos')
    .select(`
      id,
      nombre_archivo,
      url,
      tipo_archivo,
      modulo,
      referencia_id,
      bucket,
      storage_path,
      created_at,
      updated_at,
      subidoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `)
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function createArchivo(archivoData, user) {
  const { data, error } = await supabaseAdmin
    .from('archivos')
    .insert([
      {
        nombre_archivo: archivoData.nombre_archivo,
        url: archivoData.url,
        tipo_archivo: archivoData.tipo_archivo,
        modulo: archivoData.modulo,
        referencia_id: archivoData.referencia_id || null,
        bucket: archivoData.bucket || BUCKET_NAME,
        storage_path: archivoData.storage_path || null,
        subido_por: user.id
      }
    ])
    .select(`
      id,
      nombre_archivo,
      url,
      tipo_archivo,
      modulo,
      referencia_id,
      bucket,
      storage_path,
      created_at,
      updated_at,
      subidoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0];
}

export async function updateArchivo(id, archivoData) {
  const { data, error } = await supabaseAdmin
    .from('archivos')
    .update({
      nombre_archivo: archivoData.nombre_archivo,
      url: archivoData.url,
      tipo_archivo: archivoData.tipo_archivo,
      modulo: archivoData.modulo,
      referencia_id: archivoData.referencia_id || null,
      bucket: archivoData.bucket || BUCKET_NAME,
      storage_path: archivoData.storage_path || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      id,
      nombre_archivo,
      url,
      tipo_archivo,
      modulo,
      referencia_id,
      bucket,
      storage_path,
      created_at,
      updated_at,
      subidoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function patchArchivo(id, archivoData) {
  const updateData = {};

  if (archivoData.nombre_archivo !== undefined) {
    updateData.nombre_archivo = archivoData.nombre_archivo;
  }

  if (archivoData.url !== undefined) {
    updateData.url = archivoData.url;
  }

  if (archivoData.tipo_archivo !== undefined) {
    updateData.tipo_archivo = archivoData.tipo_archivo;
  }

  if (archivoData.modulo !== undefined) {
    updateData.modulo = archivoData.modulo;
  }

  if (archivoData.referencia_id !== undefined) {
    updateData.referencia_id = archivoData.referencia_id || null;
  }

  if (archivoData.bucket !== undefined) {
    updateData.bucket = archivoData.bucket;
  }

  if (archivoData.storage_path !== undefined) {
    updateData.storage_path = archivoData.storage_path;
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('archivos')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      nombre_archivo,
      url,
      tipo_archivo,
      modulo,
      referencia_id,
      bucket,
      storage_path,
      created_at,
      updated_at,
      subidoPor:usuarios (
        id,
        nombre,
        apellido,
        username
      )
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function deleteArchivo(id) {
  const archivo = await getArchivoById(id);

  if (!archivo) return null;

  if (archivo.storage_path) {
    await supabaseAdmin.storage
      .from(archivo.bucket || BUCKET_NAME)
      .remove([archivo.storage_path]);
  }

  const { data, error } = await supabaseAdmin
    .from('archivos')
    .delete()
    .eq('id', id)
    .select(`
      id,
      nombre_archivo,
      url,
      tipo_archivo,
      modulo,
      referencia_id,
      bucket,
      storage_path
    `);

  if (error) throw new Error(error.message);

  return data[0] || null;
}

export async function uploadFileToStorage(file, modulo) {
  const cleanName = file.originalname
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
    .toLowerCase();

  const fileName = `${Date.now()}-${cleanName}`;
  const storagePath = `${modulo}/${fileName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return {
    bucket: BUCKET_NAME,
    storage_path: storagePath,
    nombre_archivo: file.originalname,
    tipo_archivo: file.mimetype,
    url: publicUrlData.publicUrl
  };
}
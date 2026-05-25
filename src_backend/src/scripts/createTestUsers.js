import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';

dotenv.config();

async function getRoleId(nombre) {
  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('id, nombre')
    .eq('nombre', nombre)
    .limit(1);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error(`No existe el rol ${nombre}`);

  return data[0].id;
}

async function getPaisId(slug) {
  const { data, error } = await supabaseAdmin
    .from('paises')
    .select('id, nombre, slug')
    .eq('slug', slug)
    .limit(1);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error(`No existe el país ${slug}`);

  return data[0].id;
}

async function createUser(userData) {
  const { data: existingUsers, error: existingError } = await supabaseAdmin
    .from('usuarios')
    .select('id, username')
    .eq('username', userData.username)
    .limit(1);

  if (existingError) throw new Error(existingError.message);

  if (existingUsers.length > 0) {
    console.log(`El usuario ${userData.username} ya existe.`);
    return;
  }

  const passwordHash = await bcrypt.hash(userData.password, 10);

  const { error } = await supabaseAdmin.from('usuarios').insert([
    {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      username: userData.username,
      password_hash: passwordHash,
      rol_id: userData.rol_id,
      pais_id: userData.pais_id,
      estado: 'activo'
    }
  ]);

  if (error) throw new Error(error.message);

  console.log(`Usuario creado: ${userData.username}`);
  console.log(`Contraseña: ${userData.password}`);
}

async function createTestUsers() {
  try {
    const adminPaisRoleId = await getRoleId('admin_pais');
    const editorRoleId = await getRoleId('editor');
    const argentinaId = await getPaisId('argentina');

    await createUser({
      nombre: 'Admin',
      apellido: 'Argentina',
      email: 'admin.argentina@demo.com',
      username: 'admin_argentina',
      password: 'admin123*',
      rol_id: adminPaisRoleId,
      pais_id: argentinaId
    });

    await createUser({
      nombre: 'Editor',
      apellido: 'Argentina',
      email: 'editor.argentina@demo.com',
      username: 'editor_argentina',
      password: 'editor123*',
      rol_id: editorRoleId,
      pais_id: argentinaId
    });

    console.log('Proceso finalizado.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestUsers();
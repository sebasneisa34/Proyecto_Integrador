import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../config/supabase.js';

dotenv.config();

async function createSuperAdmin() {
  const username = 'superadmin';
  const password = 'superadmin123*';
  const passwordHash = await bcrypt.hash(password, 10);

  const { data: roles, error: rolError } = await supabaseAdmin
    .from('roles')
    .select('id, nombre')
    .eq('nombre', 'superadmin')
    .limit(1);

  if (rolError) {
    console.error('Error buscando rol:', rolError.message);
    return;
  }

  if (!roles || roles.length === 0) {
    console.error('No existe el rol superadmin.');
    return;
  }

  const rol = roles[0];

  const { data: existingUsers, error: existingError } = await supabaseAdmin
    .from('usuarios')
    .select('id, username')
    .eq('username', username)
    .limit(1);

  if (existingError) {
    console.error('Error validando usuario:', existingError.message);
    return;
  }

  if (existingUsers.length > 0) {
    console.log('El usuario superadmin ya existe.');
    return;
  }

  const { error } = await supabaseAdmin.from('usuarios').insert([
    {
      nombre: 'Sergio',
      apellido: 'Puerto',
      email: 'superadmin@demo.com',
      username,
      password_hash: passwordHash,
      rol_id: rol.id,
      pais_id: null,
      estado: 'activo'
    }
  ]);

  if (error) {
    console.error('Error creando superadmin:', error.message);
    return;
  }

  console.log('Superadmin creado correctamente');
  console.log('Usuario:', username);
  console.log('Contraseña:', password);
}

createSuperAdmin();
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import axiosClient from '../../api/axiosClient';

import {
  changeUserPassword,
  createUser,
  getUserById,
  updateUser
} from '../../services/userService';

const ROLES = [
  {
    id: 1,
    nombre: 'superadmin',
    label: 'Superadmin'
  },
  {
    id: 2,
    nombre: 'admin_pais',
    label: 'Admin país'
  },
  {
    id: 3,
    nombre: 'editor',
    label: 'Editor'
  }
];

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [paises, setPaises] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    username: '',
    password: '',
    rol_id: '',
    pais_id: '',
    estado: 'activo'
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: ''
  });

  const [loadingData, setLoadingData] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');

  const selectedRole = useMemo(() => {
    return ROLES.find((role) => Number(role.id) === Number(form.rol_id));
  }, [form.rol_id]);

  const isSuperadminRole = selectedRole?.nombre === 'superadmin';

  useEffect(() => {
    async function loadPaises() {
      try {
        const response = await axiosClient.get('/paises');
        setPaises(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar países');
      }
    }

    loadPaises();
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (!isEdit) return;

      try {
        setLoadingData(true);

        const user = await getUserById(id);

        if (!user) {
          setError('Usuario no encontrado');
          return;
        }

        setForm({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          email: user.email || '',
          username: user.username || '',
          password: '',
          rol_id: user.rol?.id || '',
          pais_id: user.pais?.id || '',
          estado: user.estado || 'activo'
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar usuario');
      } finally {
        setLoadingData(false);
      }
    }

    loadUser();
  }, [id, isEdit]);

  

function handleChange(event) {
  const { name, value } = event.target;

  setForm((prev) => {
    const nextForm = {
      ...prev,
      [name]: value
    };

    if (name === 'rol_id') {
      const selectedRole = ROLES.find(
        (role) => Number(role.id) === Number(value)
      );

      if (selectedRole?.nombre === 'superadmin') {
        nextForm.pais_id = '';
      }
    }

    return nextForm;
  });
}

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function validateForm() {
    if (
      !form.nombre ||
      !form.apellido ||
      !form.email ||
      !form.username ||
      !form.rol_id ||
      !form.estado
    ) {
      return 'Nombre, apellido, correo, usuario, rol y estado son obligatorios';
    }

    if (!isEdit && !form.password) {
      return 'La contraseña es obligatoria al crear un usuario';
    }

    if (!isSuperadminRole && !form.pais_id) {
      return 'Los roles Admin país y Editor requieren un país asignado';
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const validationError = validateForm();

      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        username: form.username,
        rol_id: Number(form.rol_id),
        pais_id: isSuperadminRole ? null : Number(form.pais_id),
        estado: form.estado
      };

      if (!isEdit || form.password) {
        payload.password = form.password;
      }

      if (isEdit) {
        await updateUser(id, payload);
      } else {
        await createUser(payload);
      }

      setMessage(
        isEdit
          ? 'Usuario actualizado correctamente'
          : 'Usuario creado correctamente'
      );

      setTimeout(() => {
        navigate('/admin/users');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();

    setPasswordMessage('');
    setError('');
    setLoadingPassword(true);

    try {
      if (!passwordForm.newPassword) {
        setError('La nueva contraseña es obligatoria');
        setLoadingPassword(false);
        return;
      }

      await changeUserPassword(id, passwordForm.newPassword);

      setPasswordMessage('Contraseña actualizada correctamente');

      setPasswordForm({
        newPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoadingPassword(false);
    }
  }

  if (loadingData) {
    return (
      <div>
        <h1 className="fw-bold">Usuarios</h1>
        <div className="alert alert-info">Cargando información...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h1>

          <p className="text-muted mb-0">
            Administra credenciales, roles, país asignado y estado del usuario.
          </p>
        </div>

        <Link to="/admin/users" className="btn btn-outline-secondary">
          Volver
        </Link>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show">
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage('')}
          />
        </div>
      )}

      {passwordMessage && (
        <div className="alert alert-success alert-dismissible fade show">
          {passwordMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setPasswordMessage('')}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          />
        </div>
      )}

      <div className="row g-4">
        <div className={isEdit ? 'col-lg-8' : 'col-lg-12'}>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Apellido</label>
                    <input
                      className="form-control"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Correo</label>
                    <input
                      className="form-control"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Usuario</label>
                    <input
                      className="form-control"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {!isEdit && (
                    <div className="col-md-6">
                      <label className="form-label">Contraseña</label>
                      <input
                        className="form-control"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required={!isEdit}
                      />
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      name="rol_id"
                      value={form.rol_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione un rol</option>

                      {ROLES.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">País</label>
                    <select
                      className="form-select"
                      name="pais_id"
                      value={form.pais_id}
                      onChange={handleChange}
                      disabled={isSuperadminRole}
                      required={!isSuperadminRole}
                    >
                      <option value="">
                        {isSuperadminRole
                          ? 'No aplica para superadmin'
                          : 'Seleccione un país'}
                      </option>

                      {paises.map((pais) => (
                        <option key={pais.id} value={pais.id}>
                          {pais.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      required
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <button className="btn btn-primary mt-4" disabled={loading}>
                  {loading
                    ? 'Guardando...'
                    : isEdit
                      ? 'Actualizar usuario'
                      : 'Crear usuario'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold">Cambiar contraseña</h5>

                <p className="text-muted small">
                  Esta opción permite al superadmin restablecer la contraseña
                  del usuario seleccionado.
                </p>

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label">Nueva contraseña</label>
                    <input
                      className="form-control"
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="NuevaClave123*"
                    />
                  </div>

                  <button
                    className="btn btn-outline-primary w-100"
                    disabled={loadingPassword}
                  >
                    {loadingPassword
                      ? 'Actualizando...'
                      : 'Cambiar contraseña'}
                  </button>
                </form>
              </div>
            </div>

            <div className="card border-0 shadow-sm mt-3">
              <div className="card-body">
                <h5 className="fw-bold">Reglas</h5>

                <ul className="text-muted small mb-0">
                  <li>Superadmin no requiere país.</li>
                  <li>Admin país y editor sí requieren país.</li>
                  <li>La contraseña solo es obligatoria al crear.</li>
                  <li>
                    El cambio de contraseña en edición se hace desde el panel
                    lateral.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
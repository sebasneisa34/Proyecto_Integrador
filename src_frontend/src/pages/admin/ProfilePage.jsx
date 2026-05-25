import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const { user, updateMyProfile } = useAuth();

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasChanges =
    form.nombre !== (user?.nombre || '') ||
    form.apellido !== (user?.apellido || '') ||
    form.email !== (user?.email || '');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!hasChanges) {
      setMessage('No hay cambios para guardar');
      return;
    }

    setLoading(true);

    try {
      await updateMyProfile(form);
      setMessage('Perfil actualizado correctamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="fw-bold">Mi perfil</h1>
      <p className="text-muted">Actualiza tus datos personales.</p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

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
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Apellido</label>
                <input
                  className="form-control"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input
                  className="form-control"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Usuario</label>
                <input
                  className="form-control"
                  value={user?.username || ''}
                  disabled
                />
                <small className="text-muted">
                  El usuario solo puede ser modificado desde gestión de usuarios.
                </small>
              </div>
            </div>

            <button className="btn btn-primary mt-4" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
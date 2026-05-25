import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ChangePasswordPage() {
  const { changeMyPassword } = useAuth();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      await changeMyPassword(form.currentPassword, form.newPassword);
      setMessage('Contraseña actualizada correctamente');
      setForm({
        currentPassword: '',
        newPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="fw-bold">Cambiar contraseña</h1>
      <p className="text-muted">Actualiza tu contraseña de acceso.</p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Contraseña actual</label>
              <input
                className="form-control"
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nueva contraseña</label>
              <input
                className="form-control"
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
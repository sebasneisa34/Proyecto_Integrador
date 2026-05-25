import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPasswordPage() {
  const { getSecurityQuestion, forgotPassword } = useAuth();

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [pregunta, setPregunta] = useState('');

  const [form, setForm] = useState({
    respuesta: '',
    newPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGetQuestion(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await getSecurityQuestion(username);
      setPregunta(response.pregunta_seguridad);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo consultar la pregunta');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleRecoverPassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await forgotPassword(username, form.respuesta, form.newPassword);
      setMessage('Contraseña restaurada correctamente. Ya puedes iniciar sesión.');
      setForm({
        respuesta: '',
        newPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo restaurar la contraseña');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <Link to="/admin/login" className="text-decoration-none text-muted small">
          ← Volver al login
        </Link>

        <h2 className="fw-bold mt-3">Recuperar contraseña</h2>
        <p className="text-muted">
          Consulta tu pregunta de seguridad para restaurar el acceso.
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleGetQuestion}>
            <div className="mb-3">
              <label className="form-label">Usuario</label>
              <input
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Consultando...' : 'Consultar pregunta'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRecoverPassword}>
            <div className="alert alert-info">
              <strong>Pregunta:</strong> {pregunta}
            </div>

            <div className="mb-3">
              <label className="form-label">Respuesta</label>
              <input
                className="form-control"
                name="respuesta"
                value={form.respuesta}
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

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Restaurando...' : 'Restaurar contraseña'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
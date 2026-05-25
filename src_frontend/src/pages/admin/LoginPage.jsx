import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockedSeconds, setBlockedSeconds] = useState(0);

  const [toast, setToast] = useState({
    show: false,
    type: 'danger',
    message: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false
      }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.show, toast.message]);

  useEffect(() => {
  if (blockedSeconds <= 0) return;

  const timer = setInterval(() => {
    setBlockedSeconds((prev) => {
      if (prev <= 1) {
        clearInterval(timer);

        setFailedAttempts(0);

        setForm({
          username: '',
          password: ''
        });

        closeToast();

        window.location.reload();

        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [blockedSeconds]);

  function showToast(message, type = 'danger') {
    setToast({
      show: true,
      type,
      message
    });
  }

  function closeToast() {
    setToast((prev) => ({
      ...prev,
      show: false
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'username') {
      setFailedAttempts(0);
      setBlockedSeconds(0);
      closeToast();
    }
  }

  function getBlockedSecondsFromMessage(message) {
    const match = message.match(/(\d+)\s*segundos/i);
    return match ? Number(match[1]) : 10;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (blockedSeconds > 0) {
      showToast(
        `Cuenta bloqueada temporalmente. Intenta en ${blockedSeconds} segundo(s).`,
        'warning'
      );
      return;
    }

    setLoading(true);

    try {
      await login(form.username, form.password);

      setFailedAttempts(0);
      setBlockedSeconds(0);

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const backendMessage =
        err.response?.data?.error || 'Error al iniciar sesión';

      if (backendMessage.includes('bloqueada temporalmente')) {
        const seconds = getBlockedSecondsFromMessage(backendMessage);

        setBlockedSeconds(seconds);
        setFailedAttempts(3);

        showToast(
          `Cuenta bloqueada temporalmente. Intenta nuevamente en ${seconds} segundo(s).`,
          'warning'
        );

        return;
      }

      if (backendMessage.includes('Usuario o contraseña incorrectos')) {
        setFailedAttempts((prev) => {
          const next = Math.min(prev + 1, 3);
          const remaining = Math.max(3 - next, 0);

          if (next >= 3) {
            setBlockedSeconds(10);

            showToast(
              'Has alcanzado el máximo de 3 intentos. Intenta nuevamente en 10 segundos.',
              'warning'
            );
          } else {
            showToast(
              `Usuario o contraseña incorrectos. Te quedan ${remaining} intento(s).`,
              'danger'
            );
          }

          return next;
        });

        return;
      }

      showToast(backendMessage, 'danger');
    } finally {
      setLoading(false);
    }
  }

  const isBlocked = blockedSeconds > 0;

  return (
    <main className="login-page">
      {toast.show && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{
            zIndex: 9999,
            minWidth: '360px'
          }}
        >
          <div
            className={`alert alert-${toast.type} alert-dismissible shadow`}
            role="alert"
          >
            <strong>
              {toast.type === 'warning' ? 'Atención' : 'Error'}
            </strong>

            <div>{toast.message}</div>

            <button
              type="button"
              className="btn-close"
              onClick={closeToast}
              aria-label="Cerrar"
            />
          </div>
        </div>
      )}

      <div className="login-card">
        <Link to="/" className="text-decoration-none text-muted small">
          ← Volver al portal
        </Link>

        <h2 className="fw-bold mt-3">Ingreso CMS</h2>

        <p className="text-muted">
          Accede con tu usuario asignado.
        </p>

        {failedAttempts > 0 && !isBlocked && (
          <div className="alert alert-info">
            Intentos fallidos: {failedAttempts} de 3
          </div>
        )}

        {isBlocked && (
          <div className="alert alert-warning">
            Cuenta bloqueada temporalmente. Intenta nuevamente en{' '}
            <strong>{blockedSeconds}</strong> segundo(s).
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>

            <input
              type="text"
              name="username"
              className="form-control"
              value={form.username}
              onChange={handleChange}
              placeholder="username"
              disabled={isBlocked}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>

            <input
              type="password"
              name="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              disabled={isBlocked}
              required
            />
          </div>

          <button
            className="btn btn-primary w-100"
            disabled={loading || isBlocked}
          >
            {isBlocked
              ? `Bloqueado ${blockedSeconds}s`
              : loading
                ? 'Ingresando...'
                : 'Ingresar'}
          </button>

          <div className="text-center mt-3">
            <Link to="/admin/forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
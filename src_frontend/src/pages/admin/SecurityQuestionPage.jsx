import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function SecurityQuestionPage() {
  const {
    setSecurityQuestion,
    getMySecurityQuestion
  } = useAuth();

  const [form, setForm] = useState({
    pregunta: '',
    respuesta: ''
  });

  const [currentQuestion, setCurrentQuestion] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCurrentQuestion() {
      try {
        const data = await getMySecurityQuestion();

        setCurrentQuestion(
          data?.pregunta_seguridad || ''
        );
      } catch (err) {
        console.error(
          err.response?.data?.error || err.message
        );
      }
    }

    loadCurrentQuestion();
  }, [getMySecurityQuestion]);

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
      await setSecurityQuestion(
        form.pregunta,
        form.respuesta
      );

      setCurrentQuestion(form.pregunta);

      setMessage(
        'Pregunta de seguridad configurada correctamente'
      );

      setForm({
        pregunta: '',
        respuesta: ''
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Error al configurar pregunta'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="fw-bold">
        Pregunta de seguridad
      </h1>

      <p className="text-muted">
        Esta pregunta se usará para recuperar tu contraseña.
      </p>

      {currentQuestion ? (
        <div className="alert alert-info">
          <strong>Pregunta actual:</strong>
          <br />
          {currentQuestion}
        </div>
      ) : (
        <div className="alert alert-warning">
          No tienes una pregunta de seguridad configurada.
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Nueva pregunta
              </label>

              <input
                className="form-control"
                name="pregunta"
                value={form.pregunta}
                onChange={handleChange}
                placeholder="¿Cuál es el nombre de tu primera mascota?"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Nueva respuesta
              </label>

              <input
                className="form-control"
                name="respuesta"
                value={form.respuesta}
                onChange={handleChange}
                placeholder="Respuesta secreta"
                required
              />
            </div>

            <button
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Guardando...'
                : 'Guardar pregunta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
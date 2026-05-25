import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const paisesMap = {
  argentina: { id: 1, nombre: 'Argentina' },
  chile:     { id: 2, nombre: 'Chile' },
  ecuador:   { id: 3, nombre: 'Ecuador' },
};

const PAISES = [
  { slug: 'ecuador',   nombre: 'Ecuador' },
  { slug: 'argentina', nombre: 'Argentina' },
  { slug: 'chile',     nombre: 'Chile' },
];

const initialForm = { nombre: '', correo: '', telefono: '', finalidad: '', mensaje: '' };

export default function ContactoPage() {
  const { paisSlug } = useParams();
  const navigate = useNavigate();
  const pais = paisesMap[paisSlug] || paisesMap.argentina;

  const [form, setForm]       = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    if (paisSlug) localStorage.setItem('publicCountry', paisSlug);
  }, [paisSlug]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.nombre.trim())   return 'El nombre es obligatorio';
    if (!form.correo.trim())   return 'El correo es obligatorio';
    if (!form.telefono.trim()) return 'El teléfono es obligatorio';
    if (!form.finalidad.trim()) return 'La finalidad es obligatoria';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) return 'El formato del correo no es válido';
    if (form.telefono.length < 7) return 'El teléfono debe tener al menos 7 caracteres';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(''); setError(''); setLoading(true);
    try {
      const err = validate();
      if (err) { setError(err); setLoading(false); return; }
      await axiosClient.post('/solicitudes/public', { pais_id: pais.id, ...form });
      setMessage(`Solicitud enviada correctamente para ${pais.nombre}. Nuestro equipo revisará la información.`);
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.error || 'No fue posible enviar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="public-contact-page">
      <section className="public-contact-hero">
        <div className="container">
          <span className="public-detail-badge">Solicitudes públicas</span>
          <h1>Contáctanos en {pais.nombre}</h1>
          <p>Cuéntanos cómo podemos apoyarte. Tu solicitud será registrada y gestionada por el equipo correspondiente del país seleccionado.</p>
        </div>
      </section>

      <section className="container public-contact-section">
        {/* Selector de país */}
        <div className="d-flex gap-2 flex-wrap justify-content-center mb-4">
          {PAISES.map(p => (
            <button
              key={p.slug}
              className={`btn btn-sm fw-bold ${paisSlug === p.slug ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => navigate(`/paises/${p.slug}/solicitudes`)}
            >
              {p.nombre}
            </button>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="public-contact-info-card">
              <div className="contact-icon-box">
                <i className="bi bi-envelope-paper-heart" />
              </div>
              <h2>Estamos para orientarte</h2>
              <p>Completa el formulario con tus datos. Esta información permitirá clasificar tu solicitud y dar seguimiento desde el CMS administrativo.</p>
              <div className="contact-info-list">
                <div>
                  <i className="bi bi-geo-alt" />
                  <span>País seleccionado</span>
                  <strong>{pais.nombre}</strong>
                </div>
                <div>
                  <i className="bi bi-shield-check" />
                  <span>Gestión</span>
                  <strong>Seguimiento administrativo</strong>
                </div>
                <div>
                  <i className="bi bi-clock-history" />
                  <span>Estado inicial</span>
                  <strong>Pendiente</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="public-contact-form-card">
              <h2>Enviar solicitud</h2>
              <p>Los campos marcados son necesarios para poder contactarte.</p>

              {message && (
                <div className="alert alert-success alert-dismissible fade show">
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage('')} />
                </div>
              )}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError('')} />
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre completo</label>
                    <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ejemplo: Carlos Ramírez" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Correo electrónico</label>
                    <input className="form-control" type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control" name="telefono" value={form.telefono} onChange={handleChange} placeholder="3001234567" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Finalidad</label>
                    <select className="form-select" name="finalidad" value={form.finalidad} onChange={handleChange} required>
                      <option value="">Seleccione una opción</option>
                      <option value="Servicio">Servicio</option>
                      <option value="Programa EDIFICA">Programa EDIFICA</option>
                      <option value="Shows y conferencias">Shows y conferencias</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Mensaje</label>
                    <textarea className="form-control" name="mensaje" rows="6" value={form.mensaje} onChange={handleChange} placeholder="Cuéntanos brevemente tu necesidad..." />
                  </div>
                </div>
                <button className="public-submit-btn" disabled={loading}>
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Enviando...</>
                  ) : (
                    <>Enviar solicitud <i className="bi bi-send ms-2" /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

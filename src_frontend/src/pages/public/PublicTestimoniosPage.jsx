import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPublicTestimonios } from '../../services/publicService';

const PAISES = [
  { slug: 'ecuador',   nombre: 'Ecuador' },
  { slug: 'argentina', nombre: 'Argentina' },
  { slug: 'chile',     nombre: 'Chile' },
];

export default function PublicTestimoniosPage() {
  const { paisSlug } = useParams();
  const navigate = useNavigate();

  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await getPublicTestimonios(paisSlug);
        setTestimonios(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar testimonios');
      } finally {
        setLoading(false);
      }
    }
    if (paisSlug) {
      localStorage.setItem('publicCountry', paisSlug);
      load();
    }
  }, [paisSlug]);

  const filteredTestimonios = useMemo(() => {
    const q = search.toLowerCase().trim();
    return testimonios.filter(t => {
      const matchSearch = !q ||
        t.nombre?.toLowerCase().includes(q) ||
        t.cargo?.toLowerCase().includes(q) ||
        t.empresa?.toLowerCase().includes(q) ||
        t.contenido?.toLowerCase().includes(q);
      return matchSearch && (!onlyFeatured || t.destacado);
    });
  }, [testimonios, search, onlyFeatured]);

  function formatName(slug) {
    return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '';
  }

  if (loading) return (
    <main className="public-page">
      <div className="container py-5">
        <h1 className="fw-bold">Testimonios</h1>
        <div className="alert alert-info">Cargando testimonios...</div>
      </div>
    </main>
  );

  return (
    <main className="public-page">
      <section className="public-section-header">
        <span>Historias que inspiran</span>
        <h1>Testimonios de {formatName(paisSlug)}</h1>
        <p>Conoce experiencias reales de personas, empresas y comunidades que hacen parte de esta red.</p>
      </section>

      <section className="container pb-5">
        <div className="public-filter-card mb-4">
          {/* Selector de país */}
          <div>
            <label className="form-label fw-semibold">Seleccionar país</label>
            <div className="d-flex gap-2 flex-wrap">
              {PAISES.map(p => (
                <button
                  key={p.slug}
                  className={`btn btn-sm ${paisSlug === p.slug ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => navigate(`/paises/${p.slug}/testimonios`)}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Buscador */}
          <div className="mt-3">
            <label className="form-label">Buscar testimonio</label>
            <input
              className="form-control"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, empresa, cargo o contenido..."
            />
          </div>

          <div className="public-featured-switch">
            <label className="form-check-label" htmlFor="onlyFeatured">Solo destacados</label>
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="onlyFeatured"
              checked={onlyFeatured}
              onChange={e => setOnlyFeatured(e.target.checked)}
            />
          </div>

          <div className="public-filter-info">
            <strong>{filteredTestimonios.length}</strong>
            <span>resultado(s)</span>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {filteredTestimonios.length === 0 ? (
          <div className="alert alert-warning">No hay testimonios publicados para este país.</div>
        ) : (
          <div className="public-testimonial-grid">
            {filteredTestimonios.map(testimonio => (
              <article key={testimonio.id} className={`public-testimonial-card ${testimonio.destacado ? 'featured' : ''}`}>
                {testimonio.destacado && <span className="testimonial-featured-badge">Destacado</span>}

                <div className="testimonial-photo-wrapper">
                  {testimonio.foto_url ? (
                    <img src={testimonio.foto_url} alt={testimonio.nombre} className="testimonial-photo" />
                  ) : (
                    <div className="testimonial-photo placeholder">
                      <i className="bi bi-person" />
                    </div>
                  )}
                </div>

                <div className="testimonial-quote-icon"><i className="bi bi-quote" /></div>
                <p className="testimonial-content">{testimonio.contenido}</p>

                <div className="testimonial-person">
                  <h3>{testimonio.nombre}</h3>
                  <span>
                    {testimonio.cargo || 'Participante'}
                    {testimonio.empresa ? ` · ${testimonio.empresa}` : ''}
                  </span>
                </div>

                <div className="text-center">
                  <Link to={`/paises/${paisSlug}/testimonios/${testimonio.id}`} className="testimonial-detail-link">
                    Ver testimonio <i className="bi bi-arrow-right ms-1" />
                  </Link>
                </div>

                <div className="testimonial-footer">
                  <span className="public-news-badge">
                    {testimonio.pais?.nombre || formatName(paisSlug)}
                  </span>
                  <div className="testimonial-socials">
                    {testimonio.instagram_url && (
                      <a href={testimonio.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram">
                        <i className="bi bi-instagram" />
                      </a>
                    )}
                    {testimonio.facebook_url && (
                      <a href={testimonio.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook">
                        <i className="bi bi-facebook" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

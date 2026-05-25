import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPublicNoticias } from '../../services/publicService';

const ITEMS_PER_PAGE = 6;

const PAISES = [
  { slug: 'ecuador',   nombre: 'Ecuador' },
  { slug: 'argentina', nombre: 'Argentina' },
  { slug: 'chile',     nombre: 'Chile' },
];

export default function PublicNoticiasPage() {
  const { paisSlug } = useParams();
  const navigate = useNavigate();

  const [noticias, setNoticias]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await getPublicNoticias(paisSlug);
        setNoticias(data);
        setCurrentPage(1);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar noticias');
      } finally {
        setLoading(false);
      }
    }
    if (paisSlug) {
      localStorage.setItem('publicCountry', paisSlug);
      load();
    }
  }, [paisSlug]);

  const filteredNoticias = useMemo(() => {
    const q = search.toLowerCase().trim();
    return noticias.filter(n =>
      !q || n.titulo?.toLowerCase().includes(q) || n.resumen?.toLowerCase().includes(q)
    );
  }, [noticias, search]);

  const totalPages = Math.ceil(filteredNoticias.length / ITEMS_PER_PAGE) || 1;
  const paginatedNoticias = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNoticias.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNoticias, currentPage]);

  function formatName(slug) {
    return slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : '';
  }

  function handlePaisChange(slug) {
    navigate(`/paises/${slug}/noticias`);
  }

  if (loading) return (
    <main className="public-page">
      <div className="container py-5">
        <h1 className="fw-bold">Noticias</h1>
        <div className="alert alert-info">Cargando noticias...</div>
      </div>
    </main>
  );

  return (
    <main className="public-page">
      <section className="public-section-header">
        <span>Noticias públicas</span>
        <h1>Noticias de {formatName(paisSlug)}</h1>
        <p>Consulta novedades, historias y actualizaciones publicadas para este país.</p>
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
                  onClick={() => handlePaisChange(p.slug)}
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Buscador */}
          <div className="mt-3">
            <label className="form-label">Buscar noticia</label>
            <input
              className="form-control"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por título o resumen..."
            />
          </div>

          <div className="public-filter-info">
            <strong>{filteredNoticias.length}</strong>
            <span>resultado(s)</span>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {filteredNoticias.length === 0 ? (
          <div className="alert alert-warning">No hay noticias publicadas para este país.</div>
        ) : (
          <>
            <div className="public-news-grid">
              {paginatedNoticias.map(noticia => (
                <article key={noticia.id} className="public-news-card">
                  <div className="public-news-image">
                    {noticia.imagen_principal_url ? (
                      <img src={noticia.imagen_principal_url} alt={noticia.titulo} />
                    ) : (
                      <div className="public-image-placeholder">
                        <i className="bi bi-newspaper" />
                      </div>
                    )}
                  </div>
                  <div className="public-news-body">
                    <span className="public-news-badge">
                      {noticia.pais?.nombre || formatName(paisSlug)}
                    </span>
                    <h3>{noticia.titulo}</h3>
                    <p>{noticia.resumen}</p>
                    <div className="public-news-footer">
                      <small>
                        {noticia.fecha_publicacion
                          ? new Date(noticia.fecha_publicacion).toLocaleDateString()
                          : 'Publicado'}
                      </small>
                      <Link to={`/paises/${paisSlug}/noticias/${noticia.slug}`} className="public-read-link">
                        Leer más <i className="bi bi-arrow-right ms-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="d-flex justify-content-center mt-5">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>Siguiente</button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

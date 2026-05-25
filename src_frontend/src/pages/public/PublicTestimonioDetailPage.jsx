import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getPublicTestimonios } from '../../services/publicService';

export default function PublicTestimonioDetailPage() {
  const { paisSlug, id } = useParams();

  const [testimonio, setTestimonio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTestimonio() {
      try {
        setLoading(true);
        setError('');

        const data = await getPublicTestimonios(paisSlug);

        const found = data.find(
          (item) => Number(item.id) === Number(id)
        );

        if (!found) {
          setError('Testimonio no encontrado');
          return;
        }

        setTestimonio(found);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            'No fue posible cargar el testimonio'
        );
      } finally {
        setLoading(false);
      }
    }

    loadTestimonio();
  }, [paisSlug, id]);

  if (loading) {
    return (
      <main className="public-page">
        <div className="container py-5">
          <div className="alert alert-info">
            Cargando testimonio...
          </div>
        </div>
      </main>
    );
  }

  if (error || !testimonio) {
    return (
      <main className="public-page">
        <div className="container py-5">
          <div className="alert alert-danger">
            {error || 'Testimonio no encontrado'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="public-testimonial-detail-page">
      <section className="public-testimonial-detail-container">
        <Link
          to={`/paises/${paisSlug}/testimonios`}
          className="public-article-back"
        >
          <i className="bi bi-arrow-left" />
          Volver a testimonios
        </Link>

        <article className="public-testimonial-detail-card">
          <div className="testimonial-detail-left">
            <div className="testimonial-detail-photo-wrap">
              {testimonio.foto_url ? (
                <img
                  src={testimonio.foto_url}
                  alt={testimonio.nombre}
                  className="testimonial-detail-photo"
                />
              ) : (
                <div className="testimonial-detail-photo placeholder">
                  <i className="bi bi-person" />
                </div>
              )}
            </div>

            {testimonio.destacado && (
              <span className="testimonial-detail-badge">
                Testimonio destacado
              </span>
            )}

            <h1>{testimonio.nombre}</h1>

            <p className="testimonial-detail-role">
              {testimonio.cargo || 'Participante'}
              {testimonio.empresa ? ` · ${testimonio.empresa}` : ''}
            </p>

            <span className="public-news-badge">
              {testimonio.pais?.nombre || paisSlug}
            </span>

            <div className="testimonial-detail-socials">
              {testimonio.instagram_url && (
                <a
                  href={testimonio.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <i className="bi bi-instagram" />
                </a>
              )}

              {testimonio.facebook_url && (
                <a
                  href={testimonio.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <i className="bi bi-facebook" />
                </a>
              )}
            </div>
          </div>

          <div className="testimonial-detail-right">
            <div className="testimonial-detail-quote">
              <i className="bi bi-quote" />
            </div>

            <h2>Historia de impacto</h2>

            <div className="testimonial-detail-content">
              {testimonio.contenido
                ?.split('\n')
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
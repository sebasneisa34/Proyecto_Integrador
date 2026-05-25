import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function PublicNoticiaDetailPage() {
  const { paisSlug, noticiaSlug } = useParams();

  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadNoticia() {
      try {
        setLoading(true);
        setError('');

        const response = await axiosClient.get(
          `/public/paises/${paisSlug}/noticias/${noticiaSlug}`
        );

        setNoticia(response.data);
      } catch (err) {
        setError(
          err.response?.data?.error || 'No fue posible cargar la noticia'
        );
      } finally {
        setLoading(false);
      }
    }

    loadNoticia();
  }, [paisSlug, noticiaSlug]);

  if (loading) {
    return (
      <main className="public-page">
        <div className="container py-5">
          <div className="alert alert-info">Cargando noticia...</div>
        </div>
      </main>
    );
  }

  if (error || !noticia) {
    return (
      <main className="public-page">
        <div className="container py-5">
          <div className="alert alert-danger">
            {error || 'Noticia no encontrada'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="public-article-page">
      <section className="public-article-container">
        <Link
          to={`/paises/${paisSlug}/noticias`}
          className="public-article-back"
        >
          <i className="bi bi-arrow-left" />
          Volver a noticias
        </Link>

        {noticia.imagen_principal_url && (
          <div className="public-article-image">
            <img src={noticia.imagen_principal_url} alt={noticia.titulo} />
          </div>
        )}

        <div className="public-article-meta">
          <span>
            <i className="bi bi-person" />
            {noticia.autor?.nombre || 'Latinoamérica Comparte'}
          </span>

          <span>
            <i className="bi bi-folder2-open" />
            Noticias
          </span>

          <span>
            <i className="bi bi-geo-alt" />
            {noticia.pais?.nombre || paisSlug}
          </span>
        </div>

        <h1 className="public-article-title">{noticia.titulo}</h1>

        <p className="public-article-summary">{noticia.resumen}</p>

        <div className="public-article-content">
          {noticia.contenido?.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
    </main>
  );
}
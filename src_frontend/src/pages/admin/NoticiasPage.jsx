import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteNoticia,
  getNoticias,
  updateNoticiaEstado
} from '../../services/noticiaService';

const ITEMS_PER_PAGE = 5;

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [paisFilter, setPaisFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    noticia: null
  });

  const [imagePreview, setImagePreview] = useState({
    show: false,
    url: '',
    title: ''
  });

  const loadNoticias = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getNoticias();
      setNoticias(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar noticias');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNoticias();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadNoticias]);

  const paisesDisponibles = useMemo(() => {
    const paisesMap = new Map();

    noticias.forEach((noticia) => {
      if (noticia.pais?.id) {
        paisesMap.set(noticia.pais.id, noticia.pais);
      }
    });

    return Array.from(paisesMap.values());
  }, [noticias]);

  const filteredNoticias = useMemo(() => {
    return noticias.filter((noticia) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        noticia.titulo?.toLowerCase().includes(searchValue) ||
        noticia.slug?.toLowerCase().includes(searchValue);

      const matchesEstado =
        !estadoFilter || noticia.estado === estadoFilter;

      const matchesPais =
        !paisFilter || Number(noticia.pais?.id) === Number(paisFilter);

      return matchesSearch && matchesEstado && matchesPais;
    });
  }, [noticias, search, estadoFilter, paisFilter]);

  const totalPages =
    Math.ceil(filteredNoticias.length / ITEMS_PER_PAGE) || 1;

  const paginatedNoticias = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredNoticias.slice(start, end);
  }, [filteredNoticias, currentPage]);

  const totalPublicadas = noticias.filter(
    (noticia) => noticia.estado === 'publicado'
  ).length;

  const totalBorradores = noticias.filter(
    (noticia) => noticia.estado === 'borrador'
  ).length;

  const totalDespublicadas = noticias.filter(
    (noticia) => noticia.estado === 'despublicado'
  ).length;

  function clearFilters() {
    setSearch('');
    setEstadoFilter('');
    setPaisFilter('');
    setCurrentPage(1);
  }

  function getEstadoBadge(estado) {
    if (estado === 'publicado') {
      return 'status-badge status-published';
    }

    if (estado === 'despublicado') {
      return 'status-badge status-unpublished';
    }

    return 'status-badge status-draft';
  }

  function getEstadoLabel(estado) {
    if (estado === 'publicado') return 'Publicado';
    if (estado === 'despublicado') return 'Despublicado';
    return 'Borrador';
  }

  async function handleCambiarEstado(id, estado) {
    setMessage('');
    setError('');

    try {
      await updateNoticiaEstado(id, estado);
      setMessage('Estado actualizado correctamente');
      await loadNoticias();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  }

  function openDeleteModal(noticia) {
    setDeleteModal({
      show: true,
      noticia
    });
  }

  function closeDeleteModal() {
    setDeleteModal({
      show: false,
      noticia: null
    });
  }

  async function confirmDelete() {
    if (!deleteModal.noticia) return;

    setMessage('');
    setError('');

    try {
      await deleteNoticia(deleteModal.noticia.id);

      setMessage('Noticia eliminada correctamente');
      closeDeleteModal();

      await loadNoticias();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar noticia');
    }
  }

  function openImagePreview(url, title) {
    setImagePreview({
      show: true,
      url,
      title
    });
  }

  function closeImagePreview() {
    setImagePreview({
      show: false,
      url: '',
      title: ''
    });
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  if (loading) {
    return (
      <div>
        <h1 className="fw-bold">Noticias</h1>

        <div className="alert alert-info">
          Cargando noticias...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">Noticias</h1>

          <p className="text-muted mb-0">
            Gestiona las noticias del CMS multipaís.
          </p>
        </div>

        <Link to="/admin/noticias/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2" />
          Nueva noticia
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <small>Total noticias</small>
            <h3>{noticias.length}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Publicadas</small>
            <h3 className="text-success">
              {totalPublicadas}
            </h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Borradores</small>
            <h3 className="text-warning">
              {totalBorradores}
            </h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Despublicadas</small>
            <h3 className="text-secondary">
              {totalDespublicadas}
            </h3>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Buscar por título</label>

              <input
                className="form-control"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar noticia..."
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Estado</label>

              <select
                className="form-select"
                value={estadoFilter}
                onChange={(event) => {
                  setEstadoFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos</option>
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
                <option value="despublicado">Despublicado</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">País</label>

              <select
                className="form-select"
                value={paisFilter}
                onChange={(event) => {
                  setPaisFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos</option>

                {paisesDisponibles.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="alert alert-success alert-dismissible fade show">
          {message}

          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage('')}
          />
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}

          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          />
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <span className="text-muted small">
              Mostrando {paginatedNoticias.length} de{' '}
              {filteredNoticias.length} resultado(s)
            </span>

            <span className="text-muted small">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          {filteredNoticias.length === 0 ? (
            <div className="alert alert-warning mb-0">
              No hay noticias que coincidan con los filtros.
            </div>
          ) : (
            <>
              <div className="table-responsive modern-table-wrapper">
                <table className="table align-middle modern-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Noticia</th>
                      <th>País</th>
                      <th>Estado</th>
                      <th>Autor</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedNoticias.map((noticia) => (
                      <tr key={noticia.id}>
                        <td>
                          {noticia.imagen_principal_url ? (
                            <button
                              className="image-preview-button"
                              onClick={() =>
                                openImagePreview(
                                  noticia.imagen_principal_url,
                                  noticia.titulo
                                )
                              }
                            >
                              <img
                                src={noticia.imagen_principal_url}
                                alt={noticia.titulo}
                              />
                            </button>
                          ) : (
                            <div className="image-placeholder">
                              <i className="bi bi-image" />
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="news-title">
                            #{noticia.id} {noticia.titulo}
                          </div>

                          <div className="news-slug">
                            {noticia.slug}
                          </div>
                        </td>

                        <td>
                          <span className="country-pill">
                            {noticia.pais?.nombre || 'Sin país'}
                          </span>
                        </td>

                        <td>
                          <span className={getEstadoBadge(noticia.estado)}>
                            {getEstadoLabel(noticia.estado)}
                          </span>
                        </td>

                        <td>
                          <span className="text-muted small">
                            {noticia.autor
                              ? `${noticia.autor.nombre} ${noticia.autor.apellido}`
                              : 'Sin autor'}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2 justify-content-end flex-wrap">
                            <Link
                              to={`/admin/noticias/${noticia.id}/edit`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-pencil-square me-1" />
                              Editar
                            </Link>

                            {noticia.estado !== 'publicado' && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  handleCambiarEstado(
                                    noticia.id,
                                    'publicado'
                                  )
                                }
                              >
                                <i className="bi bi-check-circle me-1" />
                                Publicar
                              </button>
                            )}

                            {noticia.estado === 'publicado' && (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  handleCambiarEstado(
                                    noticia.id,
                                    'despublicado'
                                  )
                                }
                              >
                                <i className="bi bi-eye-slash me-1" />
                                Despublicar
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => openDeleteModal(noticia)}
                            >
                              <i className="bi bi-trash me-1" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? 'disabled' : ''
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Anterior
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, index) => (
                      <li
                        key={index + 1}
                        className={`page-item ${
                          currentPage === index + 1 ? 'active' : ''
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? 'disabled' : ''
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>

      {deleteModal.show && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <div className="custom-modal-icon danger">
              <i className="bi bi-exclamation-triangle" />
            </div>

            <h5>Eliminar noticia</h5>

            <p>
              ¿Seguro que deseas eliminar la noticia{' '}
              <strong>{deleteModal.noticia?.titulo}</strong>?
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>

              <button
                className="btn btn-danger"
                onClick={confirmDelete}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {imagePreview.show && (
        <div
          className="custom-modal-backdrop"
          onClick={closeImagePreview}
        >
          <div
            className="custom-modal image-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">{imagePreview.title}</h5>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={closeImagePreview}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <img
              src={imagePreview.url}
              alt={imagePreview.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteTestimonio,
  getTestimonios,
  updateTestimonioEstado
} from '../../services/testimonioService';

const ITEMS_PER_PAGE = 5;

export default function TestimoniosPage() {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [paisFilter, setPaisFilter] = useState('');
  const [destacadoFilter, setDestacadoFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    testimonio: null
  });

  const [imagePreview, setImagePreview] = useState({
    show: false,
    url: '',
    title: ''
  });

  const loadTestimonios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getTestimonios();
      setTestimonios(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar testimonios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTestimonios();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadTestimonios]);

  const paisesDisponibles = useMemo(() => {
    const paisesMap = new Map();

    testimonios.forEach((testimonio) => {
      if (testimonio.pais?.id) {
        paisesMap.set(testimonio.pais.id, testimonio.pais);
      }
    });

    return Array.from(paisesMap.values());
  }, [testimonios]);

  const filteredTestimonios = useMemo(() => {
    return testimonios.filter((testimonio) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        testimonio.nombre?.toLowerCase().includes(searchValue) ||
        testimonio.empresa?.toLowerCase().includes(searchValue) ||
        testimonio.cargo?.toLowerCase().includes(searchValue);

      const matchesEstado =
        !estadoFilter || testimonio.estado === estadoFilter;

      const matchesPais =
        !paisFilter || Number(testimonio.pais?.id) === Number(paisFilter);

      const matchesDestacado =
        destacadoFilter === ''
          ? true
          : String(testimonio.destacado) === destacadoFilter;

      return (
        matchesSearch &&
        matchesEstado &&
        matchesPais &&
        matchesDestacado
      );
    });
  }, [testimonios, search, estadoFilter, paisFilter, destacadoFilter]);

  const totalPages =
    Math.ceil(filteredTestimonios.length / ITEMS_PER_PAGE) || 1;

  const paginatedTestimonios = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredTestimonios.slice(start, end);
  }, [filteredTestimonios, currentPage]);

  const totalPublicados = testimonios.filter(
    (testimonio) => testimonio.estado === 'publicado'
  ).length;

  const totalBorradores = testimonios.filter(
    (testimonio) => testimonio.estado === 'borrador'
  ).length;

  const totalDestacados = testimonios.filter(
    (testimonio) => testimonio.destacado
  ).length;

  function clearFilters() {
    setSearch('');
    setEstadoFilter('');
    setPaisFilter('');
    setDestacadoFilter('');
    setCurrentPage(1);
  }

  function getEstadoBadge(estado) {
    if (estado === 'publicado') return 'status-badge status-published';
    if (estado === 'despublicado') return 'status-badge status-unpublished';
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
      await updateTestimonioEstado(id, estado);
      setMessage('Estado actualizado correctamente');
      await loadTestimonios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  }

  function openDeleteModal(testimonio) {
    setDeleteModal({
      show: true,
      testimonio
    });
  }

  function closeDeleteModal() {
    setDeleteModal({
      show: false,
      testimonio: null
    });
  }

  async function confirmDelete() {
    if (!deleteModal.testimonio) return;

    setMessage('');
    setError('');

    try {
      await deleteTestimonio(deleteModal.testimonio.id);

      setMessage('Testimonio eliminado correctamente');
      closeDeleteModal();

      await loadTestimonios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar testimonio');
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
        <h1 className="fw-bold">Testimonios</h1>
        <div className="alert alert-info">Cargando testimonios...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">Testimonios</h1>
          <p className="text-muted mb-0">
            Gestiona los testimonios visibles en el portal público.
          </p>
        </div>

        <Link to="/admin/testimonios/create" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2" />
          Nuevo testimonio
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <small>Total testimonios</small>
            <h3>{testimonios.length}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Publicados</small>
            <h3 className="text-success">{totalPublicados}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Borradores</small>
            <h3 className="text-warning">{totalBorradores}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Destacados</small>
            <h3 className="text-primary">{totalDestacados}</h3>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Buscar</label>
              <input
                className="form-control"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nombre, cargo o empresa..."
              />
            </div>

            <div className="col-md-2">
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
              <label className="form-label">Destacado</label>
              <select
                className="form-select"
                value={destacadoFilter}
                onChange={(event) => {
                  setDestacadoFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
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
              Mostrando {paginatedTestimonios.length} de{' '}
              {filteredTestimonios.length} resultado(s)
            </span>

            <span className="text-muted small">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          {filteredTestimonios.length === 0 ? (
            <div className="alert alert-warning mb-0">
              No hay testimonios que coincidan con los filtros.
            </div>
          ) : (
            <>
              <div className="table-responsive modern-table-wrapper">
                <table className="table align-middle modern-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Persona</th>
                      <th>País</th>
                      <th>Estado</th>
                      <th>Destacado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTestimonios.map((testimonio) => (
                      <tr key={testimonio.id}>
                        <td>
                          {testimonio.foto_url ? (
                            <button
                              className="image-preview-button"
                              onClick={() =>
                                openImagePreview(
                                  testimonio.foto_url,
                                  testimonio.nombre
                                )
                              }
                            >
                              <img
                                src={testimonio.foto_url}
                                alt={testimonio.nombre}
                              />
                            </button>
                          ) : (
                            <div className="image-placeholder">
                              <i className="bi bi-person" />
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="news-title">
                            #{testimonio.id} {testimonio.nombre}
                          </div>

                          <div className="news-slug">
                            {testimonio.cargo || 'Sin cargo'} ·{' '}
                            {testimonio.empresa || 'Sin empresa'}
                          </div>
                        </td>

                        <td>
                          <span className="country-pill">
                            {testimonio.pais?.nombre || 'Sin país'}
                          </span>
                        </td>

                        <td>
                          <span className={getEstadoBadge(testimonio.estado)}>
                            {getEstadoLabel(testimonio.estado)}
                          </span>
                        </td>

                        <td>
                          {testimonio.destacado ? (
                            <span className="status-badge status-published">
                              Sí
                            </span>
                          ) : (
                            <span className="status-badge status-unpublished">
                              No
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="d-flex gap-2 justify-content-end flex-wrap">
                            <Link
                              to={`/admin/testimonios/${testimonio.id}/edit`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-pencil-square me-1" />
                              Editar
                            </Link>

                            {testimonio.estado !== 'publicado' && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() =>
                                  handleCambiarEstado(
                                    testimonio.id,
                                    'publicado'
                                  )
                                }
                              >
                                <i className="bi bi-check-circle me-1" />
                                Publicar
                              </button>
                            )}

                            {testimonio.estado === 'publicado' && (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                  handleCambiarEstado(
                                    testimonio.id,
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
                              onClick={() => openDeleteModal(testimonio)}
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

            <h5>Eliminar testimonio</h5>

            <p>
              ¿Seguro que deseas eliminar el testimonio de{' '}
              <strong>{deleteModal.testimonio?.nombre}</strong>?
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>

              <button className="btn btn-danger" onClick={confirmDelete}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {imagePreview.show && (
        <div className="custom-modal-backdrop" onClick={closeImagePreview}>
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

            <img src={imagePreview.url} alt={imagePreview.title} />
          </div>
        </div>
      )}
    </div>
  );
}
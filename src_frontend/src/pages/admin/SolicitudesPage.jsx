import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteSolicitud,
  getSolicitudes,
  updateSolicitudEstado
} from '../../services/solicitudService';

const ITEMS_PER_PAGE = 5;

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [paisFilter, setPaisFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [estadoModal, setEstadoModal] = useState({
    show: false,
    solicitud: null,
    estado: '',
    observaciones_admin: ''
  });

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    solicitud: null
  });

  const loadSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getSolicitudes();
      setSolicitudes(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSolicitudes();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadSolicitudes]);

  const paisesDisponibles = useMemo(() => {
    const paisesMap = new Map();

    solicitudes.forEach((solicitud) => {
      if (solicitud.pais?.id) {
        paisesMap.set(solicitud.pais.id, solicitud.pais);
      }
    });

    return Array.from(paisesMap.values());
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        solicitud.nombre?.toLowerCase().includes(searchValue) ||
        solicitud.correo?.toLowerCase().includes(searchValue) ||
        solicitud.telefono?.toLowerCase().includes(searchValue) ||
        solicitud.finalidad?.toLowerCase().includes(searchValue);

      const matchesEstado =
        !estadoFilter || solicitud.estado === estadoFilter;

      const matchesPais =
        !paisFilter || Number(solicitud.pais?.id) === Number(paisFilter);

      return matchesSearch && matchesEstado && matchesPais;
    });
  }, [solicitudes, search, estadoFilter, paisFilter]);

  const totalPages =
    Math.ceil(filteredSolicitudes.length / ITEMS_PER_PAGE) || 1;

  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredSolicitudes.slice(start, end);
  }, [filteredSolicitudes, currentPage]);

  const totalPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === 'pendiente'
  ).length;

  const totalProceso = solicitudes.filter(
    (solicitud) => solicitud.estado === 'en_proceso'
  ).length;

  const totalGestionadas = solicitudes.filter(
    (solicitud) => solicitud.estado === 'gestionada'
  ).length;

  function clearFilters() {
    setSearch('');
    setEstadoFilter('');
    setPaisFilter('');
    setCurrentPage(1);
  }

  function getEstadoBadge(estado) {
    if (estado === 'gestionada') return 'status-badge status-published';
    if (estado === 'cerrada') return 'status-badge status-unpublished';
    if (estado === 'en_proceso') return 'status-badge status-draft';
    return 'status-badge status-warning';
  }

  function getEstadoLabel(estado) {
    if (estado === 'pendiente') return 'Pendiente';
    if (estado === 'en_proceso') return 'En proceso';
    if (estado === 'gestionada') return 'Gestionada';
    if (estado === 'cerrada') return 'Cerrada';
    return estado;
  }

  function openEstadoModal(solicitud) {
    setEstadoModal({
      show: true,
      solicitud,
      estado: solicitud.estado || 'pendiente',
      observaciones_admin: solicitud.observaciones_admin || ''
    });
  }

  function closeEstadoModal() {
    setEstadoModal({
      show: false,
      solicitud: null,
      estado: '',
      observaciones_admin: ''
    });
  }

  async function confirmEstadoUpdate() {
    if (!estadoModal.solicitud) return;

    setMessage('');
    setError('');

    try {
      await updateSolicitudEstado(
        estadoModal.solicitud.id,
        estadoModal.estado,
        estadoModal.observaciones_admin
      );

      setMessage('Estado de solicitud actualizado correctamente');
      closeEstadoModal();

      await loadSolicitudes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar estado');
    }
  }

  function openDeleteModal(solicitud) {
    setDeleteModal({
      show: true,
      solicitud
    });
  }

  function closeDeleteModal() {
    setDeleteModal({
      show: false,
      solicitud: null
    });
  }

  async function confirmDelete() {
    if (!deleteModal.solicitud) return;

    setMessage('');
    setError('');

    try {
      await deleteSolicitud(deleteModal.solicitud.id);

      setMessage('Solicitud eliminada correctamente');
      closeDeleteModal();

      await loadSolicitudes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar solicitud');
    }
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  if (loading) {
    return (
      <div>
        <h1 className="fw-bold">Solicitudes</h1>
        <div className="alert alert-info">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">Solicitudes de contacto</h1>
          <p className="text-muted mb-0">
            Gestiona las solicitudes enviadas desde el portal público.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <small>Total solicitudes</small>
            <h3>{solicitudes.length}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Pendientes</small>
            <h3 className="text-warning">{totalPendientes}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>En proceso</small>
            <h3 className="text-primary">{totalProceso}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Gestionadas</small>
            <h3 className="text-success">{totalGestionadas}</h3>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Buscar</label>
              <input
                className="form-control"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Nombre, correo, teléfono o finalidad..."
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
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="gestionada">Gestionada</option>
                <option value="cerrada">Cerrada</option>
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
              Mostrando {paginatedSolicitudes.length} de{' '}
              {filteredSolicitudes.length} resultado(s)
            </span>

            <span className="text-muted small">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          {filteredSolicitudes.length === 0 ? (
            <div className="alert alert-warning mb-0">
              No hay solicitudes que coincidan con los filtros.
            </div>
          ) : (
            <>
              <div className="table-responsive modern-table-wrapper">
                <table className="table align-middle modern-table">
                  <thead>
                    <tr>
                      <th>Solicitante</th>
                      <th>Contacto</th>
                      <th>País</th>
                      <th>Finalidad</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedSolicitudes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>
                          <div className="news-title">
                            #{solicitud.id} {solicitud.nombre}
                          </div>
                          <div className="news-slug">
                            {solicitud.created_at
                              ? new Date(
                                  solicitud.created_at
                                ).toLocaleDateString()
                              : 'Sin fecha'}
                          </div>
                        </td>

                        <td>
                          <div>{solicitud.correo}</div>
                          <div className="text-muted small">
                            {solicitud.telefono}
                          </div>
                        </td>

                        <td>
                          <span className="country-pill">
                            {solicitud.pais?.nombre || 'Sin país'}
                          </span>
                        </td>

                        <td>
                          <span className="text-muted small">
                            {solicitud.finalidad}
                          </span>
                        </td>

                        <td>
                          <span className={getEstadoBadge(solicitud.estado)}>
                            {getEstadoLabel(solicitud.estado)}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2 justify-content-end flex-wrap">
                            <Link
                              to={`/admin/solicitudes/${solicitud.id}/edit`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-pencil-square me-1" />
                              Ver / editar
                            </Link>

                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => openEstadoModal(solicitud)}
                            >
                              <i className="bi bi-arrow-repeat me-1" />
                              Estado
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => openDeleteModal(solicitud)}
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

      {estadoModal.show && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <div className="custom-modal-icon">
              <i className="bi bi-arrow-repeat" />
            </div>

            <h5>Gestionar solicitud</h5>

            <p className="text-muted">
              Solicitud de <strong>{estadoModal.solicitud?.nombre}</strong>
            </p>

            <div className="mb-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={estadoModal.estado}
                onChange={(event) =>
                  setEstadoModal((prev) => ({
                    ...prev,
                    estado: event.target.value
                  }))
                }
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="gestionada">Gestionada</option>
                <option value="cerrada">Cerrada</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                rows="4"
                value={estadoModal.observaciones_admin}
                onChange={(event) =>
                  setEstadoModal((prev) => ({
                    ...prev,
                    observaciones_admin: event.target.value
                  }))
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={closeEstadoModal}
              >
                Cancelar
              </button>

              <button className="btn btn-success" onClick={confirmEstadoUpdate}>
                Guardar estado
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <div className="custom-modal-icon danger">
              <i className="bi bi-exclamation-triangle" />
            </div>

            <h5>Eliminar solicitud</h5>

            <p>
              ¿Seguro que deseas eliminar la solicitud de{' '}
              <strong>{deleteModal.solicitud?.nombre}</strong>?
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
    </div>
  );
}
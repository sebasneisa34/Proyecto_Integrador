import { useCallback, useEffect, useMemo, useState } from 'react';

import { getAuditoria } from '../../services/auditService';

const ITEMS_PER_PAGE = 8;

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [moduloFilter, setModuloFilter] = useState('');
  const [accionFilter, setAccionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailModal, setDetailModal] = useState({
    show: false,
    log: null
  });

  const loadAuditoria = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAuditoria();
      setLogs(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar auditoría');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAuditoria();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadAuditoria]);

  const modulosDisponibles = useMemo(() => {
    return [...new Set(logs.map((log) => log.modulo).filter(Boolean))];
  }, [logs]);

  const accionesDisponibles = useMemo(() => {
    return [...new Set(logs.map((log) => log.accion).filter(Boolean))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchValue = search.toLowerCase().trim();

      const userText = log.usuario
        ? `${log.usuario.nombre || ''} ${log.usuario.apellido || ''} ${
            log.usuario.username || ''
          }`
        : '';

      const matchesSearch =
        !searchValue ||
        log.accion?.toLowerCase().includes(searchValue) ||
        log.modulo?.toLowerCase().includes(searchValue) ||
        log.descripcion?.toLowerCase().includes(searchValue) ||
        log.ip?.toLowerCase().includes(searchValue) ||
        userText.toLowerCase().includes(searchValue);

      const matchesModulo =
        !moduloFilter || log.modulo === moduloFilter;

      const matchesAccion =
        !accionFilter || log.accion === accionFilter;

      return matchesSearch && matchesModulo && matchesAccion;
    });
  }, [logs, search, moduloFilter, accionFilter]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredLogs.slice(start, end);
  }, [filteredLogs, currentPage]);

  const totalLogin = logs.filter((log) =>
    log.accion?.includes('iniciar_sesion')
  ).length;

  const totalCreate = logs.filter((log) =>
    log.accion?.includes('crear')
  ).length;

  const totalUpdate = logs.filter((log) =>
    log.accion?.includes('actualizar')
  ).length;

  const totalDelete = logs.filter((log) =>
    log.accion?.includes('eliminar')
  ).length;

  function clearFilters() {
    setSearch('');
    setModuloFilter('');
    setAccionFilter('');
    setCurrentPage(1);
  }

  function openDetailModal(log) {
    setDetailModal({
      show: true,
      log
    });
  }

  function closeDetailModal() {
    setDetailModal({
      show: false,
      log: null
    });
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function formatDate(value) {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleString();
  }

  function getActionBadge(accion) {
    if (accion?.includes('eliminar')) return 'status-badge status-unpublished';
    if (accion?.includes('crear')) return 'status-badge status-published';
    if (accion?.includes('actualizar')) return 'status-badge status-draft';
    if (accion?.includes('iniciar_sesion')) return 'status-badge status-login';

    return 'status-badge status-warning';
  }

  if (loading) {
    return (
      <div>
        <h1 className="fw-bold">Auditoría</h1>
        <div className="alert alert-info">Cargando auditoría...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">Bitácora de auditoría</h1>
          <p className="text-muted mb-0">
            Consulta la trazabilidad de acciones realizadas en el CMS.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <small>Total eventos</small>
            <h3>{logs.length}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Inicios de sesión</small>
            <h3 className="text-primary">{totalLogin}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Creaciones</small>
            <h3 className="text-success">{totalCreate}</h3>
          </div>
        </div>

        <div className="col-md-3">
        <div className="metric-card">
            <small>Actualizaciones</small>
            <h3 className="text-warning">{totalUpdate}</h3>
        </div>
        </div>

        <div className="col-md-3">
        <div className="metric-card">
            <small>Eliminaciones</small>
            <h3 className="text-danger">{totalDelete}</h3>
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
                placeholder="Usuario, acción, módulo, IP..."
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Módulo</label>
              <select
                className="form-select"
                value={moduloFilter}
                onChange={(event) => {
                  setModuloFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos</option>

                {modulosDisponibles.map((modulo) => (
                  <option key={modulo} value={modulo}>
                    {modulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Acción</label>
              <select
                className="form-select"
                value={accionFilter}
                onChange={(event) => {
                  setAccionFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas</option>

                {accionesDisponibles.map((accion) => (
                  <option key={accion} value={accion}>
                    {accion}
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
              Mostrando {paginatedLogs.length} de {filteredLogs.length}{' '}
              resultado(s)
            </span>

            <span className="text-muted small">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="alert alert-warning mb-0">
              No hay eventos que coincidan con los filtros.
            </div>
          ) : (
            <>
              <div className="table-responsive modern-table-wrapper">
                <table className="table align-middle modern-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Usuario</th>
                      <th>Acción</th>
                      <th>Módulo</th>
                      <th>IP</th>
                      <th className="text-end">Detalle</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <div className="news-title">#{log.id}</div>
                          <div className="news-slug">
                            {formatDate(log.created_at)}
                          </div>
                        </td>

                        <td>
                          {log.usuario ? (
                            <>
                              <div className="news-title">
                                {log.usuario.nombre} {log.usuario.apellido}
                              </div>
                              <div className="news-slug">
                                {log.usuario.username}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted small">
                              Usuario público / sistema
                            </span>
                          )}
                        </td>

                        <td>
                          <span className={getActionBadge(log.accion)}>
                            {log.accion}
                          </span>
                        </td>

                        <td>
                          <span className="country-pill">
                            {log.modulo}
                          </span>
                        </td>

                        <td>
                          <span className="text-muted small">
                            {log.ip || 'Sin IP'}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex justify-content-end">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openDetailModal(log)}
                            >
                              <i className="bi bi-eye me-1" />
                              Ver
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

      {detailModal.show && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <div className="custom-modal-icon">
              <i className="bi bi-activity" />
            </div>

            <h5>Detalle del evento</h5>

            <div className="mb-3">
              <small className="text-muted d-block">Acción</small>
              <strong>{detailModal.log?.accion}</strong>
            </div>

            <div className="mb-3">
              <small className="text-muted d-block">Módulo</small>
              <strong>{detailModal.log?.modulo}</strong>
            </div>

            <div className="mb-3">
              <small className="text-muted d-block">Descripción</small>
              <p className="mb-0">
                {detailModal.log?.descripcion || 'Sin descripción'}
              </p>
            </div>

            <div className="mb-3">
              <small className="text-muted d-block">IP</small>
              <strong>{detailModal.log?.ip || 'Sin IP'}</strong>
            </div>

            <div className="mb-3">
              <small className="text-muted d-block">Fecha</small>
              <strong>{formatDate(detailModal.log?.created_at)}</strong>
            </div>

            <div className="d-flex justify-content-end">
              <button
                className="btn btn-outline-secondary"
                onClick={closeDetailModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deactivateUser,
  deleteUserPermanently,
  getUsers
} from '../../services/userService';

const ITEMS_PER_PAGE = 5;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    user: null,
    type: ''
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadUsers]);

  const rolesDisponibles = useMemo(() => {
    const rolesMap = new Map();

    users.forEach((user) => {
      if (user.rol?.id) {
        rolesMap.set(user.rol.id, user.rol);
      }
    });

    return Array.from(rolesMap.values());
  }, [users]);

  const paisesDisponibles = useMemo(() => {
    const paisesMap = new Map();

    users.forEach((user) => {
      if (user.pais?.id) {
        paisesMap.set(user.pais.id, user.pais);
      }
    });

    return Array.from(paisesMap.values());
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        user.nombre?.toLowerCase().includes(searchValue) ||
        user.apellido?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue) ||
        user.username?.toLowerCase().includes(searchValue);

      const matchesRole =
        !roleFilter || Number(user.rol?.id) === Number(roleFilter);

      const matchesCountry =
        !countryFilter || Number(user.pais?.id) === Number(countryFilter);

      const matchesEstado =
        !estadoFilter || user.estado === estadoFilter;

      return matchesSearch && matchesRole && matchesCountry && matchesEstado;
    });
  }, [users, search, roleFilter, countryFilter, estadoFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const totalActivos = users.filter((user) => user.estado === 'activo').length;

  const totalInactivos = users.filter(
    (user) => user.estado === 'inactivo'
  ).length;

  const totalSuperadmin = users.filter(
    (user) => user.rol?.nombre === 'superadmin'
  ).length;

  function clearFilters() {
    setSearch('');
    setRoleFilter('');
    setCountryFilter('');
    setEstadoFilter('');
    setCurrentPage(1);
  }

  function getEstadoBadge(estado) {
    if (estado === 'activo') return 'status-badge status-published';
    return 'status-badge status-unpublished';
  }

  function openDeleteModal(user, type) {
    setDeleteModal({
      show: true,
      user,
      type
    });
  }

  function closeDeleteModal() {
    setDeleteModal({
      show: false,
      user: null,
      type: ''
    });
  }

  async function confirmAction() {
    if (!deleteModal.user) return;

    setMessage('');
    setError('');

    try {
      if (deleteModal.type === 'deactivate') {
        await deactivateUser(deleteModal.user.id);
        setMessage('Usuario desactivado correctamente');
      }

      if (deleteModal.type === 'permanent') {
        await deleteUserPermanently(deleteModal.user.id);
        setMessage('Usuario eliminado definitivamente');
      }

      closeDeleteModal();
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar usuario');
    }
  }

  function handlePageChange(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  if (loading) {
    return (
      <div>
        <h1 className="fw-bold">Usuarios</h1>
        <div className="alert alert-info">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">Usuarios</h1>
          <p className="text-muted mb-0">
            Administra usuarios, roles, países y estados del CMS.
          </p>
        </div>

        <Link to="/admin/users/create" className="btn btn-primary">
          <i className="bi bi-person-plus-fill me-2" />
          Nuevo usuario
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="metric-card">
            <small>Total usuarios</small>
            <h3>{users.length}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Activos</small>
            <h3 className="text-success">{totalActivos}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Inactivos</small>
            <h3 className="text-secondary">{totalInactivos}</h3>
          </div>
        </div>

        <div className="col-md-3">
          <div className="metric-card">
            <small>Superadmin</small>
            <h3 className="text-primary">{totalSuperadmin}</h3>
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
                placeholder="Nombre, usuario o correo..."
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Rol</label>
              <select
                className="form-select"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos</option>

                {rolesDisponibles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">País</label>
              <select
                className="form-select"
                value={countryFilter}
                onChange={(event) => {
                  setCountryFilter(event.target.value);
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
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="col-md-1">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                <i className="bi bi-x-lg" />
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
              Mostrando {paginatedUsers.length} de {filteredUsers.length}{' '}
              resultado(s)
            </span>

            <span className="text-muted small">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="alert alert-warning mb-0">
              No hay usuarios que coincidan con los filtros.
            </div>
          ) : (
            <>
              <div className="table-responsive modern-table-wrapper">
                <table className="table align-middle modern-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>País</th>
                      <th>Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="news-title">
                            #{user.id} {user.nombre} {user.apellido}
                          </div>
                          <div className="news-slug">{user.username}</div>
                        </td>

                        <td>{user.email}</td>

                        <td>
                          <span className="country-pill">
                            {user.rol?.nombre || 'Sin rol'}
                          </span>
                        </td>

                        <td>
                          <span className="text-muted small">
                            {user.pais?.nombre || 'Global'}
                          </span>
                        </td>

                        <td>
                          <span className={getEstadoBadge(user.estado)}>
                            {user.estado}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2 justify-content-end flex-wrap">
                            <Link
                              to={`/admin/users/${user.id}/edit`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-pencil-square me-1" />
                              Editar
                            </Link>

                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                openDeleteModal(user, 'deactivate')
                              }
                              disabled={user.estado === 'inactivo'}
                            >
                              <i className="bi bi-person-dash me-1" />
                              Desactivar
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                openDeleteModal(user, 'permanent')
                              }
                              disabled={user.rol?.nombre === 'superadmin'}
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

            <h5>
              {deleteModal.type === 'deactivate'
                ? 'Desactivar usuario'
                : 'Eliminar usuario'}
            </h5>

            <p>
              ¿Seguro que deseas{' '}
              {deleteModal.type === 'deactivate'
                ? 'desactivar'
                : 'eliminar definitivamente'}{' '}
              el usuario{' '}
              <strong>{deleteModal.user?.username}</strong>?
            </p>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>

              <button className="btn btn-danger" onClick={confirmAction}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getDashboardData } from '../../services/dashboardService';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  const [data, setData] = useState({
    noticias: [],
    testimonios: [],
    solicitudes: [],
    usuarios: [],
    auditoria: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const result = await getDashboardData();
        setData(result);
      } catch {
        setError('Error al cargar información del dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const noticiasPublicadas = data.noticias.filter(
      (item) => item.estado === 'publicado'
    ).length;

    const testimoniosPublicados = data.testimonios.filter(
      (item) => item.estado === 'publicado'
    ).length;

    const testimoniosDestacados = data.testimonios.filter(
      (item) => item.destacado
    ).length;

    const solicitudesPendientes = data.solicitudes.filter(
      (item) => item.estado === 'pendiente'
    ).length;

    const solicitudesProceso = data.solicitudes.filter(
      (item) => item.estado === 'en_proceso'
    ).length;

    const solicitudesGestionadas = data.solicitudes.filter(
      (item) => item.estado === 'gestionada'
    ).length;

    const usuariosActivos = data.usuarios.filter(
      (item) => item.estado === 'activo'
    ).length;

    return {
      noticiasPublicadas,
      testimoniosPublicados,
      testimoniosDestacados,
      solicitudesPendientes,
      solicitudesProceso,
      solicitudesGestionadas,
      usuariosActivos
    };
  }, [data]);

  const ultimasSolicitudes = data.solicitudes.slice(0, 5);
  const ultimasNoticias = data.noticias.slice(0, 5);
  const ultimosLogs = data.auditoria.slice(0, 5);

  if (loading) {
    return (
      <div>
        <h1 className="fw-bold">Dashboard</h1>
        <div className="alert alert-info">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-hero mb-4">
        <div>
          <span className="dashboard-label">Panel general</span>
          <h1>Bienvenido, {user?.nombre}</h1>
          <p>
            Resumen administrativo del CMS Multipaís: contenidos, solicitudes,
            usuarios y actividad reciente.
          </p>
        </div>

        <div className="dashboard-hero-icon">
          <i className="bi bi-speedometer2" />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="dashboard-card">
            <div className="dashboard-card-icon purple">
              <i className="bi bi-newspaper" />
            </div>
            <small>Noticias</small>
            <h3>{data.noticias.length}</h3>
            <span>{stats.noticiasPublicadas} publicadas</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card">
            <div className="dashboard-card-icon blue">
              <i className="bi bi-chat-quote-fill" />
            </div>
            <small>Testimonios</small>
            <h3>{data.testimonios.length}</h3>
            <span>{stats.testimoniosDestacados} destacados</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="dashboard-card">
            <div className="dashboard-card-icon orange">
              <i className="bi bi-envelope-paper-fill" />
            </div>
            <small>Solicitudes</small>
            <h3>{data.solicitudes.length}</h3>
            <span>{stats.solicitudesPendientes} pendientes</span>
          </div>
        </div>

        {user?.rol === 'superadmin' && (
          <div className="col-md-3">
            <div className="dashboard-card">
              <div className="dashboard-card-icon green">
                <i className="bi bi-people-fill" />
              </div>

              <small>Usuarios activos</small>

              <h3>{stats.usuariosActivos}</h3>

              <span>{data.usuarios.length} registrados</span>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Estado de solicitudes</h5>

              <DashboardBar
                label="Pendientes"
                value={stats.solicitudesPendientes}
                total={data.solicitudes.length}
              />

              <DashboardBar
                label="En proceso"
                value={stats.solicitudesProceso}
                total={data.solicitudes.length}
              />

              <DashboardBar
                label="Gestionadas"
                value={stats.solicitudesGestionadas}
                total={data.solicitudes.length}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Accesos rápidos</h5>

              <div className="dashboard-actions">
                <Link to="/admin/noticias/create" className="dashboard-action">
                  <i className="bi bi-plus-circle" />
                  Nueva noticia
                </Link>

                <Link
                  to="/admin/testimonios/create"
                  className="dashboard-action"
                >
                  <i className="bi bi-chat-quote" />
                  Nuevo testimonio
                </Link>

                <Link to="/admin/solicitudes" className="dashboard-action">
                  <i className="bi bi-envelope" />
                  Ver solicitudes
                </Link>

                <Link to="/admin/profile" className="dashboard-action">
                  <i className="bi bi-person-circle" />
                  Mi perfil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <DashboardList
            title="Últimas solicitudes"
            empty="No hay solicitudes registradas."
            items={ultimasSolicitudes.map((item) => ({
              id: item.id,
              title: item.nombre,
              subtitle: `${item.correo} · ${item.estado}`,
              to: `/admin/solicitudes/${item.id}/edit`
            }))}
          />
        </div>

        <div className="col-lg-4">
          <DashboardList
            title="Últimas noticias"
            empty="No hay noticias registradas."
            items={ultimasNoticias.map((item) => ({
              id: item.id,
              title: item.titulo,
              subtitle: `${item.pais?.nombre || 'Sin país'} · ${item.estado}`,
              to: `/admin/noticias/${item.id}/edit`
            }))}
          />
        </div>

        {user?.rol === 'superadmin' && (
            <div className="col-lg-4">
              <DashboardList
                title="Actividad reciente"
                empty="No hay auditoría disponible."
                items={ultimosLogs.map((item) => ({
                  id: item.id,
                  title: item.accion,
                  subtitle: `${item.modulo} · ${formatDate(item.created_at)}`
                }))}
              />
            </div>
          )}
      </div>
    </div>
  );
}

function DashboardBar({ label, value, total }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="dashboard-bar-item">
      <div className="d-flex justify-content-between">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="dashboard-bar">
        <div style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DashboardList({ title, items, empty }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{title}</h5>

        {items.length === 0 ? (
          <div className="alert alert-warning mb-0">{empty}</div>
        ) : (
          <div className="dashboard-list">
            {items.map((item) =>
              item.to ? (
                <Link
                  key={item.id}
                  to={item.to}
                  className="dashboard-list-item"
                >
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </Link>
              ) : (
                <div key={item.id} className="dashboard-list-item">
                  <strong>{item.title}</strong>
                  <span>{item.subtitle}</span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString();
}
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import axiosClient from '../../api/axiosClient';

import {
  getSolicitudById,
  updateSolicitud
} from '../../services/solicitudService';

export default function SolicitudFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paises, setPaises] = useState([]);

  const [form, setForm] = useState({
    pais_id: '',
    nombre: '',
    correo: '',
    telefono: '',
    finalidad: '',
    mensaje: '',
    estado: 'pendiente',
    observaciones_admin: ''
  });

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [metadata, setMetadata] = useState({
    created_at: '',
    updated_at: '',
    fecha_gestion: '',
    gestionado_por: null
  });

  useEffect(() => {
    async function loadPaises() {
      try {
        const response = await axiosClient.get('/paises');
        setPaises(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar países');
      }
    }

    loadPaises();
  }, []);

  useEffect(() => {
    async function loadSolicitud() {
      try {
        setLoadingData(true);

        const data = await getSolicitudById(id);

        setForm({
          pais_id: data.pais?.id || '',
          nombre: data.nombre || '',
          correo: data.correo || '',
          telefono: data.telefono || '',
          finalidad: data.finalidad || '',
          mensaje: data.mensaje || '',
          estado: data.estado || 'pendiente',
          observaciones_admin: data.observaciones_admin || ''
        });

        setMetadata({
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
          fecha_gestion: data.fecha_gestion || '',
          gestionado_por: data.gestionado_por || data.gestionadoPor || null
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar solicitud');
      } finally {
        setLoadingData(false);
      }
    }

    loadSolicitud();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function formatDate(value) {
    if (!value) return 'Sin información';

    return new Date(value).toLocaleString();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        pais_id: Number(form.pais_id)
      };

      await updateSolicitud(id, payload);

      setMessage('Solicitud actualizada correctamente');

      setTimeout(() => {
        navigate('/admin/solicitudes');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar solicitud');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div>
        <h1 className="fw-bold">Solicitudes</h1>
        <div className="alert alert-info">Cargando información...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="fw-bold mb-1">Ver / editar solicitud</h1>
          <p className="text-muted mb-0">
            Revisa la información enviada por el visitante y registra la gestión administrativa.
          </p>
        </div>

        <Link to="/admin/solicitudes" className="btn btn-outline-secondary">
          Volver
        </Link>
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

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">País</label>
                    <select
                      className="form-select"
                      name="pais_id"
                      value={form.pais_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione un país</option>

                      {paises.map((pais) => (
                        <option key={pais.id} value={pais.id}>
                          {pais.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      required
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="gestionada">Gestionada</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input
                      className="form-control"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Correo</label>
                    <input
                      className="form-control"
                      type="email"
                      name="correo"
                      value={form.correo}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      className="form-control"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Finalidad</label>
                    <select
                      className="form-select"
                      name="finalidad"
                      value={form.finalidad}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione una finalidad</option>
                      <option value="Servicio">Servicio</option>
                      <option value="Programa EDIFICA">Programa EDIFICA</option>
                      <option value="Shows y conferencias">
                        Shows y conferencias
                      </option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Mensaje del visitante</label>
                    <textarea
                      className="form-control"
                      name="mensaje"
                      rows="4"
                      value={form.mensaje}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">
                      Observaciones administrativas
                    </label>
                    <textarea
                      className="form-control"
                      name="observaciones_admin"
                      rows="5"
                      value={form.observaciones_admin}
                      onChange={handleChange}
                      placeholder="Ejemplo: Se contactó al usuario por teléfono..."
                    />
                  </div>
                </div>

                <button className="btn btn-primary mt-4" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h5 className="fw-bold">Resumen</h5>

              <div className="mb-3">
                <small className="text-muted d-block">Estado actual</small>
                <strong>{form.estado}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Finalidad</small>
                <strong>{form.finalidad || 'Sin finalidad'}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Correo</small>
                <strong>{form.correo}</strong>
              </div>

              <div>
                <small className="text-muted d-block">Teléfono</small>
                <strong>{form.telefono}</strong>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold">Trazabilidad</h5>

              <div className="mb-3">
                <small className="text-muted d-block">Creada</small>
                <strong>{formatDate(metadata.created_at)}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Actualizada</small>
                <strong>{formatDate(metadata.updated_at)}</strong>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Fecha de gestión</small>
                <strong>{formatDate(metadata.fecha_gestion)}</strong>
              </div>

              <div>
                <small className="text-muted d-block">Gestionado por</small>
                <strong>
                  {metadata.gestionado_por
                    ? `${metadata.gestionado_por.nombre || ''} ${
                        metadata.gestionado_por.apellido || ''
                      }`
                    : 'Sin gestor'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import axiosClient from '../../api/axiosClient';

import {
  createTestimonio,
  getTestimonioById,
  updateTestimonio,
  uploadTestimonioFoto
} from '../../services/testimonioService';

export default function TestimonioFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [paises, setPaises] = useState([]);

  const [form, setForm] = useState({
    pais_id: '',
    nombre: '',
    cargo: '',
    empresa: '',
    contenido: '',
    foto_url: '',
    instagram_url: '',
    facebook_url: '',
    estado: 'borrador',
    destacado: false
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    async function loadTestimonio() {
      if (!isEdit) return;

      try {
        setLoadingData(true);

        const data = await getTestimonioById(id);

        setForm({
          pais_id: data.pais?.id || '',
          nombre: data.nombre || '',
          cargo: data.cargo || '',
          empresa: data.empresa || '',
          contenido: data.contenido || '',
          foto_url: data.foto_url || '',
          instagram_url: data.instagram_url || '',
          facebook_url: data.facebook_url || '',
          estado: data.estado || 'borrador',
          destacado: Boolean(data.destacado)
        });

        setPreview(data.foto_url || '');
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar testimonio');
      } finally {
        setLoadingData(false);
      }
    }

    loadTestimonio();
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'foto_url') {
      setPreview(value);
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      setFile(null);
      setPreview(form.foto_url || '');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');
    setError('');
    setLoading(true);

    try {
      if (!form.foto_url && !file && !isEdit) {
        setError('Debes escribir una URL de foto o subir una imagen');
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        pais_id: Number(form.pais_id),
        foto_url: form.foto_url || 'pendiente'
      };

      let testimonioId = id;

      if (isEdit) {
        await updateTestimonio(id, payload);
      } else {
        const result = await createTestimonio(payload);
        testimonioId = result.testimonio.id;
      }

      if (file) {
        await uploadTestimonioFoto(testimonioId, file);
      }

      setMessage(
        isEdit
          ? 'Testimonio actualizado correctamente'
          : 'Testimonio creado correctamente'
      );

      setTimeout(() => {
        navigate('/admin/testimonios');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar testimonio');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div>
        <h1 className="fw-bold">Testimonios</h1>
        <div className="alert alert-info">Cargando información...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">
            {isEdit ? 'Editar testimonio' : 'Nuevo testimonio'}
          </h1>

          <p className="text-muted">
            Gestiona testimonios, fotos, redes sociales y estado de publicación.
          </p>
        </div>

        <Link to="/admin/testimonios" className="btn btn-outline-secondary">
          Volver
        </Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

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

              <div className="col-md-3">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                  <option value="despublicado">Despublicado</option>
                </select>
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="destacado"
                    checked={form.destacado}
                    onChange={handleChange}
                    id="destacado"
                  />
                  <label className="form-check-label" htmlFor="destacado">
                    Destacado
                  </label>
                </div>
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

              <div className="col-md-3">
                <label className="form-label">Cargo</label>
                <input
                  className="form-control"
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Empresa</label>
                <input
                  className="form-control"
                  name="empresa"
                  value={form.empresa}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Contenido</label>
                <textarea
                  className="form-control"
                  name="contenido"
                  rows="6"
                  value={form.contenido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">URL manual de foto</label>
                <input
                  className="form-control"
                  name="foto_url"
                  value={form.foto_url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/foto.jpg"
                  required={!file && !isEdit}
                />
                <small className="text-muted">
                  Puedes usar una URL manual o subir una foto.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label">Subir foto</label>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!form.foto_url && !isEdit}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Instagram URL</label>
                <input
                  className="form-control"
                  name="instagram_url"
                  value={form.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/usuario"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Facebook URL</label>
                <input
                  className="form-control"
                  name="facebook_url"
                  value={form.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/usuario"
                />
              </div>

              {preview && (
                <div className="col-12">
                  <label className="form-label">Vista previa</label>

                  <div>
                    <img
                      src={preview}
                      alt="Vista previa"
                      style={{
                        width: '180px',
                        height: '180px',
                        objectFit: 'cover',
                        borderRadius: '24px'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-primary mt-4" disabled={loading}>
              {loading
                ? 'Guardando...'
                : isEdit
                  ? 'Actualizar testimonio'
                  : 'Crear testimonio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
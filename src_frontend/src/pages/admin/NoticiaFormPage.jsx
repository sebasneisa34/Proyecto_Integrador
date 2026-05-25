import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createNoticia,
  getNoticiaById,
  updateNoticia,
  uploadNoticiaImage
} from '../../services/noticiaService';
import axiosClient from '../../api/axiosClient';

export default function NoticiaFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [paises, setPaises] = useState([]);
  const [form, setForm] = useState({
    pais_id: '',
    titulo: '',
    resumen: '',
    contenido: '',
    imagen_principal_url: '',
    estado: 'borrador'
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
    async function loadNoticia() {
      if (!isEdit) return;

      try {
        setLoadingData(true);

        const data = await getNoticiaById(id);

        setForm({
          pais_id: data.pais?.id || '',
          titulo: data.titulo || '',
          resumen: data.resumen || '',
          contenido: data.contenido || '',
          imagen_principal_url: data.imagen_principal_url || '',
          estado: data.estado || 'borrador'
        });

        setPreview(data.imagen_principal_url || '');
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar noticia');
      } finally {
        setLoadingData(false);
      }
    }

    loadNoticia();
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      setFile(null);
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
      const payload = {
        ...form,
        pais_id: Number(form.pais_id)
      };

      let noticiaId = id;

      if (isEdit) {
        await updateNoticia(id, payload);
      } else {
        const result = await createNoticia(payload);
        noticiaId = result.noticia.id;
      }

      if (file) {
        await uploadNoticiaImage(noticiaId, file);
      }

      setMessage(
        isEdit
          ? 'Noticia actualizada correctamente'
          : 'Noticia creada correctamente'
      );

      setTimeout(() => {
        navigate('/admin/noticias');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar noticia');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div>
        <h1 className="fw-bold">Noticias</h1>
        <div className="alert alert-info">Cargando información...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">
            {isEdit ? 'Editar noticia' : 'Nueva noticia'}
          </h1>
          <p className="text-muted">
            Gestiona el contenido informativo del portal público.
          </p>
        </div>

        <Link to="/admin/noticias" className="btn btn-outline-secondary">
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

              <div className="col-md-6">
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

              <div className="col-12">
                <label className="form-label">Título</label>
                <input
                  className="form-control"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Resumen</label>
                <textarea
                  className="form-control"
                  name="resumen"
                  rows="3"
                  value={form.resumen}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Contenido</label>
                <textarea
                  className="form-control"
                  name="contenido"
                  rows="7"
                  value={form.contenido}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">URL manual de imagen</label>
                <input
                  className="form-control"
                  name="imagen_principal_url"
                  value={form.imagen_principal_url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="text-muted">
                  Puedes usar URL manual o subir una imagen.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label">Subir imagen</label>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
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
                        width: '220px',
                        height: '130px',
                        objectFit: 'cover',
                        borderRadius: '16px'
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
                  ? 'Actualizar noticia'
                  : 'Crear noticia'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
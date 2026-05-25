import {
  getNoticias,
  getNoticiaById,
  createNoticia,
  updateNoticia,
  patchNoticia,
  changeEstadoNoticia,
  deleteNoticia,
  updateNoticiaImage
} from '../services/noticiaService.js';

import { uploadFileToStorage, createArchivo } from '../services/archivoService.js';

import { createAuditLog } from '../services/auditService.js';

const estadosPermitidos = ['borrador', 'publicado', 'despublicado'];

function validateEstado(estado) {
  return estadosPermitidos.includes(estado);
}

function validateRequiredFields(body) {
  const { titulo, resumen, contenido, pais_id, estado } = body;

  if (!titulo || !resumen || !contenido || !pais_id || !estado) {
    return 'Título, resumen, contenido, país y estado son obligatorios';
  }

  if (!validateEstado(estado)) {
    return 'Estado inválido. Use: borrador, publicado o despublicado';
  }

  return null;
}

function validateCountryPermission(user, paisId) {
  if (user.rol === 'superadmin') return true;

  return Number(user.pais_id) === Number(paisId);
}

export async function listNoticias(req, res) {
  try {
    const noticias = await getNoticias(req.user);
    res.json(noticias);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function getNoticiaDetail(req, res) {
  try {
    const { id } = req.params;

    const noticia = await getNoticiaById(id, req.user);

    if (!noticia) {
      return res.status(404).json({
        error: 'Noticia no encontrada o no autorizada'
      });
    }

    res.json(noticia);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function addNoticia(req, res) {
  try {
    const validationError = validateRequiredFields(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    if (!validateCountryPermission(req.user, req.body.pais_id)) {
      return res.status(403).json({
        error: 'No puedes crear noticias para un país diferente al asignado'
      });
    }

    const noticia = await createNoticia(req.body, req.user);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'crear_noticia',
      modulo: 'noticias',
      registro_id: noticia.id,
      descripcion: `Creó la noticia ${noticia.titulo}`,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Noticia creada correctamente',
      noticia
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editNoticia(req, res) {
  try {
    const { id } = req.params;

    const validationError = validateRequiredFields(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    if (!validateCountryPermission(req.user, req.body.pais_id)) {
      return res.status(403).json({
        error: 'No puedes editar noticias de un país diferente al asignado'
      });
    }

    const noticia = await updateNoticia(id, req.body, req.user);

    if (!noticia) {
      return res.status(404).json({
        error: 'Noticia no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_noticia',
      modulo: 'noticias',
      registro_id: noticia.id,
      descripcion: `Actualizó la noticia ${noticia.titulo}`,
      ip: req.ip
    });

    res.json({
      message: 'Noticia actualizada correctamente',
      noticia
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editNoticiaPartial(req, res) {
  try {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Debes enviar al menos un campo para actualizar'
      });
    }

    if (req.body.estado !== undefined && !validateEstado(req.body.estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Use: borrador, publicado o despublicado'
      });
    }

    if (
      req.body.pais_id !== undefined &&
      !validateCountryPermission(req.user, req.body.pais_id)
    ) {
      return res.status(403).json({
        error: 'No puedes mover noticias a un país diferente al asignado'
      });
    }

    const noticia = await patchNoticia(id, req.body, req.user);

    if (!noticia) {
      return res.status(404).json({
        error: 'Noticia no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_noticia_parcial',
      modulo: 'noticias',
      registro_id: noticia.id,
      descripcion: `Actualizó parcialmente la noticia ${noticia.titulo}`,
      ip: req.ip
    });

    res.json({
      message: 'Noticia actualizada parcialmente',
      noticia
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function updateEstadoNoticia(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !validateEstado(estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Use: borrador, publicado o despublicado'
      });
    }

    const noticia = await changeEstadoNoticia(id, estado, req.user);

    if (!noticia) {
      return res.status(404).json({
        error: 'Noticia no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'cambiar_estado_noticia',
      modulo: 'noticias',
      registro_id: noticia.id,
      descripcion: `Cambió el estado de la noticia a ${noticia.estado}`,
      ip: req.ip
    });

    res.json({
      message: 'Estado de noticia actualizado correctamente',
      noticia
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function removeNoticia(req, res) {
  try {
    const { id } = req.params;

    const noticia = await deleteNoticia(id, req.user);

    if (!noticia) {
      return res.status(404).json({
        error: 'Noticia no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'eliminar_noticia',
      modulo: 'noticias',
      registro_id: noticia.id,
      descripcion: `Eliminó la noticia ${noticia.titulo}`,
      ip: req.ip
    });

    res.json({
      message: 'Noticia eliminada correctamente',
      noticia
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function uploadNoticiaImagen(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        error: 'Debes enviar una imagen en el campo file'
      });
    }

    const existingNoticia = await getNoticiaById(id, req.user);

    if (!existingNoticia) {
      return res.status(404).json({
        error: 'Noticia no encontrada o no autorizada'
      });
    }

    const uploadedFile = await uploadFileToStorage(req.file, 'noticias');

    const archivo = await createArchivo(
      {
        ...uploadedFile,
        modulo: 'noticias',
        referencia_id: id
      },
      req.user
    );

    const noticia = await updateNoticiaImage(id, archivo.url, req.user);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'subir_imagen_noticia',
      modulo: 'noticias',
      registro_id: noticia.id,
      descripcion: `Subió imagen para la noticia ${noticia.titulo}`,
      ip: req.ip
    });

    res.json({
      message: 'Imagen de noticia actualizada correctamente',
      archivo,
      noticia
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

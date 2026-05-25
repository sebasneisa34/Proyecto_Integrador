import {
  getTestimonios,
  getTestimonioById,
  createTestimonio,
  updateTestimonio,
  patchTestimonio,
  changeEstadoTestimonio,
  deleteTestimonio,
  updateTestimonioFoto 
} from '../services/testimonioService.js';

import { uploadFileToStorage, createArchivo } from '../services/archivoService.js';

import { createAuditLog } from '../services/auditService.js';

const estadosPermitidos = ['borrador', 'publicado', 'despublicado'];

function validateEstado(estado) {
  return estadosPermitidos.includes(estado);
}

function validateRequiredFields(body) {
  const { pais_id, nombre, contenido, foto_url, estado } = body;

  if (!pais_id || !nombre || !contenido || !foto_url || !estado) {
    return 'País, nombre, contenido, foto URL y estado son obligatorios';
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

export async function listTestimonios(req, res) {
  try {
    const testimonios = await getTestimonios(req.user);
    res.json(testimonios);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function getTestimonioDetail(req, res) {
  try {
    const { id } = req.params;

    const testimonio = await getTestimonioById(id, req.user);

    if (!testimonio) {
      return res.status(404).json({
        error: 'Testimonio no encontrado o no autorizado'
      });
    }

    res.json(testimonio);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function addTestimonio(req, res) {
  try {
    const validationError = validateRequiredFields(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    if (!validateCountryPermission(req.user, req.body.pais_id)) {
      return res.status(403).json({
        error: 'No puedes crear testimonios para un país diferente al asignado'
      });
    }

    const testimonio = await createTestimonio(req.body, req.user);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'crear_testimonio',
      modulo: 'testimonios',
      registro_id: testimonio.id,
      descripcion: `Creó el testimonio de ${testimonio.nombre}`,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Testimonio creado correctamente',
      testimonio
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editTestimonio(req, res) {
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
        error: 'No puedes editar testimonios de un país diferente al asignado'
      });
    }

    const testimonio = await updateTestimonio(id, req.body, req.user);

    if (!testimonio) {
      return res.status(404).json({
        error: 'Testimonio no encontrado o no autorizado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_testimonio',
      modulo: 'testimonios',
      registro_id: testimonio.id,
      descripcion: `Actualizó el testimonio de ${testimonio.nombre}`,
      ip: req.ip
    });

    res.json({
      message: 'Testimonio actualizado correctamente',
      testimonio
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editTestimonioPartial(req, res) {
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
        error: 'No puedes mover testimonios a un país diferente al asignado'
      });
    }

    const testimonio = await patchTestimonio(id, req.body, req.user);

    if (!testimonio) {
      return res.status(404).json({
        error: 'Testimonio no encontrado o no autorizado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_testimonio_parcial',
      modulo: 'testimonios',
      registro_id: testimonio.id,
      descripcion: `Actualizó parcialmente el testimonio de ${testimonio.nombre}`,
      ip: req.ip
    });

    res.json({
      message: 'Testimonio actualizado parcialmente',
      testimonio
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function updateEstadoTestimonio(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !validateEstado(estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Use: borrador, publicado o despublicado'
      });
    }

    const testimonio = await changeEstadoTestimonio(id, estado, req.user);

    if (!testimonio) {
      return res.status(404).json({
        error: 'Testimonio no encontrado o no autorizado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'cambiar_estado_testimonio',
      modulo: 'testimonios',
      registro_id: testimonio.id,
      descripcion: `Cambió el estado del testimonio a ${testimonio.estado}`,
      ip: req.ip
    });

    res.json({
      message: 'Estado de testimonio actualizado correctamente',
      testimonio
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function removeTestimonio(req, res) {
  try {
    const { id } = req.params;

    const testimonio = await deleteTestimonio(id, req.user);

    if (!testimonio) {
      return res.status(404).json({
        error: 'Testimonio no encontrado o no autorizado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'eliminar_testimonio',
      modulo: 'testimonios',
      registro_id: testimonio.id,
      descripcion: `Eliminó el testimonio de ${testimonio.nombre}`,
      ip: req.ip
    });

    res.json({
      message: 'Testimonio eliminado correctamente',
      testimonio
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function uploadTestimonioFoto(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        error: 'Debes enviar una imagen en el campo file'
      });
    }

    const existingTestimonio = await getTestimonioById(id, req.user);

    if (!existingTestimonio) {
      return res.status(404).json({
        error: 'Testimonio no encontrado o no autorizado'
      });
    }

    const uploadedFile = await uploadFileToStorage(req.file, 'testimonios');

    const archivo = await createArchivo(
      {
        ...uploadedFile,
        modulo: 'testimonios',
        referencia_id: id
      },
      req.user
    );

    const testimonio = await updateTestimonioFoto(id, archivo.url, req.user);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'subir_foto_testimonio',
      modulo: 'testimonios',
      registro_id: testimonio.id,
      descripcion: `Subió foto para el testimonio de ${testimonio.nombre}`,
      ip: req.ip
    });

    res.json({
      message: 'Foto de testimonio actualizada correctamente',
      archivo,
      testimonio
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
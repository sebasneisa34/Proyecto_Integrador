import {
  getArchivos,
  getArchivoById,
  createArchivo,
  updateArchivo,
  patchArchivo,
  deleteArchivo,
  uploadFileToStorage
} from '../services/archivoService.js';

import { createAuditLog } from '../services/auditService.js';

const modulosPermitidos = [
  'noticias',
  'testimonios',
  'solicitudes_contacto',
  'general'
];

function validateModulo(modulo) {
  return modulosPermitidos.includes(modulo);
}

function validateRequiredFields(body) {
  const { nombre_archivo, url, tipo_archivo, modulo } = body;

  if (!nombre_archivo || !url || !tipo_archivo || !modulo) {
    return 'Nombre de archivo, URL, tipo de archivo y módulo son obligatorios';
  }

  if (!validateModulo(modulo)) {
    return 'Módulo inválido. Use: noticias, testimonios, solicitudes_contacto o general';
  }

  return null;
}

export async function listArchivos(req, res) {
  try {
    const archivos = await getArchivos();
    res.json(archivos);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function getArchivoDetail(req, res) {
  try {
    const { id } = req.params;

    const archivo = await getArchivoById(id);

    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado'
      });
    }

    res.json(archivo);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function addArchivo(req, res) {
  try {
    const validationError = validateRequiredFields(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const archivo = await createArchivo(req.body, req.user);

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'crear_archivo',
      modulo: 'archivos',
      registro_id: archivo.id,
      descripcion: `Registró el archivo ${archivo.nombre_archivo}`,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Archivo registrado correctamente',
      archivo
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function uploadArchivo(req, res) {
  try {
    const { modulo, referencia_id } = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: 'Debes enviar un archivo en el campo file'
      });
    }

    if (!modulo || !validateModulo(modulo)) {
      return res.status(400).json({
        error: 'Módulo inválido. Use: noticias, testimonios, solicitudes_contacto o general'
      });
    }

    const uploadedFile = await uploadFileToStorage(req.file, modulo);

    const archivo = await createArchivo(
      {
        ...uploadedFile,
        modulo,
        referencia_id: referencia_id || null
      },
      req.user
    );

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'subir_archivo_storage',
      modulo: 'archivos',
      registro_id: archivo.id,
      descripcion: `Subió el archivo ${archivo.nombre_archivo} a Supabase Storage`,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Archivo subido correctamente',
      archivo
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editArchivo(req, res) {
  try {
    const { id } = req.params;

    const validationError = validateRequiredFields(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const archivo = await updateArchivo(id, req.body);

    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_archivo',
      modulo: 'archivos',
      registro_id: archivo.id,
      descripcion: `Actualizó el archivo ${archivo.nombre_archivo}`,
      ip: req.ip
    });

    res.json({
      message: 'Archivo actualizado correctamente',
      archivo
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editArchivoPartial(req, res) {
  try {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Debes enviar al menos un campo para actualizar'
      });
    }

    if (req.body.modulo !== undefined && !validateModulo(req.body.modulo)) {
      return res.status(400).json({
        error: 'Módulo inválido. Use: noticias, testimonios, solicitudes_contacto o general'
      });
    }

    const archivo = await patchArchivo(id, req.body);

    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_archivo_parcial',
      modulo: 'archivos',
      registro_id: archivo.id,
      descripcion: `Actualizó parcialmente el archivo ${archivo.nombre_archivo}`,
      ip: req.ip
    });

    res.json({
      message: 'Archivo actualizado parcialmente',
      archivo
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function removeArchivo(req, res) {
  try {
    const { id } = req.params;

    const archivo = await deleteArchivo(id);

    if (!archivo) {
      return res.status(404).json({
        error: 'Archivo no encontrado'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'eliminar_archivo',
      modulo: 'archivos',
      registro_id: archivo.id,
      descripcion: `Eliminó el archivo ${archivo.nombre_archivo}`,
      ip: req.ip
    });

    res.json({
      message: 'Archivo eliminado correctamente',
      archivo
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
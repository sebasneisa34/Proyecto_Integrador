import {
  getSolicitudes,
  getSolicitudById,
  createSolicitudPublic,
  updateSolicitud,
  patchSolicitud,
  changeEstadoSolicitud,
  deleteSolicitud
} from '../services/solicitudService.js';

import { createAuditLog } from '../services/auditService.js';

const estadosPermitidos = ['pendiente', 'en_proceso', 'gestionada', 'cerrada'];
const finalidadesPermitidas = [
  'Servicio',
  'Programa EDIFICA',
  'Shows y conferencias'
];

function validateEstado(estado) {
  return estadosPermitidos.includes(estado);
}

function validateFinalidad(finalidad) {
  return finalidadesPermitidas.includes(finalidad);
}

function validateEmail(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validateRequiredFields(body) {
  const { pais_id, nombre, correo, telefono, finalidad } = body;

  if (!pais_id || !nombre || !correo || !telefono || !finalidad) {
    return 'País, nombre, correo, teléfono y finalidad son obligatorios';
  }

  if (!validateEmail(correo)) {
    return 'El formato del correo no es válido';
  }

  if (!validateFinalidad(finalidad)) {
    return 'Finalidad inválida. Use: Servicio, Programa EDIFICA o Shows y conferencias';
  }

  return null;
}

function validateCountryPermission(user, paisId) {
  if (user.rol === 'superadmin') return true;

  return Number(user.pais_id) === Number(paisId);
}

export async function createPublicSolicitud(req, res) {
  try {
    const validationError = validateRequiredFields(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    const solicitud = await createSolicitudPublic(req.body);

    await createAuditLog({
      usuario_id: null,
      accion: 'crear_solicitud_publica',
      modulo: 'solicitudes_contacto',
      registro_id: solicitud.id,
      descripcion: `Solicitud pública creada por ${solicitud.nombre}`,
      ip: req.ip
    });

    res.status(201).json({
      message: 'Solicitud enviada correctamente',
      solicitud
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function listSolicitudes(req, res) {
  try {
    const solicitudes = await getSolicitudes(req.user);
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function getSolicitudDetail(req, res) {
  try {
    const { id } = req.params;

    const solicitud = await getSolicitudById(id, req.user);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada o no autorizada'
      });
    }

    res.json(solicitud);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editSolicitud(req, res) {
  try {
    const { id } = req.params;

    const validationError = validateRequiredFields(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError
      });
    }

    if (!req.body.estado || !validateEstado(req.body.estado)) {
      return res.status(400).json({
        error:
          'Estado inválido. Use: pendiente, en_proceso, gestionada o cerrada'
      });
    }

    if (!validateCountryPermission(req.user, req.body.pais_id)) {
      return res.status(403).json({
        error: 'No puedes editar solicitudes de un país diferente al asignado'
      });
    }

    const solicitud = await updateSolicitud(id, req.body, req.user);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_solicitud',
      modulo: 'solicitudes_contacto',
      registro_id: solicitud.id,
      descripcion: `Actualizó la solicitud ${solicitud.id}`,
      ip: req.ip
    });

    res.json({
      message: 'Solicitud actualizada correctamente',
      solicitud
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function editSolicitudPartial(req, res) {
  try {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Debes enviar al menos un campo para actualizar'
      });
    }

    if (req.body.correo !== undefined && !validateEmail(req.body.correo)) {
      return res.status(400).json({
        error: 'El formato del correo no es válido'
      });
    }

    if (
      req.body.finalidad !== undefined &&
      !validateFinalidad(req.body.finalidad)
    ) {
      return res.status(400).json({
        error:
          'Finalidad inválida. Use: Servicio, Programa EDIFICA o Shows y conferencias'
      });
    }

    if (req.body.estado !== undefined && !validateEstado(req.body.estado)) {
      return res.status(400).json({
        error:
          'Estado inválido. Use: pendiente, en_proceso, gestionada o cerrada'
      });
    }

    if (
      req.body.pais_id !== undefined &&
      !validateCountryPermission(req.user, req.body.pais_id)
    ) {
      return res.status(403).json({
        error: 'No puedes mover solicitudes a un país diferente al asignado'
      });
    }

    const solicitud = await patchSolicitud(id, req.body, req.user);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'actualizar_solicitud_parcial',
      modulo: 'solicitudes_contacto',
      registro_id: solicitud.id,
      descripcion: `Actualizó parcialmente la solicitud ${solicitud.id}`,
      ip: req.ip
    });

    res.json({
      message: 'Solicitud actualizada parcialmente',
      solicitud
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function updateEstadoSolicitud(req, res) {
  try {
    const { id } = req.params;
    const { estado, observaciones_admin } = req.body;

    if (!estado || !validateEstado(estado)) {
      return res.status(400).json({
        error:
          'Estado inválido. Use: pendiente, en_proceso, gestionada o cerrada'
      });
    }

    const solicitud = await changeEstadoSolicitud(
      id,
      estado,
      observaciones_admin,
      req.user
    );

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'cambiar_estado_solicitud',
      modulo: 'solicitudes_contacto',
      registro_id: solicitud.id,
      descripcion: `Cambió el estado de la solicitud a ${solicitud.estado}`,
      ip: req.ip
    });

    res.json({
      message: 'Estado de solicitud actualizado correctamente',
      solicitud
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function removeSolicitud(req, res) {
  try {
    const { id } = req.params;

    const solicitud = await deleteSolicitud(id, req.user);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada o no autorizada'
      });
    }

    await createAuditLog({
      usuario_id: req.user.id,
      accion: 'eliminar_solicitud',
      modulo: 'solicitudes_contacto',
      registro_id: solicitud.id,
      descripcion: `Eliminó la solicitud ${solicitud.id}`,
      ip: req.ip
    });

    res.json({
      message: 'Solicitud eliminada correctamente',
      solicitud
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
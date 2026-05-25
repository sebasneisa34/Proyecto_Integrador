import {
  getAuditLogs,
  getAuditLogById
} from '../services/auditService.js';

export async function listAuditLogs(req, res) {
  try {
    const logs = await getAuditLogs(req.user);

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function getAuditLogDetail(req, res) {
  try {
    const { id } = req.params;

    const log = await getAuditLogById(id, req.user);

    if (!log) {
      return res.status(404).json({
        error: 'Registro de auditoría no encontrado o no autorizado'
      });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
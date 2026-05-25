import { getPaises } from '../services/paisService.js';

export async function listPaises(req, res) {
  try {
    const paises = await getPaises(req.user);

    res.json(paises);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}
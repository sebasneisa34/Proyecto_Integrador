import {
  getPublicNoticiasByPaisSlug,
  getPublicNoticiaDetail,
  getPublicTestimoniosByPaisSlug,
  getPublicTestimonioDetail
} from '../services/publicService.js';

export async function listPublicNoticias(req, res) {
  try {
    const { paisSlug } = req.params;

    const noticias = await getPublicNoticiasByPaisSlug(paisSlug);

    res.json(noticias);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function getPublicNoticia(req, res) {
  try {
    const { paisSlug, noticiaSlug } = req.params;

    const noticia = await getPublicNoticiaDetail(paisSlug, noticiaSlug);

    if (!noticia) {
      return res.status(404).json({
        error: 'Noticia pública no encontrada'
      });
    }

    res.json(noticia);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function listPublicTestimonios(req, res) {
  try {
    const { paisSlug } = req.params;

    const testimonios = await getPublicTestimoniosByPaisSlug(paisSlug);

    res.json(testimonios);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

export async function getPublicTestimonio(req, res) {
  try {
    const { paisSlug, id } = req.params;

    const testimonio = await getPublicTestimonioDetail(paisSlug, id);

    if (!testimonio) {
      return res.status(404).json({
        error: 'Testimonio público no encontrado'
      });
    }

    res.json(testimonio);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}